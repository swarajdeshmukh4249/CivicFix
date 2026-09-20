// MPLADS gives no separate title field: work_name is derived from
// description at ingest time (app/ingest/mplads.py::_work_name), so for
// short works the two are the same sentence with only whitespace differing.
// This tells the UI when showing description again would just repeat the title.
function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function hasDistinctDescription(workName: string, description: string | null | undefined): boolean {
  if (!description) return false;
  return normalize(description) !== normalize(workName);
}
