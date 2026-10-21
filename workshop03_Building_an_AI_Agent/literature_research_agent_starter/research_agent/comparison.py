"""Incremental method comparison: never overwrite a student's existing cells."""
from .storage import read_csv, write_csv_atomic

REVIEW_FIELDS = [
    "BibTeX", "Year", "Journal / Conference", "Paper Title",
    "Model", "Dataset Name", "Evaluation Metric", "Core Research Question",
    "Solution", "Dataset Description", "Contributions", "Limitations",
    "Future Work",
]
IDENTITY_FIELDS = ["PDF SHA256", "PDF Filename"]


def append_review(library, paper_sha: str, filename: str, row: dict) -> dict:
    destination = library.comparison_csv
    previous = read_csv(destination)
    for existing in previous:
        if existing.get("PDF SHA256") == paper_sha:
            # Preserve the student's manual changes; do not replace old rows.
            return {"status": "EXISTING_ROW", "rows": len(previous),
                    "table": str(destination.relative_to(library.root))}

    # Keep any additional columns that a student manually added.
    headers = REVIEW_FIELDS + IDENTITY_FIELDS
    if destination.is_file():
        import csv
        with destination.open(encoding="utf-8-sig", newline="") as stream:
            old_headers = next(csv.reader(stream), [])
        headers = list(dict.fromkeys([*old_headers, *headers]))

    new_row = {key: row.get(key, "") for key in REVIEW_FIELDS}
    new_row.update({"PDF SHA256": paper_sha, "PDF Filename": filename})
    previous.append(new_row)
    write_csv_atomic(destination, previous, headers)
    return {"status": "ADDED_ROW", "rows": len(previous),
            "table": str(destination.relative_to(library.root))}


def table_summary(library) -> dict:
    rows = read_csv(library.comparison_csv)
    return {
        "table": str(library.comparison_csv.relative_to(library.root)),
        "rows": len(rows),
        "papers": [item.get("Paper Title", "") for item in rows[:30]],
        "columns": REVIEW_FIELDS,
    }
