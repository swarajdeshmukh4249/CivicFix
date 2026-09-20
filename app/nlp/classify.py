import csv
import pickle

from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder

from app.categories import CIVIC_CATEGORIES

MODEL_PATH = "models/classifier.pkl"
CONFIDENCE_THRESHOLD = 0.5

# NYC 311's real "Complaint Type" taxonomy mapped onto our 8 categories.
# Anything not listed here (the large majority of NYC 311 complaint types)
# maps to 'other' - that's real signal, not a gap: most 311 complaints are
# outside our civic scope (noise, animals, illegal parking, permits, ...).
NYC311_CATEGORY_MAP = {
    "Street Condition": "pothole_road",
    "Highway Condition": "pothole_road",
    "Sewer": "drainage_sewage",
    "Water System": "water_supply",
    "Street Light Condition": "streetlight",
    "Sanitation Condition": "garbage_waste",
    "Missed Collection (All Materials)": "garbage_waste",
    "Sidewalk Condition": "footpath",
    "Traffic Signal Condition": "traffic_signage",
}

# Citizen complaint phrasing, deliberately different vocabulary from the
# institutional MPLADS work descriptions in app/ingest/category.py.
CITIZEN_KEYWORDS = {
    "pothole_road": [
        "pothole", "craters", "road caved", "road damage", "bumpy road",
        "road cracked", "broken road",
    ],
    "drainage_sewage": [
        "sewage", "drain overflow", "open drain", "manhole", "gutter blocked",
        "stagnant water", "drainage blocked", "sewer",
    ],
    "water_supply": [
        "no water supply", "water shortage", "water not coming",
        "low water pressure", "contaminated water", "water tanker",
    ],
    "streetlight": [
        "streetlight", "street light", "lamp post", "dark street", "no lighting",
    ],
    "garbage_waste": [
        "garbage", "trash", "waste not collected", "overflowing dustbin",
        "dustbin", "foul smell garbage",
    ],
    "footpath": [
        "footpath", "pavement", "no proper footpath", "walkway blocked",
    ],
    "traffic_signage": [
        "traffic signal", "traffic light", "missing signage", "zebra crossing",
        "speed breaker",
    ],
}

_embedding_model = None
_cached_model = None
_cached_model_path = None


def _get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model


def classify_keywords(text: str) -> tuple[str, float]:
    """Lexical baseline classifier for citizen complaint text. Confidence
    reflects how many distinct keyword phrases from the winning category hit,
    not a calibrated probability - it exists so the ML model's improvement
    over it is honestly measurable per ARCHITECTURE.md section 6.
    """
    if not text:
        return "other", 0.0

    lowered = text.lower()
    best_category = None
    best_hits = 0
    for category, keywords in CITIZEN_KEYWORDS.items():
        hits = sum(1 for kw in keywords if kw in lowered)
        if hits > best_hits:
            best_hits = hits
            best_category = category

    if best_category is None:
        return "other", 0.0
    confidence = min(0.6 + 0.15 * (best_hits - 1), 0.9)
    return best_category, confidence


def train_classifier(nyc311_csv: str, model_path: str = MODEL_PATH) -> None:
    """Trains the MiniLM-embedding + LogisticRegression classifier on NYC 311
    data, per ARCHITECTURE.md 5.2. Rows whose Complaint Type isn't in
    NYC311_CATEGORY_MAP are kept as 'other' training examples rather than
    dropped, since most real 311 traffic genuinely is outside our 8
    categories and the classifier needs to learn that too.
    """
    texts = []
    labels = []
    with open(nyc311_csv, newline="") as f:
        for row in csv.DictReader(f):
            complaint_type = row.get("Complaint Type", "")
            descriptor = row.get("Descriptor", "")
            text = f"{complaint_type}: {descriptor}".strip(": ")
            if not text:
                continue
            texts.append(text)
            labels.append(NYC311_CATEGORY_MAP.get(complaint_type, "other"))

    embeddings = _get_embedding_model().encode(texts, show_progress_bar=False)

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(labels)

    model = LogisticRegression(max_iter=1000)
    model.fit(embeddings, y)

    with open(model_path, "wb") as f:
        pickle.dump({"model": model, "label_encoder": label_encoder}, f)


def classify(text: str) -> tuple[str, float]:
    """Classifies citizen complaint text into a civic_category with a
    confidence. Uses the trained MiniLM+LogisticRegression model if
    models/classifier.pkl exists, else falls back to the keyword baseline.
    Below CONFIDENCE_THRESHOLD, forces category to 'other' (manual review)
    per ARCHITECTURE.md 5.2 - the returned confidence is left as-is so
    callers can still see how low it was.
    """
    global _cached_model, _cached_model_path

    if not text:
        return "other", 0.0

    import os

    if os.path.exists(MODEL_PATH):
        if _cached_model is None or _cached_model_path != MODEL_PATH:
            with open(MODEL_PATH, "rb") as f:
                _cached_model = pickle.load(f)
            _cached_model_path = MODEL_PATH
        embedding = _get_embedding_model().encode([text], show_progress_bar=False)
        model = _cached_model["model"]
        label_encoder = _cached_model["label_encoder"]
        probs = model.predict_proba(embedding)[0]
        best_idx = probs.argmax()
        category = label_encoder.inverse_transform([best_idx])[0]
        confidence = float(probs[best_idx])
    else:
        category, confidence = classify_keywords(text)

    if confidence < CONFIDENCE_THRESHOLD:
        return "other", confidence
    return category, confidence
