import re
from datetime import date

from app.core.signals import evaluate_signals, run_signals

FORBIDDEN_WORDS = [
    "fraud", "corrupt", "guilt", "guilty", "wrongdoing", "blame",
    "blameworthy", "misconduct", "embezzle", "steal", "theft", "criminal",
]


def _assert_neutral(text: str):
    lowered = text.lower()
    for word in FORBIDDEN_WORDS:
        assert word not in lowered, f"forbidden word '{word}' found in: {text}"


def _insert_work(conn, category, ward_id, completed_on, work_name="Test Work"):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO works (work_name, description, category, status, completed_on, ward_id) "
            "VALUES (%s, 'desc', %s, 'completed', %s, %s) RETURNING id",
            (work_name, category, completed_on, ward_id),
        )
        return cur.fetchone()[0]


def _insert_issue_with_reports(conn, category, ward_id, recurrence_count=0, n_reports=1):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO issues (category, ward_id, status, recurrence_count, report_count) "
            "VALUES (%s, %s, 'open', %s, %s) RETURNING id",
            (category, ward_id, recurrence_count, n_reports),
        )
        issue_id = cur.fetchone()[0]
        report_ids = []
        for _ in range(n_reports):
            cur.execute(
                "INSERT INTO reports (raw_text, reported_at, category, issue_id, is_synthetic) "
                "VALUES ('r', now(), %s, %s, true) RETURNING id",
                (category, issue_id),
            )
            report_ids.append(cur.fetchone()[0])
    return issue_id, report_ids


def test_no_match_returns_empty_list_not_a_fabricated_signal(db_conn):
    issue_id, _ = _insert_issue_with_reports(db_conn, "drainage_sewage", 11)
    signals = evaluate_signals({"id": issue_id, "category": "drainage_sewage", "ward_id": 11, "recurrence_count": 0},
                                None, db_conn)
    assert signals == []


def test_valid_match_generates_a_signal_citing_exact_record_ids(db_conn):
    work_id = _insert_work(db_conn, "drainage_sewage", 11, date(2026, 3, 1))
    issue_id, report_ids = _insert_issue_with_reports(db_conn, "drainage_sewage", 11)

    signals = evaluate_signals(
        {"id": issue_id, "category": "drainage_sewage", "ward_id": 11, "recurrence_count": 0},
        {"id": 1, "work_id": work_id, "distance_m": 42.0}, db_conn,
    )
    assert len(signals) >= 1
    base = signals[0]
    assert base["source_record_ids"]["issue_id"] == issue_id
    assert base["source_record_ids"]["work_id"] == work_id
    assert set(base["source_record_ids"]["report_ids"]) == set(report_ids)
    assert str(issue_id) in base["explanation"]
    assert str(work_id) in base["explanation"]


def test_precise_match_states_a_real_distance(db_conn):
    work_id = _insert_work(db_conn, "drainage_sewage", 11, date(2026, 3, 1))
    issue_id, _ = _insert_issue_with_reports(db_conn, "drainage_sewage", 11)

    signals = evaluate_signals(
        {"id": issue_id, "category": "drainage_sewage", "ward_id": 11, "recurrence_count": 0},
        {"id": 1, "work_id": work_id, "distance_m": 42.0}, db_conn,
    )
    assert "42" in signals[0]["explanation"]
    assert "ward-level" not in signals[0]["explanation"].lower()


def test_ward_level_match_never_states_a_fabricated_distance(db_conn):
    work_id = _insert_work(db_conn, "drainage_sewage", 11, date(2026, 3, 1))
    issue_id, _ = _insert_issue_with_reports(db_conn, "drainage_sewage", 11)

    signals = evaluate_signals(
        {"id": issue_id, "category": "drainage_sewage", "ward_id": 11, "recurrence_count": 0},
        {"id": 1, "work_id": work_id, "distance_m": None}, db_conn,
    )
    assert "ward-level" in signals[0]["explanation"].lower()
    assert not re.search(r"\d+m from", signals[0]["explanation"])


