import json

from app.db import get_connection

RECURRENCE_SIGNAL_THRESHOLD = 1
REPEAT_SANCTION_MIN_OTHER_WORKS = 1


def _spatial_note(match: dict) -> str:
    if match.get("distance_m") is not None:
        return f"{match['distance_m']:.0f}m from the matched work"
    return "in the same ward as the matched work (spatial precision is ward-level, not a measured distance)"


def evaluate_signals(issue: dict, match: dict | None, conn) -> list[dict]:
    """Deterministic rules only, per ARCHITECTURE.md 5.9. Every signal names
    the exact source records and uses "verification signal" framing, never
    fraud/corruption/guilt/blame language - this is evidence for a human
    reviewer, not a conclusion.

    An issue with no match gets no signal at all - never a fabricated
    public-work relationship. `issue` needs id, category, ward_id,
    recurrence_count; `match` (if not None) needs work_id and distance_m
    (None for a ward-level match).
    """
    if match is None:
        return []

    with conn.cursor() as cur:
        cur.execute("SELECT work_name, completed_on FROM works WHERE id = %s", (match["work_id"],))
        work_name, completed_on = cur.fetchone()
        cur.execute("SELECT id FROM reports WHERE issue_id = %s ORDER BY id", (issue["id"],))
        report_ids = [r[0] for r in cur.fetchall()]

    signals = []

    signals.append({
        "rule_name": "plausible_completion_window",
        "explanation": (
            f"Issue #{issue['id']} ({issue['category']}, {len(report_ids)} report(s): {report_ids}) has "
            f"a documented spatial/category relationship with MPLADS work #{match['work_id']} "
            f"('{work_name}'), completed on {completed_on}, {_spatial_note(match)}. This is a "
            f"verification signal for human review, not a finding about any individual, agency or work."
        ),
        "source_record_ids": {"issue_id": issue["id"], "work_id": match["work_id"], "report_ids": report_ids},
    })

    if issue.get("recurrence_count", 0) >= RECURRENCE_SIGNAL_THRESHOLD:
        signals.append({
            "rule_name": "recurrence_with_matched_work",
            "explanation": (
                f"Issue #{issue['id']} has recurred {issue['recurrence_count']} time(s) (reports: "
                f"{report_ids}) and has a matched public work (#{match['work_id']}, completed "
                f"{completed_on}). Recommended for human review: whether the underlying civic problem "
                f"was durably addressed by this work."
            ),
            "source_record_ids": {"issue_id": issue["id"], "work_id": match["work_id"], "report_ids": report_ids},
        })

    with conn.cursor() as cur:
        cur.execute(
            "SELECT id FROM works WHERE category = %s AND ward_id = %s AND id != %s AND status = 'completed'",
            (issue["category"], issue["ward_id"], match["work_id"]),
        )
        other_work_ids = [r[0] for r in cur.fetchall()]

    if len(other_work_ids) >= REPEAT_SANCTION_MIN_OTHER_WORKS:
        signals.append({
            "rule_name": "repeat_sanctions_same_category_ward",
            "explanation": (
                f"Ward #{issue['ward_id']} has {len(other_work_ids) + 1} completed MPLADS works in the "
                f"{issue['category']} category: the matched work #{match['work_id']} and "
                f"{len(other_work_ids)} other(s) ({other_work_ids}). Multiple public works funded for "
                f"the same category at this location is a verification signal for human review, not a "
                f"conclusion about any individual work."
            ),
            "source_record_ids": {
                "issue_id": issue["id"], "work_id": match["work_id"], "other_work_ids": other_work_ids,
            },
        })

    return signals


def run_signals(conn=None) -> int:
    """Rebuilds `signals` from scratch against the current `matches` table.
    Unmatched issues never get a row here - absence of a signal for an
    issue means exactly that, not an unexplored case.
    """
    owns_conn = conn is None
    conn = conn or get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM signals")
            cur.execute("SELECT id, issue_id, work_id, distance_m FROM matches ORDER BY issue_id")
            matches = cur.fetchall()

        total = 0
        for match_id, issue_id, work_id, distance_m in matches:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT category, ward_id, recurrence_count FROM issues WHERE id = %s", (issue_id,)
                )
                category, ward_id, recurrence_count = cur.fetchone()

            issue = {"id": issue_id, "category": category, "ward_id": ward_id, "recurrence_count": recurrence_count}
            match = {"id": match_id, "work_id": work_id, "distance_m": distance_m}
            for signal in evaluate_signals(issue, match, conn):
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO signals (issue_id, match_id, rule_name, explanation, source_record_ids)
                        VALUES (%s, %s, %s, %s, %s::jsonb)
                        """,
                        (issue_id, match_id, signal["rule_name"], signal["explanation"],
                         json.dumps(signal["source_record_ids"])),
                    )
                total += 1

        if owns_conn:
            conn.commit()
        return total
    finally:
        if owns_conn:
            conn.close()
