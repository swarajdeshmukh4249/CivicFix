import pytest
from fastapi.testclient import TestClient

from app.api.main import app


@pytest.fixture
def real_client(monkeypatch, real_database_url):
    """These API tests deliberately verify against the real, seeded
    civicfix database (per this task's explicit instructions), not the
    isolated civicfix_test every other test in this suite uses. Restoring
    app.db.DATABASE_URL just for the duration of one test is safe: it's a
    monkeypatch, auto-reverted afterward, and get_connection() re-reads the
    module global on every call rather than caching it.
    """
    monkeypatch.setattr("app.db.DATABASE_URL", real_database_url)
    return TestClient(app)


@pytest.fixture
def real_conn(monkeypatch, real_database_url):
    monkeypatch.setattr("app.db.DATABASE_URL", real_database_url)
    from app.db import get_connection
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


# This is a real, shared, live database (other sessions genuinely exercise
# POST /api/reports concurrently - confirmed during this work, not
# hypothetical), so these baselines are floors from the last known-clean
# count, not exact equality - a passing "==" here would mean either nothing
# changed, or we got lucky about what did.
MIN_WORKS = 318
MIN_REPORTS = 400
MIN_ISSUES = 333
MIN_MATCHES = 28
MIN_SENSITIVE_SITES = 861
MIN_SIGNALS = 36
MIN_DRAINAGE_SEWAGE_ISSUES = 82


def test_health(real_client):
    resp = real_client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["database_connected"] is True
    assert body["counts"]["works"] == MIN_WORKS  # works is never written to at runtime - this one IS exact
    assert body["counts"]["reports"] >= MIN_REPORTS


def test_stats_matches_real_dataset(real_client):
    resp = real_client.get("/api/stats")
    assert resp.status_code == 200
    body = resp.json()
    assert body["wards"] == 58  # wards is never written to at runtime - exact
    assert body["works"] == MIN_WORKS  # works is never written to at runtime - exact
    assert body["reports"] >= MIN_REPORTS
    assert body["issues"] >= MIN_ISSUES
    assert body["matches"] >= MIN_MATCHES
    assert body["sensitive_sites"] == MIN_SENSITIVE_SITES  # never written to at runtime - exact
    assert body["verification_signals"] >= MIN_SIGNALS


def test_list_issues_default_sorted_by_priority_desc(real_client):
    resp = real_client.get("/api/issues")
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] >= MIN_ISSUES
    assert len(body["items"]) == 50  # default limit
    scores = [i["priority_score"] for i in body["items"]]
    assert scores == sorted(scores, reverse=True)


def test_list_issues_category_filter(real_client):
    resp = real_client.get("/api/issues", params={"category": "drainage_sewage", "limit": 200})
    body = resp.json()
    assert body["total"] >= MIN_DRAINAGE_SEWAGE_ISSUES
    assert all(i["category"] == "drainage_sewage" for i in body["items"])


def test_list_issues_ward_filter(real_client):
    resp = real_client.get("/api/issues", params={"ward_id": 11, "limit": 200})
    body = resp.json()
    assert body["total"] > 0
    assert all(i["ward_id"] == 11 for i in body["items"])


def test_list_issues_min_priority_filter(real_client):
    resp = real_client.get("/api/issues", params={"min_priority": 0.7, "limit": 200})
    body = resp.json()
    assert body["total"] > 0
    assert all(i["priority_score"] >= 0.7 for i in body["items"])


def test_list_issues_pagination(real_client):
    page1 = real_client.get("/api/issues", params={"limit": 10, "offset": 0}).json()
    page2 = real_client.get("/api/issues", params={"limit": 10, "offset": 10}).json()
    ids1 = {i["issue_id"] for i in page1["items"]}
    ids2 = {i["issue_id"] for i in page2["items"]}
    assert ids1.isdisjoint(ids2)


def test_list_issues_is_synthetic_true_for_all_current_issues(real_client):
    # every report in this dataset is synthetic (no real citizen intake exists yet)
    resp = real_client.get("/api/issues", params={"limit": 200})
    assert all(i["is_synthetic"] is True for i in resp.json()["items"])


