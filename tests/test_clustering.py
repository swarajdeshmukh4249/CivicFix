from datetime import datetime, timedelta

import numpy as np

from app.core.clustering import cluster_reports, run_clustering, spatial_ok

NOW = datetime(2026, 9, 20, 12, 0, 0)

SIMILAR_A = np.array([1.0, 0.0, 0.0])
SIMILAR_B = np.array([0.99, 0.14, 0.0])  # cosine ~0.99, well above 0.82
DIFFERENT = np.array([0.0, 1.0, 0.0])  # cosine 0.0 with SIMILAR_A


def _report(id, category, embedding, lat=18.55, lon=73.85, geom_confidence=1.0,
            ward_id=11, reported_at=NOW):
    return {
        "id": id, "category": category, "embedding": embedding,
        "lat": lat, "lon": lon, "geom_confidence": geom_confidence,
        "ward_id": ward_id, "reported_at": reported_at,
    }


def test_similar_nearby_recent_same_category_reports_cluster_together():
    reports = [
        _report(1, "pothole_road", SIMILAR_A),
        _report(2, "pothole_road", SIMILAR_B, lat=18.5501, lon=73.8501),  # ~14m away
    ]
    labels = cluster_reports(reports)
    assert labels[1] == labels[2]


def test_different_categories_never_cluster_even_if_identical_otherwise():
    reports = [
        _report(1, "pothole_road", SIMILAR_A),
        _report(2, "drainage_sewage", SIMILAR_A),  # same embedding, same point, same time
    ]
    labels = cluster_reports(reports)
    assert labels[1] != labels[2]


def test_low_semantic_similarity_prevents_clustering():
    reports = [
        _report(1, "pothole_road", SIMILAR_A),
        _report(2, "pothole_road", DIFFERENT),  # cosine 0.0, well under 0.82
    ]
    labels = cluster_reports(reports)
    assert labels[1] != labels[2]


def test_distance_over_100m_prevents_clustering_for_precise_points():
    reports = [
        _report(1, "pothole_road", SIMILAR_A, lat=18.5500, lon=73.8500, geom_confidence=1.0),
        _report(2, "pothole_road", SIMILAR_A, lat=18.5600, lon=73.8500, geom_confidence=1.0),  # ~1.1km away
    ]
    labels = cluster_reports(reports)
    assert labels[1] != labels[2]


def test_time_window_over_7_days_prevents_clustering():
    reports = [
        _report(1, "pothole_road", SIMILAR_A, reported_at=NOW),
        _report(2, "pothole_road", SIMILAR_A, reported_at=NOW + timedelta(days=8)),
    ]
    labels = cluster_reports(reports)
    assert labels[1] != labels[2]


def test_time_window_within_7_days_allows_clustering():
    reports = [
        _report(1, "pothole_road", SIMILAR_A, reported_at=NOW),
        _report(2, "pothole_road", SIMILAR_A, reported_at=NOW + timedelta(days=6)),
    ]
    labels = cluster_reports(reports)
    assert labels[1] == labels[2]


def test_ward_level_reports_use_ward_match_not_centroid_distance():
    # Both ward-level (0.4), same ward -> spatially compatible even though
    # their stored points are identical centroids, not real proximity.
    r1 = _report(1, "pothole_road", SIMILAR_A, ward_id=11, geom_confidence=0.4)
    r2 = _report(2, "pothole_road", SIMILAR_A, ward_id=11, geom_confidence=0.4)
    assert spatial_ok(r1, r2) is True


def test_ward_level_reports_in_different_wards_are_not_spatially_compatible():
    r1 = _report(1, "pothole_road", SIMILAR_A, ward_id=11, geom_confidence=0.4)
    r2 = _report(2, "pothole_road", SIMILAR_A, ward_id=12, geom_confidence=0.4)
    assert spatial_ok(r1, r2) is False


def test_precise_point_far_from_ward_level_centroid_is_not_compatible():
    # Mixed precision: fall back to ward match rather than trusting a
    # centroid-vs-precise-point distance as real evidence.
    r1 = _report(1, "pothole_road", SIMILAR_A, ward_id=11, geom_confidence=1.0, lat=18.9, lon=74.2)
    r2 = _report(2, "pothole_road", SIMILAR_A, ward_id=11, geom_confidence=0.4, lat=18.55, lon=73.85)
    assert spatial_ok(r1, r2) is True  # same ward is the only claim made, no distance fabricated


def test_identical_embeddings_do_not_crash_on_floating_point_similarity_over_one():
    # Regression: found running against the real 400-report dataset, where
    # many reports share verbatim-identical template text -> identical
    # embeddings -> cosine similarity can round to just over 1.0, making
    # 1-sim negative, which sklearn's precomputed-distance check rejects.
    same = np.array([0.3, 0.4, 0.5])
    reports = [
        _report(1, "pothole_road", same),
        _report(2, "pothole_road", same.copy()),
        _report(3, "pothole_road", same.copy()),
    ]
    labels = cluster_reports(reports)
    assert labels[1] == labels[2] == labels[3]


def test_singleton_report_gets_its_own_cluster():
    reports = [_report(1, "footpath", SIMILAR_A)]
    labels = cluster_reports(reports)
    assert 1 in labels


def test_run_clustering_writes_issues_and_links_reports(clean_reports, clean_works):
    with clean_reports.cursor() as cur:
        cur.execute(
            """
            INSERT INTO reports (raw_text, reported_at, category, geom, geom_confidence, ward_id, embedding, is_synthetic)
            VALUES
            ('a', now(), 'pothole_road', ST_SetSRID(ST_MakePoint(73.85,18.55),4326), 1.0, 11,
             %(e1)s::vector, true),
            ('b', now(), 'pothole_road', ST_SetSRID(ST_MakePoint(73.8501,18.5501),4326), 1.0, 11,
             %(e2)s::vector, true),
            ('c', now() - interval '30 days', 'water_supply', ST_SetSRID(ST_MakePoint(73.5,18.9),4326), 1.0, 20,
             %(e3)s::vector, true)
            """,
            {
                "e1": "[" + ",".join(["1.0", "0.0", "0.0"] + ["0.0"] * 381) + "]",
                "e2": "[" + ",".join(["0.99", "0.14", "0.0"] + ["0.0"] * 381) + "]",
                "e3": "[" + ",".join(["0.0", "1.0", "0.0"] + ["0.0"] * 381) + "]",
            },
        )
    clean_reports.commit()

    issue_count = run_clustering(conn=clean_reports)
    assert issue_count == 2  # a+b cluster together, c is its own singleton

    with clean_reports.cursor() as cur:
        cur.execute("SELECT count(*) FROM issues")
        assert cur.fetchone()[0] == 2
        cur.execute("SELECT count(*) FROM reports WHERE issue_id IS NOT NULL")
        assert cur.fetchone()[0] == 3
        cur.execute("SELECT report_count FROM issues ORDER BY report_count DESC")
        counts = [row[0] for row in cur.fetchall()]
        assert counts == [2, 1]
