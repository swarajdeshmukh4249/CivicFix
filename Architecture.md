# ARCHITECTURE.md — WardSentry build spec

This is the **build** specification. It describes what we are coding in the next
12 hours, not the full product vision. Where this conflicts with anything in the
pitch deck, this file wins.

---

## 1. What the system does

Citizen complaints arrive as messy free text. WardSentry:

1. Understands each complaint (category, severity, location)
2. Collapses many complaints into one **civic issue**
3. Detects when a closed issue **recurs**
4. Links a recurring issue to the **public work already funded** to prevent it
5. Ranks issues by a **published formula**, never a model
6. Produces a **verification case** for a human — never a verdict

The differentiator is step 4. Everything else is table stakes.

**ISSUE ≠ TICKET.** The unit of record is the real-world issue. A complaint is
evidence about an issue, not a work item.

---

## 2. The central idea: two planes, one key

Two data sources are normalised independently, then joined.

| | Citizen plane | Public records plane |
|---|---|---|
| Nature | live, unstructured, multilingual | static, structured, government |
| Processing | per-complaint, synchronous | batch ETL |

Both reduce to the same **join key**:

```
ward_id  ·  geo-point within radius  ·  civic category  ·  time window
```

Nothing correlates until both sides speak this key. Build the normalisation on
both sides before attempting any matching.

---

## 3. Data sources

### Runtime

| Source | Contents | Notes |
|---|---|---|
| MPLADS | 60,359 public work records: name, cost, status, sanction/completion dates, implementing agency, constituency | **Already cleaned and in hand.** Primary asset. |
| PMC Open Data | Pune projects, departments, wards | Use if ingestion is quick; skip if it fights us |
| PMC GIS | ward boundaries | Needed for ward binding. If unavailable, approximate with a ward centroid table. |

### Offline — training only

| Source | Role |
|---|---|
| NYC 311 | trains the category classifier; tunes the dedup similarity threshold; validates method at scale |

NYC 311 **never appears at runtime**. It is training data. Keep this distinction
visible in the code layout (`training/` vs `app/`).

### Synthetic complaints

We generate ~400 Pune complaints for evaluation. **Critical:** seed a meaningful
portion of them at or near real MPLADS work locations, so issue→work links are
genuinely findable. Random coordinates produce a matcher with nothing to match.

Every synthetic row carries `is_synthetic = true` and the UI labels it. We never
present synthetic data as real citizen data.

---

## 4. Database schema

PostgreSQL 16 + PostGIS + pgvector. Single database, two logical stores sharing
the spatial index and category vocabulary.

```sql
CREATE EXTENSION postgis;
CREATE EXTENSION vector;

CREATE TYPE civic_category AS ENUM (
  'pothole_road', 'drainage_sewage', 'water_supply', 'streetlight',
  'garbage_waste', 'footpath', 'traffic_signage', 'other'
);

CREATE TYPE severity_band AS ENUM ('cosmetic', 'moderate', 'critical');

CREATE TABLE reports (
  id              bigserial PRIMARY KEY,
  raw_text        text NOT NULL,
  photo_url       text,
  reported_at     timestamptz NOT NULL,
  category        civic_category,
  category_conf   real,
  severity        severity_band,
  location_phrase text,              -- extracted span, before geocoding
  geom            geometry(Point,4326),
  geom_confidence real,              -- 1.0 exact, 0.4 ward-level fallback
  ward_id         int REFERENCES wards(id),
  embedding       vector(384),
  issue_id        bigint REFERENCES issues(id),
  is_synthetic    boolean NOT NULL DEFAULT false
);

CREATE TABLE issues (
  id              bigserial PRIMARY KEY,
  category        civic_category NOT NULL,
  geom            geometry(Point,4326),   -- centroid of member reports
  ward_id         int REFERENCES wards(id),
  first_reported  timestamptz,
  last_reported   timestamptz,
  report_count    int NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'open',  -- open | closed | reopened
  closed_at       timestamptz,
  recurrence_count int NOT NULL DEFAULT 0,
  priority_score  real,
  priority_breakdown jsonb,          -- every term, so the UI can show its working
  embedding       vector(384)
);

CREATE TABLE works (                 -- MPLADS
  id              bigserial PRIMARY KEY,
  work_name       text NOT NULL,
  description     text,
  cost            numeric,
  status          text,
  sanctioned_on   date,
  completed_on    date,
  agency          text,
  constituency    text,
  category        civic_category,    -- mapped from work type
  geom            geometry(Point,4326),
  ward_id         int REFERENCES wards(id),
  embedding       vector(384)
);

CREATE TABLE wards (
  id     serial PRIMARY KEY,
  name   text NOT NULL,
  geom   geometry(MultiPolygon,4326),
  population int,
  area_sqkm  real
);

CREATE TABLE matches (               -- issue -> work links
  id              bigserial PRIMARY KEY,
  issue_id        bigint NOT NULL REFERENCES issues(id),
  work_id         bigint NOT NULL REFERENCES works(id),
  semantic_score  real NOT NULL,
  distance_m      real NOT NULL,
  days_since_completion int,
  combined_score  real NOT NULL,
  match_reason    text NOT NULL,     -- human-readable, cites both record ids
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE signals (               -- rule outputs, for human review
  id              bigserial PRIMARY KEY,
  issue_id        bigint REFERENCES issues(id),
  match_id        bigint REFERENCES matches(id),
  rule_name       text NOT NULL,
  explanation     text NOT NULL,     -- must name the source records
  source_record_ids jsonb NOT NULL,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE sensitive_sites (       -- from OSM, for exposure
  id       bigserial PRIMARY KEY,
  name     text,
  kind     text NOT NULL,            -- school | hospital | market | bus_stop | water_body
  geom     geometry(Point,4326)
);

CREATE INDEX ON reports USING GIST (geom);
CREATE INDEX ON issues  USING GIST (geom);
CREATE INDEX ON works   USING GIST (geom);
CREATE INDEX ON sensitive_sites USING GIST (geom);
CREATE INDEX ON reports USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON works   USING ivfflat (embedding vector_cosine_ops);
```

