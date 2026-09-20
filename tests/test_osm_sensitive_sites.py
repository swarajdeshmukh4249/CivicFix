import json
from unittest.mock import patch, MagicMock

from app.ingest.osm_sensitive_sites import (
    _classify_osm_tags,
    _element_point,
    deduplicate_sites,
    fetch_osm_elements,
    load_sensitive_sites,
    normalize_elements,
)

BBOX = (18.38539, 73.73193, 18.62185, 74.01838)


def test_classify_osm_tags_school():
    assert _classify_osm_tags({"amenity": "school"}) == "school"


def test_classify_osm_tags_hospital():
    assert _classify_osm_tags({"amenity": "hospital"}) == "hospital"


def test_classify_osm_tags_market():
    assert _classify_osm_tags({"amenity": "marketplace"}) == "market"


def test_classify_osm_tags_water_body():
    assert _classify_osm_tags({"natural": "water"}) == "water_body"


def test_classify_osm_tags_bus_stop():
    assert _classify_osm_tags({"highway": "bus_stop"}) == "bus_stop"


def test_classify_osm_tags_unrelated_returns_none():
    assert _classify_osm_tags({"amenity": "restaurant"}) == None  # noqa: E711
    assert _classify_osm_tags({}) is None


def test_element_point_node_uses_lat_lon_directly():
    assert _element_point({"type": "node", "lat": 18.5, "lon": 73.8}) == (18.5, 73.8)


def test_element_point_way_uses_center():
    el = {"type": "way", "center": {"lat": 18.5, "lon": 73.8}}
    assert _element_point(el) == (18.5, 73.8)


def test_element_point_missing_returns_none_none():
    assert _element_point({"type": "way"}) == (None, None)


def test_normalize_elements_filters_unrelated_and_missing_coords():
    elements = [
        {"type": "node", "id": 1, "lat": 18.5, "lon": 73.8, "tags": {"amenity": "school", "name": "ABC School"}},
        {"type": "node", "id": 2, "lat": 18.5, "lon": 73.8, "tags": {"amenity": "restaurant"}},  # not a category we track
        {"type": "way", "id": 3, "tags": {"natural": "water"}},  # no center -> skip
    ]
    sites = normalize_elements(elements)
    assert len(sites) == 1
    assert sites[0]["category"] == "school"
    assert sites[0]["source_id"] == "node/1"
    assert sites[0]["name"] == "ABC School"


def test_deduplicate_sites_merges_nearby_same_category():
    sites = [
        {"source_id": "node/1", "category": "school", "name": None, "lat": 18.5500, "lon": 73.8500},
        {"source_id": "node/2", "category": "school", "name": "Named School", "lat": 18.55005, "lon": 73.85005},  # ~7m away
    ]
    deduped = deduplicate_sites(sites, radius_m=30)
    assert len(deduped) == 1
    assert deduped[0]["name"] == "Named School"  # kept name from the duplicate that had one


def test_deduplicate_sites_keeps_far_apart_sites_separate():
    sites = [
        {"source_id": "node/1", "category": "school", "name": "A", "lat": 18.5500, "lon": 73.8500},
        {"source_id": "node/2", "category": "school", "name": "B", "lat": 18.5600, "lon": 73.8600},  # ~1.4km away
    ]
    deduped = deduplicate_sites(sites, radius_m=30)
    assert len(deduped) == 2


def test_deduplicate_sites_keeps_different_categories_at_same_point():
    sites = [
        {"source_id": "node/1", "category": "school", "name": "A", "lat": 18.5500, "lon": 73.8500},
        {"source_id": "node/2", "category": "hospital", "name": "B", "lat": 18.5500, "lon": 73.8500},
    ]
    deduped = deduplicate_sites(sites, radius_m=30)
    assert len(deduped) == 2


def test_fetch_osm_elements_uses_cache_without_network(tmp_path):
    cache_path = tmp_path / "cache.json"
    cache_path.write_text(json.dumps({"elements": [{"type": "node", "id": 1}]}))
    with patch("app.ingest.osm_sensitive_sites.urllib.request.urlopen") as mock_urlopen:
        elements = fetch_osm_elements(BBOX, cache_path=str(cache_path))
    mock_urlopen.assert_not_called()
    assert elements == [{"type": "node", "id": 1}]


