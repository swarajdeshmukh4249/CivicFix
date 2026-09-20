"""Real translation, not a stub - lets a non-English report actually be
classified/severity-scored/geocoded by the existing English-only pipeline,
instead of only being flagged (see app/nlp/language.py). Uses MyMemory (via
deep-translator), a free, no-API-key translation service, chosen after
GoogleTranslator returned TooManyRequests immediately in this environment -
MyMemory tested reliably for Hindi and Marathi, the languages this civic
system most needs.

Only languages this system explicitly claims to support (matching
LANGUAGE_LABELS in web/src/components/Badges.tsx) are attempted - an
unmapped code degrades to None (no translation) rather than guessing a
MyMemory locale code that might not exist.
"""
from deep_translator import MyMemoryTranslator

# langdetect ISO 639-1 code -> MyMemory locale code
_MYMEMORY_SOURCE = {
    "hi": "hi-IN", "mr": "mr-IN", "ur": "ur-PK", "ta": "ta-IN", "te": "te-IN",
    "bn": "bn-IN", "gu": "gu-IN", "kn": "kn-IN", "ml": "ml-IN", "pa": "pa-IN",
}
_MYMEMORY_TARGET = "en-GB"


def translate_to_english(text: str, language: str) -> str | None:
    """Returns an English translation, or None if the language isn't one we
    translate or the translation call itself fails (network/rate-limit) -
    callers must fall back to running the pipeline on the original text,
    never crash, per the graceful-degradation rule."""
    source = _MYMEMORY_SOURCE.get(language)
    if source is None:
        return None
    try:
        return MyMemoryTranslator(source=source, target=_MYMEMORY_TARGET).translate(text)
    except Exception:
        return None