---

## 5. Modules and contracts

Build in this order. Each module is independently testable.

### 5.1 `app/ingest/mplads.py`
```python
def load_mplads(csv_path: str) -> int
```
Reads the cleaned CSV, maps work types to `civic_category`, resolves locations to
points, binds to ward via `ST_Contains`, writes `works`. Returns row count.

Work descriptions get embedded here (batch, not per-row).

### 5.2 `app/nlp/classify.py`
```python
def train_classifier(nyc311_csv: str) -> None      # writes models/classifier.pkl
def classify(text: str) -> tuple[civic_category, float]
```
**Method:** sentence-transformers `all-MiniLM-L6-v2` embeddings → scikit-learn
`LogisticRegression`. Trained on NYC 311 with its categories mapped onto our
eight. Trains in minutes, not hours, and gives real precision/recall.

Baseline to beat: keyword rules. Implement `classify_keywords()` alongside it and
report both — this is the evidence that the model earned its place.

Below a confidence threshold → category `other`, routed to a manual queue. Never
silently guess.

### 5.3 `app/nlp/location.py`
```python
def extract_location_phrase(text: str) -> tuple[str | None, float]
def geocode(phrase: str, ward_hint: str | None) -> tuple[Point | None, float]
```
**Method:** spaCy `en_core_web_sm` NER for LOC/FAC/GPE spans, plus a gazetteer of
Pune landmarks and road names, plus regex for "near/opposite/behind X".
No custom model training.

Geocoding via Nominatim with a local cache (rate limits will bite otherwise).

**Fallback is mandatory:** if no point resolves, fall back to ward centroid with
`geom_confidence = 0.4`. Never guess a precise point. Report the resolution rate
honestly.

### 5.4 `app/nlp/severity.py`
```python
def severity(text: str, category: civic_category) -> severity_band
```
`max(category_prior, text_severity)`. Category priors are a published table
(open manhole and sewage-near-water rank high regardless of wording). Text
severity from keyword bands. **No photo model.** Photos are evidence only.

### 5.5 `app/core/clustering.py`
```python
def cluster_reports(reports: list[Report]) -> dict[int, int]   # report_id -> issue_id
```
Three axes together:
- cosine similarity on embeddings ≥ **0.82**
- Haversine distance ≤ **100 m**
- reported within a **7-day** window

DBSCAN over the combined distance. Same category only.

**Ship conservative.** Two issues that should be one is recoverable; one issue
that swallowed two distinct complaints is not.

Baseline to beat: fuzzy string / TF-IDF matching. Implement and report both.

