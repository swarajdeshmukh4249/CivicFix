from app.ingest.wards import load_wards

GEOJSON_PATH = "data/wards/pune-2022-wards.geojson"


def test_load_wards_inserts_all_features(clean_wards):
    count = load_wards(GEOJSON_PATH)
    assert count == 58

    with clean_wards.cursor() as cur:
        cur.execute("SELECT count(*) FROM wards")
        assert cur.fetchone()[0] == 58


def test_load_wards_geometry_is_valid(clean_wards):
    load_wards(GEOJSON_PATH)
    with clean_wards.cursor() as cur:
        cur.execute("SELECT count(*) FROM wards WHERE NOT ST_IsValid(geom)")
        assert cur.fetchone()[0] == 0


def test_load_wards_is_idempotent(clean_wards):
    load_wards(GEOJSON_PATH)
    count = load_wards(GEOJSON_PATH)
    assert count == 58
    with clean_wards.cursor() as cur:
        cur.execute("SELECT count(*) FROM wards")
        assert cur.fetchone()[0] == 58