def test_issue_detail_matched_issue(real_client, real_conn):
    with real_conn.cursor() as cur:
        cur.execute("SELECT issue_id FROM matches LIMIT 1")
        issue_id = cur.fetchone()[0]

    resp = real_client.get(f"/api/issues/{issue_id}")
    assert resp.status_code == 200
    body = resp.json()
    assert body["issue_id"] == issue_id
    assert len(body["reports"]) == body["report_count"]
    assert len(body["matches"]) >= 1
    assert body["priority_score"] is not None
    assert "terms" in body["priority_breakdown"]

    match = body["matches"][0]
    assert match["match_reason"]
    # every real match today is ward-level - never a fabricated distance
    if match["issue_location_precision"] == "ward_level":
        assert match["distance_m"] is None
        assert "ward-level" in match["match_reason"].lower() or "same ward" in match["match_reason"].lower()


def test_issue_detail_nonexistent_returns_404(real_client):
    resp = real_client.get("/api/issues/99999999")
    assert resp.status_code == 404


def test_list_matches_returns_all_28_with_nullable_distance(real_client):
    resp = real_client.get("/api/matches", params={"limit": 500})
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) >= MIN_MATCHES
    assert all("distance_m" in m for m in body)
    assert all(m["work"] is not None for m in body)
    # the original dataset's matches are all ward-level (no precise-distance
    # anchor is 'completed'); a concurrent live add could in principle
    # create a precise one, so this checks the floor is still ward-level,
    # not that literally every match is
    assert sum(1 for m in body if m["distance_m"] is None) >= MIN_MATCHES


def test_list_works_filters_and_precision_field(real_client):
    resp = real_client.get("/api/works", params={"category": "drainage_sewage", "limit": 500})
    body = resp.json()
    assert len(body) > 0
    assert all(w["category"] == "drainage_sewage" for w in body)
    for w in body:
        if w["location"] is not None:
            assert w["location_precision"] in ("precise", "ward_level")


def test_map_endpoint_shape(real_client):
    resp = real_client.get("/api/map")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["sensitive_sites"]) == MIN_SENSITIVE_SITES  # never written to at runtime - exact
    assert len(body["wards"]) == 58  # never written to at runtime - exact
    assert len(body["matched_works"]) > 0
    for site in body["sensitive_sites"][:5]:
        assert site["location"]["lat"] is not None


def test_post_reports_rejects_unknown_ward_id(real_client):
    resp = real_client.post("/api/reports", json={"raw_text": "test complaint", "ward_id": 99999})
    assert resp.status_code == 400


def test_post_reports_full_live_pipeline_then_cleanup(real_client, real_conn):
    """Exercises the real live-add pipeline against the real database, then
    precisely reverts whatever it touched so works/reports/issues/matches
    counts return to exactly their pre-test values, per this task's
    explicit cleanup requirement.
    """
    with real_conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM reports")
        reports_before = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM issues")
        issues_before = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM matches")
        matches_before = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM signals")
        signals_before = cur.fetchone()[0]

    # Deliberately nonsense/distinctive text: low cosine similarity with any
    # real complaint guarantees this becomes its own new singleton issue,
    # not an attach to an existing one - keeps cleanup unambiguous.
    unique_marker = "zzqx automated integration test marker report unrelated content aaa bbb ccc"
    resp = real_client.post("/api/reports", json={"raw_text": unique_marker})
    assert resp.status_code == 201
    body = resp.json()

    try:
        assert body["report"]["raw_text"] == unique_marker
        assert body["report"]["is_synthetic"] is True
        assert body["is_synthetic"] is True
        assert body["category"] in (
            "pothole_road", "drainage_sewage", "water_supply", "streetlight",
            "garbage_waste", "footpath", "traffic_signage", "other",
        )
        assert body["severity"] in ("cosmetic", "moderate", "critical")
        assert body["priority_score"] is not None
        assert isinstance(body["signals"], list)
        # no location/ward supplied and nonsense text -> pipeline legitimately
        # finds nothing; must not fabricate a precise point
        assert body["report"]["geom_confidence"] != 1.0

        assert body["joined_existing_issue"] is False  # per the low-similarity guarantee above
        report_id = body["report"]["id"]
        issue_id = body["issue_id"]

        with real_conn.cursor() as cur:
            cur.execute("SELECT count(*) FROM reports WHERE id = %s", (report_id,))
            assert cur.fetchone()[0] == 1
            cur.execute("SELECT count(*) FROM issues WHERE id = %s", (issue_id,))
            assert cur.fetchone()[0] == 1
    finally:
        report_id = body["report"]["id"]
        issue_id = body["issue_id"]
        with real_conn.cursor() as cur:
            cur.execute("DELETE FROM signals WHERE issue_id = %s", (issue_id,))
            cur.execute("DELETE FROM matches WHERE issue_id = %s", (issue_id,))
            cur.execute("DELETE FROM reports WHERE id = %s", (report_id,))
            cur.execute("DELETE FROM issues WHERE id = %s", (issue_id,))
        real_conn.commit()

    with real_conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM reports")
        assert cur.fetchone()[0] == reports_before
        cur.execute("SELECT count(*) FROM issues")
        assert cur.fetchone()[0] == issues_before
        cur.execute("SELECT count(*) FROM matches")
        assert cur.fetchone()[0] == matches_before
        cur.execute("SELECT count(*) FROM signals")
        assert cur.fetchone()[0] == signals_before