### 5.6 `app/core/recurrence.py`
```python
def check_recurrence(issue: Issue) -> RecurrenceResult
```
A query, not a model. Prior **closed** issues, same ward, same category, within
radius. A hit reopens the issue, increments `recurrence_count`, and marks the
prior closure disproved.

### 5.7 `app/core/matcher.py`
```python
def match_issue_to_work(issue: Issue) -> Match | None
```
**This is the differentiator. Protect its time budget.**

- `cosine(issue.embedding, work.embedding)`
- `ST_DWithin(issue.geom, work.geom, radius)`
- completion date within a plausible window before the recurrence
- same category

Combined score, top-1 above threshold. Below threshold → **no match**, issue
stays in the standard queue, Sentinel does not engage.

Every match writes a human-readable `match_reason` naming both record ids.

### 5.8 `app/core/priority.py`
```python
def priority(issue: Issue) -> tuple[float, dict]
```
```
Priority = w1*Exposure + w2*Severity + w3*Recurrence + w4*TimeOpen
```
All terms normalised 0–1. Weights are **module-level constants in one file**,
printable, and returned in the breakdown dict so the UI can show its working.

**Exposure:**
```
Exposure = max{ weight(kind) : site within radius(ward_density) }
```
Published weights: school 1.0 · hospital 1.0 · market 0.7 · water_body 0.6
(higher for drainage/sewage categories) · bus_stop 0.5

`max`, not `sum` — a pothole near five bus stops must not outrank one near a
hospital. Radius scales inversely with ward population density.

**No model here, ever.** The brief forbids opaque priority decisions.

### 5.9 `app/core/signals.py`
```python
def evaluate_signals(issue: Issue, match: Match | None) -> list[Signal]
```
Deterministic rules only. Examples:
- complaints within N days of a work marked complete
- repeat sanctions at the same location, same category
- recurrence count above threshold with a matched work

Each signal's `explanation` names the exact records. Language is strictly
**"verification signal"**, never fraud, corruption, guilt or blame.

### 5.10 `app/api/` — FastAPI
```
GET  /wards
GET  /wards/{id}/reports
POST /wards/{id}/cluster        -> runs clustering live, returns issues
GET  /issues/{id}               -> issue + member reports + priority breakdown
GET  /issues/{id}/evidence      -> matched work, agency, dates, signals
POST /reports                   -> add one complaint live, classify + cluster it
GET  /metrics                   -> model vs baseline comparison
```

`POST /wards/{id}/cluster` must actually compute. The demo clicks this button.

### 5.11 `web/` — React + Vite + Leaflet

One page, four regions:
- **Raw complaints table** (before state)
- **Map** with issue markers, sized by report count, coloured by priority
- **Issue detail panel**: member reports, recurrence history, priority breakdown
  with every term visible
- **Evidence panel**: the matched work record beside the issue, match reason,
  confidence, source record ids

Plus an **Add complaint** box that posts live and re-clusters.

---

## 6. Evaluation — build this, it is cheap and it convinces

`GET /metrics` returns, computed on held-out data:

| Component | Compared against | Reported as |
|---|---|---|
| Classification | keyword rules | macro-F1, both |
| Deduplication | fuzzy string / TF-IDF | precision · recall, both |
| Location extraction | regex + gazetteer only | % resolved, both |
| Project matching | hand-labelled cases | top-1 accuracy |

Report real numbers. If a number is bad, show it. A team that reports a weak
number honestly is more credible than one that reports none.

---

## 7. Hard constraints

1. **Priority is a formula.** No model, ever.
2. **Every signal cites its source record ids.**
3. **No photo severity model.** No ground truth exists for it.
4. **Nothing hardcoded to make the demo pass.** Seeded data is fine and labelled.
   Computed values are computed at runtime.
5. **Synthetic data is labelled synthetic** in schema and UI.
6. **Never imply guilt.** Permitted relationships: operational responsibility,
   execution association, representation, geographic context. Permitted words:
   anomaly signal, verification priority, evidence, human review.
7. **Graceful degradation everywhere.** Geocoding fails → ward level. Match below
   threshold → no match. Classification below threshold → manual queue.
   Never a silent guess.

---

## 8. Out of scope today

WhatsApp and call-centre intake · multilingual handling (English only for the
prototype; say so) · confirm-before-dispatch loop · reviewer console · SLA
tracking · crew planning · MahaTenders ingestion · authentication · deployment.

These are architecture in the deck. They are not code today.