from unittest.mock import patch

from app.nlp.location import extract_location_phrase, resolve_report_location

WARD_13_CENTROID_QUERY = "SELECT ST_Y(ST_Centroid(geom)), ST_X(ST_Centroid(geom)) FROM wards WHERE id = 13"


def test_extract_location_phrase_prefers_near_at_regex():
    phrase, conf = extract_location_phrase("Pothole near Pashan Lake causing accidents")
    assert phrase == "Pashan Lake"
    assert conf > 0


def test_extract_location_phrase_finds_gazetteer_ward_token():
    phrase, conf = extract_location_phrase("Garbage piling up in Baner for a week now")
    assert phrase is not None and phrase.lower() == "baner"
    assert conf > 0


def test_extract_location_phrase_falls_back_to_spacy_entity():
    # No near/at regex hit, no gazetteer token - spaCy should still find a GPE/LOC.
    phrase, conf = extract_location_phrase("Streetlight broken in Hinjewadi since Monday")
    assert phrase is not None
    assert conf > 0


def test_extract_location_phrase_returns_none_for_nothing_findable():
    phrase, conf = extract_location_phrase("This is a generic complaint with no place mentioned")
    assert phrase is None
    assert conf == 0.0


def test_extract_location_phrase_empty_text():
    assert extract_location_phrase("") == (None, 0.0)
    assert extract_location_phrase(None) == (None, 0.0)


def test_resolve_report_location_ward_number_direct(db_conn):
    lat, lon, conf, ward_id, phrase = resolve_report_location("Pothole reported, Ward 13", conn=db_conn)
    assert ward_id == 13
    assert conf == 0.4
    assert lat is not None and lon is not None


def test_resolve_report_location_ward_gazetteer_direct(db_conn):
    lat, lon, conf, ward_id, phrase = resolve_report_location(
        "Garbage not collected in Baner for many days", conn=db_conn
    )
    assert ward_id == 13
    assert conf == 0.4
    assert lat is not None and lon is not None


def test_resolve_report_location_geocode_path_binds_ward_via_st_contains(db_conn):
    fake_point = (18.551054786274666, 73.93429308035661)  # real ward 5 centroid
    with patch("app.nlp.location.geocode", return_value=fake_point):
        lat, lon, conf, ward_id, phrase = resolve_report_location(
            "Sewage overflowing near Some Made Up Landmark Name", conn=db_conn
        )
    assert conf == 1.0
    assert (lat, lon) == fake_point
    assert ward_id == 5


def test_resolve_report_location_unresolved_when_nothing_found(db_conn):
    with patch("app.nlp.location.geocode", return_value=None):
        lat, lon, conf, ward_id, phrase = resolve_report_location(
            "Totally generic complaint text with nothing locatable", conn=db_conn
        )
    assert lat is None and lon is None and conf is None and ward_id is None
