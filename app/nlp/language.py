"""Lightweight, honest language *detection* only - not translation and not a
multilingual pipeline. Per ARCHITECTURE.md section 8, full multilingual
handling is explicitly out of scope for the prototype ("English only ... say
so"). This module is the minimal piece that lets the system say so per
report, instead of silently misclassifying non-English text: a report
detected as non-English still runs through the (English-only) classifier and
geocoder exactly as before - nothing about the pipeline changes - but the
detected language is stored and surfaced so a human reviewer knows to treat
that report's category/severity as unreliable.
"""
from langdetect import DetectorFactory, LangDetectException, detect

# langdetect's detection is non-deterministic across runs unless seeded -
# fixed here so the same input always returns the same language, matching
# hard rule 4 (nothing presented as computed may vary run to run).
DetectorFactory.seed = 0

ENGLISH = "en"


def detect_language(text: str) -> str | None:
    """Returns an ISO 639-1 code, or None if detection isn't possible (e.g.
    text too short/ambiguous - langdetect raises on those). None is a real
    "unknown", never coerced to "en" - callers must treat it as such."""
    try:
        return detect(text)
    except LangDetectException:
        return None