def test_post_reports_with_resolvable_location_does_not_crash_on_time_check(real_client, real_conn):
    """Regression: found via manual execution, not caught by the other live
    tests here - datetime.now() (naive) was compared against issues.last_reported
    (timezone-aware, from Postgres) inside _attach_or_create_issue's _time_ok
    call, raising TypeError. That comparison is only reached when the new
    report resolves a real ward/location AND lands in a category with
    existing candidate issues - a report with no resolvable location (as
    used elsewhere in this file) short-circuits before ever reaching it.
    """
    with real_conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM reports")
        reports_before = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM issues")
        issues_before = cur.fetchone()[0]

    resp = real_client.post(
        "/api/reports",
        json={"raw_text": "Sewage overflowing near Ward 11 again, terrible smell, third time this month"},
    )
    assert resp.status_code == 201
    body = resp.json()

    try:
        assert body["report"]["ward_id"] == 11
        assert body["category"] == "drainage_sewage"
    finally:
        report_id = body["report"]["id"]
        issue_id = body["issue_id"]
        with real_conn.cursor() as cur:
            cur.execute("DELETE FROM reports WHERE id = %s", (report_id,))
        if body["joined_existing_issue"]:
            # Restore full consistency (report_count, geom, embedding, match,
            # priority) by reusing the endpoint's own recompute functions
            # over the now-restored set of real member reports, rather than
            # trying to hand-snapshot an issue we didn't know in advance.
            import json as _json

            from app.api.main import _recompute_issue_aggregates, _refresh_match_for_issue
            from app.core.priority import compute_priority
            from app.core.signals import run_signals

            _recompute_issue_aggregates(real_conn, issue_id)
            _refresh_match_for_issue(real_conn, issue_id)
            total, breakdown = compute_priority(issue_id, real_conn)
            with real_conn.cursor() as cur:
                cur.execute(
                    "UPDATE issues SET priority_score = %s, priority_breakdown = %s::jsonb WHERE id = %s",
                    (total, _json.dumps(breakdown), issue_id),
                )
            run_signals(conn=real_conn)
        else:
            with real_conn.cursor() as cur:
                cur.execute("DELETE FROM signals WHERE issue_id = %s", (issue_id,))
                cur.execute("DELETE FROM matches WHERE issue_id = %s", (issue_id,))
                cur.execute("DELETE FROM issues WHERE id = %s", (issue_id,))
        real_conn.commit()

    if not body["joined_existing_issue"]:
        with real_conn.cursor() as cur:
            cur.execute("SELECT count(*) FROM issues")
            assert cur.fetchone()[0] == issues_before
    with real_conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM reports")
        assert cur.fetchone()[0] == reports_before
        cur.execute("SELECT count(*) FROM matches")
        matches_after = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM signals")
        signals_after = cur.fetchone()[0]
    assert matches_after == 28
    assert signals_after == 36


def test_post_reports_with_ward_hint_uses_ward_centroid_not_fake_precision(real_client, real_conn):
    with real_conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM reports")
        reports_before = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM issues")
        issues_before = cur.fetchone()[0]

    unique_marker = "yywq ward hint automated integration test marker unrelated qqqrrr"
    resp = real_client.post("/api/reports", json={"raw_text": unique_marker, "ward_id": 20})
    assert resp.status_code == 201
    body = resp.json()

    try:
        assert body["report"]["ward_id"] == 20
        assert body["report"]["geom_confidence"] == 0.4  # ward centroid, never fabricated precision
    finally:
        report_id = body["report"]["id"]
        issue_id = body["issue_id"]
        with real_conn.cursor() as cur:
            cur.execute("DELETE FROM signals WHERE issue_id = %s", (issue_id,))
            cur.execute("DELETE FROM matches WHERE issue_id = %s", (issue_id,))
            cur.execute("DELETE FROM reports WHERE id = %s", (report_id,))
            cur.execute("DELETE FROM issues WHERE id = %s", (issue_id,))
        real_conn.commit()

    with real_conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM reports")
        assert cur.fetchone()[0] == reports_before
        cur.execute("SELECT count(*) FROM issues")
        assert cur.fetchone()[0] == issues_before


