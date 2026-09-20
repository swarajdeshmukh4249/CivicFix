import re

_WARD_PATTERN = re.compile(r"\bward\s*(?:no\.?|number|num\.?)?\s*[:\-]?\s*(\d{1,2})\b", re.I)

_LANDMARK_PATTERN = re.compile(
    r"(?:near|at|opposite|behind|adjoining|adj\.?)\s+"
    r"([A-Za-z0-9][A-Za-z0-9\.\-\'\s]{2,50}?)"
    r"(?=,|\.| taluka| tal\.| district| dist\.| ward|$)",
    re.I,
)
_LANDMARK_STOPWORDS = {"sub", "ward", "dist", "tal", "no", "office"}

# Words that mean the landmark phrase has run into the next clause rather
# than continuing the place name (only matters when the sentence has no
# punctuation to stop at, e.g. "near Pashan Lake causing accidents").
_CONTINUATION_STOPWORDS = {
    "causing", "again", "today", "please", "urgently", "reported", "since",
    "because", "after", "before", "which", "that", "and", "for", "the",
    "this", "every", "time", "times", "daily", "weekly", "currently",
    "recently", "now", "still", "here", "there", "also", "already",
    "in", "of", "on", "is", "are", "was", "were", "has", "have", "had",
}
_LEADING_DETERMINERS = {"the", "a", "an"}


def extract_ward_number(text: str, max_ward_id: int = 58) -> int | None:
    """Pulls an explicit ward number out of free text, e.g. "Ward no.20",
    "ward no 20", "Ward 9". Returns None if absent or out of range rather
    than guessing.
    """
    if not text:
        return None
    match = _WARD_PATTERN.search(text)
    if not match:
        return None
    n = int(match.group(1))
    if not (1 <= n <= max_ward_id):
        return None
    return n


def extract_landmark_phrase(text: str) -> str | None:
    """Pulls a coarse "near/at/opposite/behind X" landmark phrase out of free
    text, for use as a geocoding query. This is a stopgap regex, not the
    real NER + gazetteer pipeline (app/nlp/location.py, Lane B) - it exists
    only so MPLADS works ingestion has something better than geocoding a raw,
    ungrammatical sentence (which reliably returns zero Nominatim results).
    """
    if not text:
        return None
    match = _LANDMARK_PATTERN.search(text)
    if not match:
        return None
    raw = match.group(1).strip().strip(".")

    remaining = raw.split()
    while remaining and remaining[0].lower() in _LEADING_DETERMINERS:
        remaining.pop(0)

    words = []
    for word in remaining:
        if word.lower().strip(".,") in _CONTINUATION_STOPWORDS:
            break
        words.append(word)
    phrase = " ".join(words)

    if len(phrase) < 4 or phrase.lower() in _LANDMARK_STOPWORDS:
        return None
    return phrase
