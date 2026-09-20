from app.nlp.severity import severity


def test_open_manhole_is_critical_regardless_of_mild_wording():
    assert severity("There is an open manhole near the school gate", "drainage_sewage") == "critical"


def test_category_prior_wins_when_text_has_no_severity_keywords():
    # drainage_sewage's prior is critical even with completely neutral text
    assert severity("Drainage issue reported today", "drainage_sewage") == "critical"


def test_text_severity_can_escalate_above_category_prior():
    # streetlight's prior is cosmetic, but "accident" text should escalate
    assert severity("Streetlight out and a scooter accident happened here last night", "streetlight") == "critical"


def test_low_severity_category_with_mild_text_stays_low():
    assert severity("Streetlight flickering occasionally", "streetlight") == "cosmetic"


def test_moderate_text_on_low_prior_category():
    assert severity("Footpath tiles are broken and uneven", "footpath") == "moderate"


def test_unknown_category_defaults_to_cosmetic_prior():
    assert severity("Some minor issue", "other") == "cosmetic"


def test_empty_text_falls_back_to_category_prior():
    assert severity("", "water_supply") == "moderate"
