"""Local library, CSV and JSON persistence for the complete research agent.

Original Section 4–6 scripts and their output formats remain unchanged.
"""
import csv
import hashlib
import json
import os
import re
import tempfile
from datetime import datetime, timezone
from pathlib import Path

PAPER_COLUMNS = ["title", "year", "authors", "doi", "openalex_url", "search_query"]
PDF_REPORT_COLUMNS = [
    "title", "doi", "openalex_url", "status", "pdf_path",
    "source_pdf_url", "candidate_pdf_url", "manual_url", "scholar_url",
    "research_status", "error",
]


def timestamp():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def safe_slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower()).strip("_")[:50] or "search"


def pdf_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_csv(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    with path.open("r", encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def write_csv_atomic(path: Path, rows: list[dict], headers: list[str]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8-sig", newline="",
                                     dir=path.parent, delete=False) as stream:
        temp = Path(stream.name)
        try:
            writer = csv.DictWriter(stream, fieldnames=headers, extrasaction="ignore")
            writer.writeheader()
            writer.writerows(rows)
        except BaseException:
            temp.unlink(missing_ok=True)
            raise
    os.replace(temp, path)


def paper_id(row: dict) -> str:
    doi = str(row.get("doi") or "").strip().lower()
    doi = re.sub(r"^(https?://(?:dx\.)?doi\.org/|doi:\s*)", "", doi)
    if doi:
        return "doi:" + doi
    openalex = str(row.get("openalex_url") or "").strip().rstrip("/").lower()
    if openalex:
        return "openalex:" + openalex.rsplit("/", 1)[-1]
    return "title:" + re.sub(r"\s+", " ", str(row.get("title") or "").strip().lower())


class Library:
    def __init__(self, root: Path):
        self.root = root.resolve()
        self.papers = self.root / "papers"
        self.outputs = self.root / "outputs"
        self.state_dir = self.root / "state"
        self.search_dir = self.state_dir / "searches"
        self.state_file = self.state_dir / "library.json"
        self.paper_csv = self.root / "papers.csv"
        self.manifest_csv = self.root / "pdf_manifest.csv"
        self.comparison_csv = self.outputs / "method_comparison.csv"
        for folder in (self.papers, self.outputs, self.search_dir):
            folder.mkdir(parents=True, exist_ok=True)
        if self.state_file.exists():
            self.state = json.loads(self.state_file.read_text(encoding="utf-8"))
        else:
            self.state = {"version": 1, "analysed": {}, "search_history": []}
        if not isinstance(self.state.get("analysed"), dict):
            raise ValueError("Invalid library state: analysed must be an object")

    def save(self):
        with tempfile.NamedTemporaryFile("w", encoding="utf-8",
                                         dir=self.state_dir, delete=False) as stream:
            tmp = Path(stream.name)
            try:
                json.dump(self.state, stream, indent=2, ensure_ascii=False)
                stream.write("\n")
            except BaseException:
                tmp.unlink(missing_ok=True)
                raise
        os.replace(tmp, self.state_file)

    def paper_path(self, name: str) -> Path:
        """Only allow PDFs physically inside the managed papers directory."""
        if not name or not name.strip():
            raise ValueError("A PDF filename is required.")
        path = (self.papers / Path(name).name).resolve()
        if path.parent != self.papers.resolve() or path.suffix.lower() != ".pdf":
            raise ValueError("Select a PDF located directly inside papers/.")
        if not path.is_file():
            raise FileNotFoundError(f"No such PDF in papers/: {Path(name).name}")
        return path

    def inventory(self) -> list[dict]:
        records = []
        for path in sorted(self.papers.glob("*")):
            if path.suffix.lower() != ".pdf":
                continue
            try:
                valid = self.paper_path(path.name)
                digest = pdf_sha256(valid)
            except (OSError, ValueError):
                continue
            previous = self.state["analysed"].get(digest)
            records.append({
                "filename": valid.name,
                "sha256": digest,
                "analysed": bool(previous and Path(previous.get("csv", "")).is_file()),
                "modified": valid.stat().st_mtime,
            })
        return records

    def pending(self) -> list[dict]:
        return [item for item in self.inventory() if not item["analysed"]]

    def merge_papers(self, additions: list[dict]) -> tuple[int, int]:
        current = read_csv(self.paper_csv)
        known = {paper_id(row) for row in current}
        added = 0
        for paper in additions:
            if not str(paper.get("title") or "").strip():
                continue
            row = {key: paper.get(key, "") for key in PAPER_COLUMNS}
            if isinstance(row["authors"], list):
                row["authors"] = ", ".join(row["authors"])
            row = {key: str(value or "") for key, value in row.items()}
            identity = paper_id(row)
            if identity in known:
                continue
            known.add(identity)
            current.append(row)
            added += 1
        write_csv_atomic(self.paper_csv, current, PAPER_COLUMNS)
        return added, len(current)

    def merge_download_report(self, additions: list[dict]) -> tuple[int, int]:
        existing = read_csv(self.manifest_csv)
        positions = {paper_id(row): i for i, row in enumerate(existing)}
        for item in additions:
            key = paper_id(item)
            if key in positions:
                existing[positions[key]] = {field: item.get(field, "") for field in PDF_REPORT_COLUMNS}
            else:
                positions[key] = len(existing)
                existing.append({field: item.get(field, "") for field in PDF_REPORT_COLUMNS})
        write_csv_atomic(self.manifest_csv, existing, PDF_REPORT_COLUMNS)
        return len(additions), len(existing)

    def status(self) -> dict:
        inventory = self.inventory()
        reviews = read_csv(self.comparison_csv)
        failed = sum(row.get("status") == "FAILED" for row in read_csv(self.manifest_csv))
        return {
            "paper_metadata_records": len(read_csv(self.paper_csv)),
            "pdf_files": len(inventory),
            "analysed_pdfs": sum(item["analysed"] for item in inventory),
            "pending_pdfs": [item["filename"] for item in inventory if not item["analysed"]],
            "method_table_rows": len(reviews),
            "failed_download_records": failed,
            "method_table": str(self.comparison_csv.relative_to(self.root)),
            "manual_pdf_folder": "papers/",
        }
