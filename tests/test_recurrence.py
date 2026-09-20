from app.core.recurrence import apply_recurrence, check_recurrence, run_recurrence_check


def _insert_issue(conn, category, ward_id, status, lat=18.55, lon=73.85, recurrence_count=0,
                   report_count=1):
    with conn.cursor() as cur:
        cur.execute(
            """
            INSERT INTO issues (category, ward_id, status, geom, recurrence_count, report_count,
                                 first_reported, last_reported)
            VALUES (%s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326), %s, %s, now(), now())
            RETURNING id
            """,
            (category, ward_id, status, lon, lat, recurrence_count, report_count),
        )
        return cur.fetchone()[0]


def test_check_recurrence_finds_prior_closed_issue_same_ward_category(db_conn):
    prior_id = _insert_issue(db_conn, "drainage_sewage", 11, "closed")
    new_id = _insert_issue(db_conn, "drainage_sewage", 11, "open")

    result = check_recurrence({"id": new_id, "category": "drainage_sewage", "ward_id": 11}, db_conn)
    assert result["is_recurrence"] is True
    assert result["prior_issue_id"] == prior_id


def test_check_recurrence_ignores_open_prior_issue(db_conn):
    _insert_issue(db_conn, "drainage_sewage", 11, "open")
    new_id = _insert_issue(db_conn, "drainage_sewage", 11, "open")

    result = check_recurrence({"id": new_id, "category": "drainage_sewage", "ward_id": 11}, db_conn)
    assert result["is_recurrence"] is False
    assert result["prior_issue_id"] is None


def test_check_recurrence_ignores_different_category(db_conn):
    _insert_issue(db_conn, "pothole_road", 11, "closed")
    new_id = _insert_issue(db_conn, "drainage_sewage", 11, "open")

    result = check_recurrence({"id": new_id, "category": "drainage_sewage", "ward_id": 11}, db_conn)
    assert result["is_recurrence"] is False


def test_check_recurrence_ignores_different_ward(db_conn):
    _insert_issue(db_conn, "drainage_sewage", 12, "closed")
    new_id = _insert_issue(db_conn, "drainage_sewage", 11, "open")

    result = check_recurrence({"id": new_id, "category": "drainage_sewage", "ward_id": 11}, db_conn)
    assert result["is_recurrence"] is False


def test_check_recurrence_ignores_closed_issue_too_far_away(db_conn):
    # Same ward is a big polygon - a closed issue on the opposite side of it
    # (>300m away) with real precise geoms shouldn't count as the same spot.
    _insert_issue(db_conn, "drainage_sewage", 11, "closed", lat=18.60, lon=73.90)
    new_id = _insert_issue(db_conn, "drainage_sewage", 11, "open", lat=18.55, lon=73.85)

    result = check_recurrence({"id": new_id, "category": "drainage_sewage", "ward_id": 11}, db_conn)
    assert result["is_recurrence"] is False


def test_apply_recurrence_reopens_prior_and_merges_reports(db_conn):
    prior_id = _insert_issue(db_conn, "drainage_sewage", 11, "closed", recurrence_count=0, report_count=5)
    new_id = _insert_issue(db_conn, "drainage_sewage", 11, "open", report_count=2)

    with db_conn.cursor() as cur:
        cur.execute(
            "INSERT INTO reports (raw_text, reported_at, category, issue_id, is_synthetic) "
            "VALUES ('x', now(), 'drainage_sewage', %s, true)",
            (new_id,),
        )

    apply_recurrence(new_id, prior_id, db_conn)

    with db_conn.cursor() as cur:
        cur.execute("SELECT status, recurrence_count, report_count FROM issues WHERE id = %s", (prior_id,))
        status, recurrence_count, report_count = cur.fetchone()
        assert status == "reopened"
        assert recurrence_count == 1
        assert report_count == 7  # 5 + 2

        cur.execute("SELECT id FROM issues WHERE id = %s", (new_id,))
        assert cur.fetchone() is None  # merged away

        cur.execute("SELECT issue_id FROM reports WHERE raw_text = 'x'")
        assert cur.fetchone()[0] == prior_id


def test_run_recurrence_check_processes_all_open_issues(clean_reports, clean_works):
    with clean_reports.cursor() as cur:
        cur.execute("DELETE FROM issues")

    prior_id = _insert_issue(clean_reports, "footpath", 12, "closed")
    new_id = _insert_issue(clean_reports, "footpath", 12, "open")

    hits = run_recurrence_check(conn=clean_reports)
    assert len(hits) == 1
    assert hits[0]["new_issue_id"] == new_id
    assert hits[0]["prior_issue_id"] == prior_id
