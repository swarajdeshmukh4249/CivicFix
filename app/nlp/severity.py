_BAND_ORDER = ("cosmetic", "moderate", "critical")

# Published category priors, per ARCHITECTURE.md 5.4: some categories are
# dangerous regardless of how mildly they're worded (an open manhole or
# sewage near water is never "cosmetic").
CATEGORY_SEVERITY_PRIOR = {
    "pothole_road": "moderate",
    "drainage_sewage": "critical",
    "water_supply": "moderate",
    "streetlight": "cosmetic",
    "garbage_waste": "moderate",
    "footpath": "cosmetic",
    "traffic_signage": "moderate",
    "other": "cosmetic",
}

TEXT_SEVERITY_KEYWORDS = {
    "critical": [
        "open manhole", "accident", "injured", "injury", "child fell", "fell into",
        "collapsed", "electrocution", "fire hazard", "contaminated water",
        "sewage near", "overflowing sewage",
    ],
    "moderate": [
        "overflow", "blocked", "not working", "broken", "damaged", "leak",
        "shortage", "no water", "no supply", "uneven",
    ],
}


def _text_severity(text: str) -> str:
    lowered = (text or "").lower()
    for keyword in TEXT_SEVERITY_KEYWORDS["critical"]:
        if keyword in lowered:
            return "critical"
    for keyword in TEXT_SEVERITY_KEYWORDS["moderate"]:
        if keyword in lowered:
            return "moderate"
    return "cosmetic"


def severity(text: str, category: str) -> str:
    """severity = max(category_prior, text_severity). Deterministic, no
    model - per ARCHITECTURE.md 5.4, photos are evidence only, never a
    severity signal.
    """
    prior = CATEGORY_SEVERITY_PRIOR.get(category, "cosmetic")
    text_band = _text_severity(text)
    return max(prior, text_band, key=_BAND_ORDER.index)
