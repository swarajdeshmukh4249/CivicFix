import json
import time
import urllib.parse
import urllib.request
from pathlib import Path

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "WardSentry-hackathon-prototype/0.1 (civic complaint triage, local dev)"
DEFAULT_CACHE_PATH = "data/cache/geocode_cache.json"
RATE_LIMIT_SECONDS = 1.0  # Nominatim usage policy: max 1 request/second.

_last_request_time = 0.0


def _load_cache(cache_path: str) -> dict:
    path = Path(cache_path)
    if not path.exists():
        return {}
    return json.loads(path.read_text())


def _save_cache(cache_path: str, cache: dict) -> None:
    path = Path(cache_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(cache, indent=2))


def geocode(query: str, cache_path: str = DEFAULT_CACHE_PATH) -> tuple[float, float] | None:
    """Resolves a free-text place query to (lat, lon) via Nominatim, with a
    disk cache so repeated runs don't re-hit the API or its rate limit.
    Returns None on no match or any network failure - callers must treat
    that as "couldn't resolve", never guess a point.
    """
    cache = _load_cache(cache_path)
    if query in cache:
        return tuple(cache[query]) if cache[query] is not None else None

    global _last_request_time
    elapsed = time.monotonic() - _last_request_time
    if elapsed < RATE_LIMIT_SECONDS:
        time.sleep(RATE_LIMIT_SECONDS - elapsed)

    params = urllib.parse.urlencode({"q": query, "format": "json", "limit": 1})
    request = urllib.request.Request(
        f"{NOMINATIM_URL}?{params}", headers={"User-Agent": USER_AGENT}
    )
    result = None
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            _last_request_time = time.monotonic()
            data = json.loads(response.read())
            if data:
                result = (float(data[0]["lat"]), float(data[0]["lon"]))
    except Exception:
        result = None

    cache[query] = list(result) if result else None
    _save_cache(cache_path, cache)
    return result