def test_fetch_osm_elements_falls_back_to_cache_on_network_failure(tmp_path):
    cache_path = tmp_path / "cache.json"
    cache_path.write_text(json.dumps({"elements": [{"type": "node", "id": 42}]}))
    with patch("app.ingest.osm_sensitive_sites.urllib.request.urlopen", side_effect=OSError("down")):
        elements = fetch_osm_elements(BBOX, cache_path=str(cache_path), force_refresh=True)
    assert elements == [{"type": "node", "id": 42}]


def test_fetch_osm_elements_returns_empty_list_when_no_cache_and_network_fails(tmp_path):
    cache_path = tmp_path / "missing_cache.json"
    with patch("app.ingest.osm_sensitive_sites.urllib.request.urlopen", side_effect=OSError("down")):
        elements = fetch_osm_elements(BBOX, cache_path=str(cache_path))
    assert elements == []


def test_fetch_osm_elements_partial_failure_keeps_successful_categories(tmp_path):
    cache_path = tmp_path / "cache.json"
    ok_response = MagicMock()
    ok_response.__enter__.return_value = ok_response
    ok_response.read.return_value = json.dumps(
        {"elements": [{"type": "node", "id": 1, "lat": 18.5, "lon": 73.8, "tags": {"amenity": "school"}}]}
    ).encode()

    # 5 categories -> 5 calls; make some fail, some succeed.
    call_count = {"n": 0}

    def flaky_urlopen(*args, **kwargs):
        call_count["n"] += 1
        if call_count["n"] % 2 == 0:
            raise OSError("simulated failure")
        return ok_response

    with patch("app.ingest.osm_sensitive_sites.urllib.request.urlopen", side_effect=flaky_urlopen):
        elements = fetch_osm_elements(BBOX, cache_path=str(cache_path))

    assert len(elements) >= 1  # at least the successful categories' data came through
    cached = json.loads(cache_path.read_text())
    assert len(cached["failed_categories"]) > 0
    assert len(cached["failed_categories"]) < 5  # not everything failed


def test_fetch_osm_elements_writes_cache_on_success(tmp_path):
    cache_path = tmp_path / "cache.json"
    mock_response = MagicMock()
    mock_response.__enter__.return_value = mock_response
    mock_response.read.return_value = json.dumps({"elements": [{"type": "node", "id": 7}]}).encode()
    with patch("app.ingest.osm_sensitive_sites.urllib.request.urlopen", return_value=mock_response):
        elements = fetch_osm_elements(BBOX, cache_path=str(cache_path))
    assert elements == [{"type": "node", "id": 7}]
    assert json.loads(cache_path.read_text())["elements"] == [{"type": "node", "id": 7}]


def test_load_sensitive_sites_discards_points_outside_pmc_wards(db_conn):
    with db_conn.cursor() as cur:
        cur.execute("DELETE FROM sensitive_sites")

    elements = [
        # inside ward 11's polygon area (reuse a known-good point from earlier work)
        {"type": "node", "id": 100, "lat": 18.55727320491961, "lon": 73.82899926071265,
         "tags": {"amenity": "school", "name": "In-ward School"}},
        # far outside any PMC ward
        {"type": "node", "id": 200, "lat": 19.5, "lon": 75.5,
         "tags": {"amenity": "hospital", "name": "Out-of-scope Hospital"}},
    ]
    with patch("app.ingest.osm_sensitive_sites.fetch_osm_elements", return_value=elements):
        inserted = load_sensitive_sites(conn=db_conn)

    assert inserted == 1
    with db_conn.cursor() as cur:
        cur.execute("SELECT name, kind FROM sensitive_sites")
        rows = cur.fetchall()
    assert rows == [("In-ward School", "school")]


def test_load_sensitive_sites_is_idempotent_on_rerun(db_conn):
    with db_conn.cursor() as cur:
        cur.execute("DELETE FROM sensitive_sites")

    elements = [
        {"type": "node", "id": 300, "lat": 18.55727320491961, "lon": 73.82899926071265,
         "tags": {"amenity": "school", "name": "School A"}},
    ]
    with patch("app.ingest.osm_sensitive_sites.fetch_osm_elements", return_value=elements):
        load_sensitive_sites(conn=db_conn)
        second_count = load_sensitive_sites(conn=db_conn)

    assert second_count == 1
    with db_conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM sensitive_sites")
        assert cur.fetchone()[0] == 1