def test_recurrence_signal_only_fires_above_threshold(db_conn):
    work_id = _insert_work(db_conn, "drainage_sewage", 11, date(2026, 3, 1))
    issue_id, _ = _insert_issue_with_reports(db_conn, "drainage_sewage", 11, recurrence_count=0)
    signals = evaluate_signals(
        {"id": issue_id, "category": "drainage_sewage", "ward_id": 11, "recurrence_count": 0},
        {"id": 1, "work_id": work_id, "distance_m": None}, db_conn,
    )
    assert not any(s["rule_name"] == "recurrence_with_matched_work" for s in signals)

    issue_id2, _ = _insert_issue_with_reports(db_conn, "drainage_sewage", 11, recurrence_count=2)
    signals2 = evaluate_signals(
        {"id": issue_id2, "category": "drainage_sewage", "ward_id": 11, "recurrence_count": 2},
        {"id": 1, "work_id": work_id, "distance_m": None}, db_conn,
    )
    assert any(s["rule_name"] == "recurrence_with_matched_work" for s in signals2)


def test_repeat_sanctions_signal_fires_when_multiple_same_category_works_in_ward(db_conn):
    work_id = _insert_work(db_conn, "drainage_sewage", 11, date(2026, 3, 1), "Work A")
    _insert_work(db_conn, "drainage_sewage", 11, date(2025, 10, 1), "Work B")  # another one, same ward+category
    issue_id, _ = _insert_issue_with_reports(db_conn, "drainage_sewage", 11)

    signals = evaluate_signals(
        {"id": issue_id, "category": "drainage_sewage", "ward_id": 11, "recurrence_count": 0},
        {"id": 1, "work_id": work_id, "distance_m": None}, db_conn,
    )
    repeat_signal = next((s for s in signals if s["rule_name"] == "repeat_sanctions_same_category_ward"), None)
    assert repeat_signal is not None
    assert "other_work_ids" in repeat_signal["source_record_ids"]


def test_repeat_sanctions_signal_absent_when_only_one_work_in_ward_category(db_conn):
    work_id = _insert_work(db_conn, "drainage_sewage", 11, date(2026, 3, 1), "Only Work")
    issue_id, _ = _insert_issue_with_reports(db_conn, "drainage_sewage", 11)

    signals = evaluate_signals(
        {"id": issue_id, "category": "drainage_sewage", "ward_id": 11, "recurrence_count": 0},
        {"id": 1, "work_id": work_id, "distance_m": None}, db_conn,
    )
    assert not any(s["rule_name"] == "repeat_sanctions_same_category_ward" for s in signals)


def test_all_generated_signal_text_uses_neutral_non_accusatory_language(db_conn):
    work_id = _insert_work(db_conn, "drainage_sewage", 11, date(2026, 3, 1), "Work A")
    _insert_work(db_conn, "drainage_sewage", 11, date(2025, 10, 1), "Work B")
    issue_id, _ = _insert_issue_with_reports(db_conn, "drainage_sewage", 11, recurrence_count=3)

    signals = evaluate_signals(
        {"id": issue_id, "category": "drainage_sewage", "ward_id": 11, "recurrence_count": 3},
        {"id": 1, "work_id": work_id, "distance_m": 10.0}, db_conn,
    )
    assert len(signals) >= 2  # exercise multiple rules in one go
    for s in signals:
        _assert_neutral(s["explanation"])
        _assert_neutral(s["rule_name"])


def test_run_signals_writes_to_signals_table(clean_reports, clean_works):
    with clean_reports.cursor() as cur:
        cur.execute("DELETE FROM signals")
        cur.execute("DELETE FROM matches")
        cur.execute("DELETE FROM issues")

    work_id = _insert_work(clean_works, "drainage_sewage", 11, date(2026, 3, 1))
    issue_id, _ = _insert_issue_with_reports(clean_reports, "drainage_sewage", 11)
    with clean_reports.cursor() as cur:
        cur.execute(
            "INSERT INTO matches (issue_id, work_id, semantic_score, distance_m, days_since_completion, combined_score, match_reason) "
            "VALUES (%s, %s, 0.6, NULL, 100, 0.6, 'test')",
            (issue_id, work_id),
        )

    count = run_signals(conn=clean_reports)
    assert count >= 1
    with clean_reports.cursor() as cur:
        cur.execute("SELECT issue_id, match_id, source_record_ids FROM signals")
        rows = cur.fetchall()
    assert len(rows) == count
    assert rows[0][0] == issue_id
