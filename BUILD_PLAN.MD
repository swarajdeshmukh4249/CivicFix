# BUILD_PLAN.md — 12-hour schedule

Three people, three lanes, from hour 1. The matcher is the critical path — it
depends on both other lanes finishing their piece, so it cannot start until
hour 4. Protect that dependency; do not let either upstream lane slip.

Assign lanes to whoever owns that area already:
**A = data/backend, B = NLP/ML, C = frontend.** Adjust names, not the shape.

---

## Hour 0–1 : Setup, together

- `docker-compose up` — Postgres + PostGIS + pgvector
- Run the schema from `ARCHITECTURE.md` §4
- Confirm everyone can connect and run a query
- Load the MPLADS CSV, unprocessed, just to confirm the file and columns

**Checkpoint:** all three can hit the database. Do not proceed split until this
is true for everyone.

---

## Hour 1–4 : Parallel

### Lane A — Data foundation
- `app/ingest/mplads.py` — load, map categories, resolve locations, bind wards
- Ward table: load PMC GIS if fast, otherwise a hand-built centroid table for
  8–10 wards is enough for the demo
- OSM sensitive sites (schools, hospitals, markets) for the exposure calc —
  Overpass API query, cached to a file so it only runs once
- **By hour 4:** `works` table populated with geometry and embeddings

### Lane B — NLP
- `app/nlp/classify.py` — train on NYC 311, both the model and the keyword
  baseline, save `models/classifier.pkl`
- `app/nlp/location.py` — spaCy + gazetteer + Nominatim with caching
- `app/nlp/severity.py` — category priors + text bands
- Generate ~400 synthetic Pune complaints — **seed a meaningful share at or near
  real MPLADS coordinates**, this is the step that makes the matcher work later
- **By hour 4:** `reports` table populated, classified, geocoded

### Lane C — Frontend scaffold
- Vite + React + Leaflet, pointed at a mock API response
- Map with static markers, issue list, detail panel layout
- Build against fixtures — do not wait on the API being real
- **By hour 4:** page renders with fake data, ready to swap to live endpoints

**Checkpoint at hour 4:** `works` and `reports` both populated with geometry and
embeddings. If either is behind, everyone helps that lane before moving on —
the matcher cannot start without both.

---

## Hour 4–6 : Converge on the core

### Lane A + B together — the differentiator
- `app/core/clustering.py` — cosine + Haversine + time window, DBSCAN, plus the
  fuzzy-match baseline for comparison
- `app/core/recurrence.py`
- `app/core/matcher.py` — **this is the demo.** Budget extra time here. Run it
  against real data early and often, not once at the end.
- Hand-check the first matches. If nothing links convincingly, loosen the
  threshold or seed more complaints near MPLADS points — do not move on with
  zero convincing matches.

### Lane C
- FastAPI endpoints stubbed and returning real (if incomplete) data
- Wire the frontend to real `/wards` and `/wards/{id}/reports`

**Checkpoint at hour 6:** at least one issue→work match exists and looks right
by eye.

---

## Hour 6–8

### Lane A + B
- `app/core/priority.py` — formula, weights, breakdown dict
- `app/core/signals.py` — the rule set, source ids attached
- `GET /metrics` — model vs baseline numbers, even if unglamorous

### Lane C
- Issue detail panel: member reports, recurrence history, priority breakdown
  with every term visible
- Evidence panel: matched work beside the issue, match reason, confidence

**Checkpoint at hour 8:** clicking an issue on the map shows real priority and
real evidence, not mock data.

---

## Hour 8–10 : Everyone on the demo path

- Walk `DEMO.md` end to end, exactly as it will be presented
- Fix whatever breaks in that specific path — ignore bugs outside it
- Confirm at least 3 convincing matches exist (you need spares, not just one)
- Confirm live-add-a-complaint actually reclassifies and reclusters
- Prepare the second, unseen test case for the "run it again" moment

---

## Hour 10–11.5 : Metrics, honesty, polish

- Fill in real numbers on `/metrics` — if a number is weak, keep it, do not hide it
- One sentence per person ready: "here's a case our matcher gets wrong, and why"
- Cut anything that doesn't serve `DEMO.md` — extra pages, unused endpoints, dead
  buttons. A judge notices a broken button faster than a missing feature.

## Hour 11.5–12 : Rehearse

- Full run-through, timed, on the actual demo machine
- Kill the dev server and restart clean once — confirm it boots from nothing
- Charge laptops, confirm offline fallback (screenshots/recording) if the venue
  wifi is unreliable

---

## If something is badly behind at hour 6

Cut in this order, not randomly:

1. Frontend polish (map styling, animations)
2. `/metrics` sophistication — a simple version is fine
3. Multiple issue types — narrow to 3 categories instead of 8
4. Ward count — 3 wards is enough for a demo

**Never cut:** the matcher, the priority breakdown, the evidence panel. Those
three are the entire argument.