from app.core.metrics import clustering_metrics, compute_metrics, location_metrics, matcher_metrics


def test_clustering_metrics_counts_singleton_vs_multi(clean_reports, clean_works):
    with clean_reports.cursor() as cur:
        cur.execute("DELETE FROM issues")
        cur.execute("INSERT INTO issues (category, status, report_count) VALUES ('pothole_road','open',1)")
        cur.execute("INSERT INTO issues (category, status, report_count) VALUES ('pothole_road','open',5)")
    result = clustering_metrics(clean_reports)
    assert result["total_issues"] == 2
    assert result["singleton_issues"] == 1
    assert result["multi_report_issues"] == 1
    assert result["largest_cluster_size"] == 5


def test_location_metrics_resolution_rate(clean_reports):
    with clean_reports.cursor() as cur:
        cur.execute(
            "INSERT INTO reports (raw_text, reported_at, category, geom_confidence, geom, is_synthetic) "
            "VALUES "
            "('a', now(), 'other', 1.0, ST_SetSRID(ST_MakePoint(73.8, 18.5), 4326), true), "
            "('b', now(), 'other', 0.4, ST_SetSRID(ST_MakePoint(73.8, 18.5), 4326), true), "
            "('c', now(), 'other', NULL, NULL, true)"
        )
    result = location_metrics(clean_reports)
    assert result["total_reports"] == 3
    assert result["precise_resolved"] == 1
    assert result["ward_level_resolved"] == 1
    assert result["unresolved"] == 1
    assert result["resolution_rate"] == round(2 / 3, 4)


def test_matcher_metrics_labeled_case_correct_when_top_match_agrees(clean_reports, clean_works):
    with clean_reports.cursor() as cur:
        cur.execute("DELETE FROM issues")
        cur.execute("DELETE FROM matches")
        cur.execute(
            "INSERT INTO works (work_name, description, category, geom) "
            "VALUES ('w', 'd', 'pothole_road', ST_SetSRID(ST_MakePoint(73.8, 18.5), 4326)) RETURNING id"
        )
        work_id = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO issues (category, status, report_count, geom) "
            "VALUES ('pothole_road', 'open', 1, ST_SetSRID(ST_MakePoint(73.8, 18.5), 4326)) RETURNING id"
        )
        issue_id = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO matches (issue_id, work_id, semantic_score, distance_m, combined_score, match_reason) "
            "VALUES (%s, %s, 0.9, 5, 0.9, 'test')",
            (issue_id, work_id),
        )
    result = matcher_metrics(clean_reports)
    assert result["labeled_cases"] == 1
    assert result["labeled_correct"] == 1
    assert result["labeled_accuracy"] == 1.0


def test_compute_metrics_returns_all_four_sections(clean_reports, clean_works):
    result = compute_metrics(conn=clean_reports)
    assert set(result.keys()) == {"classification", "clustering", "location", "matcher"}
