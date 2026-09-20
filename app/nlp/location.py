import re

import spacy

from app.db import get_connection
from app.ingest.geocode import geocode
from app.ingest.location import extract_landmark_phrase, extract_ward_number

# Real, well-known Pune landmarks/roads not already covered by a ward name,
# per ARCHITECTURE.md 5.3's "gazetteer of Pune landmarks and road names".
# These are place NAMES only - Nominatim resolves their actual coordinates,
# nothing here is a fabricated coordinate.
LANDMARKS = [
    "FC Road", "JM Road", "MG Road", "Deccan Gymkhana", "Swargate", "Camp",
    "Viman Nagar", "Hinjewadi", "Pashan Lake", "Katraj Lake", "Shaniwar Wada",
    "Sinhagad Road", "Senapati Bapat Road", "University Road",
]

_nlp = None
_gazetteer: dict[str, int | None] = {}


def _get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


def _ensure_gazetteer_loaded(conn=None) -> None:
    """Ward-name tokens map to their ward id (a direct, network-free way to
    resolve a mentioned locality to a ward centroid); standalone landmarks
    map to None since they need real geocoding, not a ward guess.
    """
    if _gazetteer:
        return
    owns_conn = conn is None
    conn = conn or get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name FROM wards")
            for ward_id, name in cur.fetchall():
                for token in re.split(r"[-–]", name):
                    token = token.strip()
                    if len(token) >= 4:
                        _gazetteer[token.lower()] = ward_id
    finally:
        if owns_conn:
            conn.close()
    for landmark in LANDMARKS:
        _gazetteer.setdefault(landmark.lower(), None)


def extract_location_phrase(text: str, conn=None) -> tuple[str | None, float]:
    """Finds a location-referring phrase in free text, per ARCHITECTURE.md
    5.3: regex ("near/at/opposite/behind X") first, then the Pune gazetteer
    (ward-name localities + known landmarks/roads), then spaCy NER as a
    last resort. Confidence reflects extraction method certainty, not
    geocoding success - that's geocode()'s job.
    """
    if not text:
        return None, 0.0

    landmark = extract_landmark_phrase(text)
    if landmark:
        return landmark, 0.7

    _ensure_gazetteer_loaded(conn)
    lowered = text.lower()
    for token in _gazetteer:
        if re.search(rf"\b{re.escape(token)}\b", lowered):
            return token, 0.6

    doc = _get_nlp()(text)
    for ent in doc.ents:
        if ent.label_ in ("LOC", "FAC", "GPE"):
            return ent.text, 0.5

    return None, 0.0


def _ward_centroid(conn, ward_id: int) -> tuple[float, float] | None:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT ST_Y(ST_Centroid(geom)), ST_X(ST_Centroid(geom)) FROM wards WHERE id = %s",
            (ward_id,),
        )
        row = cur.fetchone()
    return (row[0], row[1]) if row else None


def _ward_containing(conn, lat: float, lon: float) -> int | None:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id FROM wards WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(%s, %s), 4326))",
            (lon, lat),
        )
        row = cur.fetchone()
    return row[0] if row else None


def resolve_report_location(text: str, conn=None):
    """Orchestrates location.py's contracted functions into what a report
    actually needs to store: (lat, lon, geom_confidence, ward_id,
    location_phrase). Not part of the ARCHITECTURE.md 5.3 contract itself,
    but the glue POST /reports and the synthetic generator both need.

    Never fabricates a precise point: an explicit ward mention (number or
    gazetteer name) resolves only to that ward's centroid at confidence 0.4;
    a real geocode match is confidence 1.0; nothing found leaves every field
    None rather than guessing.
    """
    owns_conn = conn is None
    conn = conn or get_connection()
    try:
        ward_num = extract_ward_number(text)
        if ward_num is not None:
            point = _ward_centroid(conn, ward_num)
            if point:
                return point[0], point[1], 0.4, ward_num, f"Ward {ward_num}"

        phrase, _ = extract_location_phrase(text, conn=conn)
        if phrase:
            _ensure_gazetteer_loaded(conn)
            direct_ward = _gazetteer.get(phrase.lower())
            if direct_ward is not None:
                point = _ward_centroid(conn, direct_ward)
                if point:
                    return point[0], point[1], 0.4, direct_ward, phrase

            geocoded = geocode(f"{phrase}, Pune, Maharashtra, India")
            if geocoded:
                lat, lon = geocoded
                ward_id = _ward_containing(conn, lat, lon)
                return lat, lon, 1.0, ward_id, phrase

        # last resort: a ward name mentioned anywhere else in the text,
        # even if it wasn't the phrase extract_location_phrase preferred.
        _ensure_gazetteer_loaded(conn)
        lowered = (text or "").lower()
        for token, ward_id in _gazetteer.items():
            if ward_id is not None and re.search(rf"\b{re.escape(token)}\b", lowered):
                point = _ward_centroid(conn, ward_id)
                if point:
                    return point[0], point[1], 0.4, ward_id, phrase

        return None, None, None, None, phrase
    finally:
        if owns_conn:
            conn.close()