def test_get_metrics_returns_real_numbers(real_client):
    resp = real_client.get("/api/metrics")
    assert resp.status_code == 200
    body = resp.json()
    assert body["classification"]["trained"] is True
    assert 0.0 <= body["classification"]["model_macro_f1"] <= 1.0
    assert 0.0 <= body["classification"]["baseline_macro_f1"] <= 1.0
    assert body["clustering"]["total_issues"] > 0
    assert 0.0 <= body["location"]["resolution_rate"] <= 1.0
    assert body["matcher"]["labeled_cases"] >= 0


def test_close_issue_rejects_unknown_id(real_client):
    resp = real_client.post("/api/issues/99999999/close")
    assert resp.status_code == 404


def test_close_then_recurrence_reopens_via_live_reports(real_client, real_conn):
    """The core new capability: close an issue, submit a new matching
    report, and the system should reopen the ORIGINAL issue (via
    run_recurrence_check inside POST /api/reports) rather than leaving two
    separate issues - this is the scene DEMO.md's whole pitch depends on,
    which was previously impossible to show live since nothing ever closed
    an issue.

    Uses ward 1, checked to have zero existing reports, specifically
    because a first attempt at this test (with a "zzqx marker" suffix on
    a populated ward) attached to a REAL pre-existing issue instead of
    creating a new one - real, since-restored contamination, not
    hypothetical. Zero pre-existing reports in the target ward removes the
    entire failure class rather than trying to detect and repair it after
    the fact.

    Cleanup commits each step separately: a later step failing must not be
    able to roll back an earlier step that already succeeded (this bit
    the first version of this test too - one failed final DELETE silently
    undid two already-correct report deletes in the same transaction).
    """
    with real_conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM reports WHERE ward_id = 1")
        assert cur.fetchone()[0] == 0, "ward 1 is expected to have zero existing reports for this test"
        cur.execute("SELECT count(*) FROM reports")
        reports_before = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM issues")
        issues_before = cur.fetchone()[0]

    marker = "zzqx recurrence demo test marker qqqrrr"
    first = real_client.post("/api/reports", json={"raw_text": f"Streetlight near Ward 1 not working, {marker}"})
    assert first.status_code == 201
    first_body = first.json()
    issue_a_id = first_body["issue_id"]
    assert first_body["joined_existing_issue"] is False  # guaranteed by the empty-ward precondition above
    report_a_id = first_body["report"]["id"]
    report_b_id = None

    try:
        # Close it - this is the precondition recurrence.py needs and that
        # nothing in the system could previously reach.
        close_resp = real_client.post(f"/api/issues/{issue_a_id}/close")
        assert close_resp.status_code == 200
        assert close_resp.json()["status"] == "closed"

        second = real_client.post(
            "/api/reports", json={"raw_text": f"Streetlight near Ward 1 still broken, {marker}"}
        )
        assert second.status_code == 201
        second_body = second.json()
        report_b_id = second_body["report"]["id"]

        # The new report's issue must resolve back to issue_a - proof the
        # recurrence merge actually happened, not just a second new issue.
        assert second_body["issue_id"] == issue_a_id

        with real_conn.cursor() as cur:
            cur.execute("SELECT status, recurrence_count, report_count FROM issues WHERE id = %s", (issue_a_id,))
            status, recurrence_count, report_count = cur.fetchone()
        assert status == "reopened"
        assert recurrence_count >= 1
        assert report_count == 2
    finally:
        report_ids = [report_a_id] + ([report_b_id] if report_b_id is not None else [])
        with real_conn.cursor() as cur:
            cur.execute("DELETE FROM reports WHERE id = ANY(%s)", (report_ids,))
        real_conn.commit()

        with real_conn.cursor() as cur:
            cur.execute("DELETE FROM signals WHERE issue_id = %s", (issue_a_id,))
            cur.execute("DELETE FROM matches WHERE issue_id = %s", (issue_a_id,))
            cur.execute("DELETE FROM issues WHERE id = %s", (issue_a_id,))
        real_conn.commit()

    with real_conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM reports")
        assert cur.fetchone()[0] == reports_before
        cur.execute("SELECT count(*) FROM issues")
        assert cur.fetchone()[0] == issues_before
