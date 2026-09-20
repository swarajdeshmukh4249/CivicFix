from app.nlp.translate import translate_to_english


def test_unsupported_language_returns_none():
    assert translate_to_english("bonjour le monde", "fr") is None


def test_english_source_not_in_map_returns_none():
    assert translate_to_english("hello", "en") is None


def test_translation_failure_degrades_to_none(monkeypatch):
    import app.nlp.translate as translate_module

    class _Boom:
        def __init__(self, *a, **kw):
            pass

        def translate(self, text):
            raise RuntimeError("service unavailable")

    monkeypatch.setattr(translate_module, "MyMemoryTranslator", _Boom)
    assert translate_to_english("कुछ भी", "hi") is None


def test_real_hindi_translation_produces_english_text():
    # A real network call to the free MyMemory service - skip rather than
    # fail the whole suite if it's unreachable from this environment.
    import pytest

    result = translate_to_english("सड़क पर बहुत बड़ा गड्ढा है", "hi")
    if result is None:
        pytest.skip("MyMemory translation service unreachable in this environment")
    assert isinstance(result, str) and len(result) > 0
    assert "hole" in result.lower() or "pit" in result.lower() or "pothole" in result.lower()
