from app.db import get_connection

RECURRENCE_RADIUS_M = 300


def check_recurrence(issue: dict, conn) -> dict:
    """ARCHITECTURE.md 5.6: "a query, not a model." Looks for a prior
    CLOSED issue in the same ward and category. When both the candidate and
    a same-ward/category closed issue have geometry, additionally requires
    them within RECURRENCE_RADIUS_M - "same ward" alone is too coarse for a
    multi-km ward polygon to mean "same spot" on its own.

    `issue` needs only id, category, ward_id - geometry is looked up by id
    so this also works for an issue that was just inserted in the same
    uncommitted transaction.
    """
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT id
            FROM issues
            WHERE status = 'closed'
              AND category = %(category)s
              AND ward_id = %(ward_id)s
              AND id != %(issue_id)s
              AND (
                    (SELECT geom FROM issues WHERE id = %(issue_id)s) IS NULL
                    OR geom IS NULL
                    OR ST_DWithin(
                         geom::geography,
                         (SELECT geom FROM issues WHERE id = %(issue_id)s)::geography,
                         %(radius)s
                       )
              )
            ORDER BY last_reported DESC
            LIMIT 1
            """,
            {
                "category": issue["category"],
                "ward_id": issue["ward_id"],
                "issue_id": issue["id"],
                "radius": RECURRENCE_RADIUS_M,
            },
        )
        row = cur.fetchone()

    if row is None:
        return {"is_recurrence": False, "prior_issue_id": None}
    return {"is_recurrence": True, "prior_issue_id": row[0]}


def apply_recurrence(new_issue_id: int, prior_issue_id: int, conn) -> None:
    """A recurrence means the prior closure was wrong, not that a second,
    distinct issue exists - merges the new issue's reports into the
    reopened prior issue and removes the now-redundant new issue row.

    run_recurrence_check scans *every* open issue, not just one freshly
    created by the current report - so new_issue_id can be a long-standing
    issue that already has its own matches/signals (discovered for real: two
    separately-clustered synthetic issues at the same MPLADS anchor point,
    one later closed, triggered this on an unrelated open issue miles away
    in cluster-order terms). Those rows must be cleared before the DELETE
    below or it FK-violates on matches.issue_id / signals.issue_id -
    correctly, since the caller recomputes matches/signals for the
    surviving (prior) issue right after this returns.
    """
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE reports SET issue_id = %s WHERE issue_id = %s",
            (prior_issue_id, new_issue_id),
        )
        cur.execute(
            """
            UPDATE issues AS prior SET
                status = 'reopened',
                recurrence_count = prior.recurrence_count + 1,
                report_count = prior.report_count + new.report_count,
                last_reported = GREATEST(prior.last_reported, new.last_reported),
                closed_at = NULL
            FROM issues AS new
            WHERE prior.id = %(prior_id)s AND new.id = %(new_id)s
            """,
            {"prior_id": prior_issue_id, "new_id": new_issue_id},
        )
        cur.execute(
            "DELETE FROM signals WHERE issue_id = %(new_id)s "
            "OR match_id IN (SELECT id FROM matches WHERE issue_id = %(new_id)s)",
            {"new_id": new_issue_id},
        )
        cur.execute("DELETE FROM matches WHERE issue_id = %s", (new_issue_id,))
        cur.execute("DELETE FROM issues WHERE id = %s", (new_issue_id,))


def run_recurrence_check(conn=None) -> list[dict]:
    """Checks every currently-open issue against prior closed issues and
    applies any hits found. Returns the list of hits actually applied.

    Precondition worth stating plainly: this only ever finds something if
    at least one issue has status='closed'. Nothing in this codebase closes
    an issue yet (that's the reviewer-console workflow, explicitly out of
    scope per ARCHITECTURE.md section 8) - so on a fresh pipeline with no
    manual closures, this correctly returns an empty list, not a bug.
    """
    owns_conn = conn is None
    conn = conn or get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, category, ward_id FROM issues WHERE status = 'open' ORDER BY id")
            open_issues = [{"id": r[0], "category": r[1], "ward_id": r[2]} for r in cur.fetchall()]

        hits = []
        for issue in open_issues:
            result = check_recurrence(issue, conn)
            if result["is_recurrence"]:
                apply_recurrence(issue["id"], result["prior_issue_id"], conn)
                hits.append({"new_issue_id": issue["id"], "prior_issue_id": result["prior_issue_id"]})

        if owns_conn:
            conn.commit()
        return hits
    finally:
        if owns_conn:
            conn.close()
