import json
from unittest.mock import patch, MagicMock

from app.ingest.geocode import geocode


def _fake_response(payload):
    mock = MagicMock()
    mock.__enter__.return_value = mock
    mock.read.return_value = json.dumps(payload).encode()
    return mock


def test_geocode_returns_lat_lon_on_match(tmp_path):
    cache_path = str(tmp_path / "cache.json")
    with patch("app.ingest.geocode.urllib.request.urlopen") as mock_urlopen:
        mock_urlopen.return_value = _fake_response([{"lat": "18.52", "lon": "73.85"}])
        result = geocode("Pashan Lake, Pune", cache_path=cache_path)
    assert result == (18.52, 73.85)


def test_geocode_returns_none_on_no_results(tmp_path):
    cache_path = str(tmp_path / "cache.json")
    with patch("app.ingest.geocode.urllib.request.urlopen") as mock_urlopen:
        mock_urlopen.return_value = _fake_response([])
        result = geocode("nonsense place that does not exist", cache_path=cache_path)
    assert result is None


def test_geocode_returns_none_on_network_failure(tmp_path):
    cache_path = str(tmp_path / "cache.json")
    with patch("app.ingest.geocode.urllib.request.urlopen", side_effect=OSError("boom")):
        result = geocode("anywhere", cache_path=cache_path)
    assert result is None


def test_geocode_uses_cache_without_hitting_network(tmp_path):
    cache_path = str(tmp_path / "cache.json")
    cache_path_obj = tmp_path / "cache.json"
    cache_path_obj.write_text(json.dumps({"cached query": [18.5, 73.8]}))
    with patch("app.ingest.geocode.urllib.request.urlopen") as mock_urlopen:
        result = geocode("cached query", cache_path=cache_path)
    mock_urlopen.assert_not_called()
    assert result == (18.5, 73.8)


def test_geocode_caches_negative_result(tmp_path):
    cache_path = str(tmp_path / "cache.json")
    with patch("app.ingest.geocode.urllib.request.urlopen") as mock_urlopen:
        mock_urlopen.return_value = _fake_response([])
        geocode("nowhere", cache_path=cache_path)
        geocode("nowhere", cache_path=cache_path)
    assert mock_urlopen.call_count == 1
