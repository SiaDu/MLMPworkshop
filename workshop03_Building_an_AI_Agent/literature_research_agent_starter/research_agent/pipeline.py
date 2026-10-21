"""Deterministic Python tools used by the Section 7 language-model agent.

Reuse the Section 4–6 algorithms without modifying the existing lesson scripts.
Each operation can run independently in the same project directory.
"""
import csv
import json
import os
import uuid
from datetime import datetime
from pathlib import Path

import requests

from .comparison import append_review, table_summary
from .legacy import load_script
from .storage import Library, read_csv, timestamp, pdf_sha256, paper_id


class ResearchPipeline:
    def __init__(self, root: Path):
        self.library = Library(root)
        self.root = self.library.root

    def search(self, topic: str, count: int = 10, start_year: int = 2022) -> dict:
        """Run Section 4 research agent with user parameters; preserve past searches."""
        if not isinstance(topic, str) or not topic.strip():
            raise ValueError("Please provide a research topic.")
        if not 1 <= count <= 30:
            raise ValueError("Paper count must be between 1 and 30 per search.")
        if not 2000 <= start_year <= datetime.now().year:
            raise ValueError("Publication start year is out of range.")

        script = load_script(str(self.root), "04")
        run_id = datetime.now().strftime("%Y%m%d_%H%M%S") + "_" + uuid.uuid4().hex[:6]
        directory = self.library.search_dir
        plan_path = directory / (run_id + "_plan.json")
        records_path = directory / (run_id + "_papers.csv")
        log_path = directory / (run_id + "_search_log.json")

        # Explicitly seed the requested year, so the LLM cannot accidentally
        # change the user's date constraint while planning search keywords.
        seed_queries = [
            topic.strip(),
            topic.strip() + " methods deep learning",
            topic.strip() + " dataset evaluation",
        ]
        plan = script.SearchPlan(
            topic=topic.strip(), search_queries=seed_queries, start_year=start_year
        )
        plan_path.write_text(plan.model_dump_json(indent=2) + "\n", encoding="utf-8")
        overrides = {
            "TOPIC": topic.strip(),
            "TARGET_PAPERS": count,
            "DEFAULT_START_YEAR": start_year,
            "PLAN_FILE": plan_path,
            "PAPERS_FILE": records_path,
            "LOG_FILE": log_path,
        }
        previous = {name: getattr(script, name) for name in overrides}
        try:
            for name, value in overrides.items():
                setattr(script, name, value)
            script.main()
        finally:
            for name, value in previous.items():
                setattr(script, name, value)

        papers = read_csv(records_path)
        new_count, library_total = self.library.merge_papers(papers)
        info = json.loads(log_path.read_text(encoding="utf-8"))
        self.library.state["latest_search_ids"] = [paper_id(paper) for paper in papers]
        self.library.state["latest_download_paths"] = []
        self.library.state["search_history"].append({
            "at": timestamp(), "topic": topic.strip(),
            "requested": count, "found": len(papers),
            "new_in_library": new_count, "start_year": start_year,
            "search_log": str(log_path.relative_to(self.root)),
        })
        self.library.save()
        return {
            "requested": count, "found": len(papers),
            "new_unique_papers": new_count, "library_total": library_total,
            "stop_reason": info.get("stop_reason"),
            "search_error": info.get("error"),
            "papers_csv": "papers.csv",
            "search_log": str(log_path.relative_to(self.root)),
            "note": "Paper metadata is not the paper's full text.",
        }

    def download(self, limit: int = 0, latest_search_only: bool = True) -> dict:
        """Download open PDFs; by default restrict to the most recent search."""
        if not 0 <= limit <= 30:
            raise ValueError("limit must be between 0 and 30 (0 = all selected records).")
        all_entries = list(enumerate(read_csv(self.library.paper_csv), start=1))
        if not all_entries:
            return {"status": "NO_PAPERS", "message": "Search for papers first, or place a PDF in papers/."}
        recent_ids = set(self.library.state.get("latest_search_ids") or [])
        if latest_search_only and recent_ids:
            entries = [(i, row) for i, row in all_entries if paper_id(row) in recent_ids]
        else:
            entries = all_entries
        if limit:
            entries = entries[:limit]
        downloader = load_script(str(self.root), "06")
        session = requests.Session()
        session.headers.update({"User-Agent": downloader.USER_AGENT})
        robots = downloader.RobotsPolicy(session)
        outcome = {"DOWNLOADED": 0, "EXISTING": 0, "FAILED": 0}
        available_filenames = []
        for count_index, (index, row) in enumerate(entries, start=1):
            print(f"[DOWNLOAD {count_index}/{len(entries)}] {row.get('title', '')[:70]}", flush=True)
            try:
                result = downloader.process_paper(
                    session, robots, row, index, self.library.papers,
                    40 * 1024 * 1024,
                )
            except Exception as error:
                result = {key: "" for key in downloader.MANIFEST_COLUMNS}
                result.update({
                    "title": row.get("title") or "",
                    "doi": row.get("doi") or "",
                    "openalex_url": row.get("openalex_url") or "",
                    "status": "FAILED", "research_status": "UNKNOWN",
                    "error": f"Unexpected {type(error).__name__}; manual review needed.",
                })
            outcome[result["status"]] += 1
            if result["status"] in {"DOWNLOADED", "EXISTING"} and result.get("pdf_path"):
                available_filenames.append(Path(result["pdf_path"]).name)
            # Commit per paper: an interruption does not lose previous results.
            self.library.merge_download_report([result])
            self.library.state["latest_download_paths"] = available_filenames
            self.library.save()
            print(f"  [{result['status']}] {result.get('pdf_path') or result.get('error', '')[:100]}")
        return {
            "processed": len(entries), **outcome,
            "available": outcome["DOWNLOADED"] + outcome["EXISTING"],
            "scope": "latest_search" if latest_search_only and recent_ids else "all_metadata",
            "manifest": "pdf_manifest.csv",
            "pdf_folder": "papers/",
        }

    def analyse_one(self, filename: str) -> dict:
        """Analyse one PDF; skip unchanged files already in the cumulative table."""
        path = self.library.paper_path(filename)
        digest = pdf_sha256(path)
        previous = self.library.state["analysed"].get(digest)
        if previous and Path(previous.get("csv", "")).is_file():
            return {"status": "ALREADY_ANALYSED", "filename": path.name,
                    "comparison_table": str(self.library.comparison_csv.relative_to(self.root))}

        section5 = load_script(str(self.root), "05")
        print(f"[RAG] Analysing {path.name}", flush=True)
        pages = section5.read_pdf(path)
        chunks = section5.make_chunks(pages)
        retrieved, selected = section5.retrieve(chunks)
        analysis = section5.gemini_analyse(pages, selected)
        verified = section5.verify_answers(analysis, selected)
        metadata, warnings = section5.lookup_metadata(pages, analysis.paper_title, None)
        bibtex = section5.fetch_bibtex(metadata["doi"])
        section5.write_outputs(path, pages, chunks, retrieved, selected,
                               verified, metadata, bibtex, warnings)

        import re
        output_folder = self.library.outputs / re.sub(r"[^A-Za-z0-9_.-]+", "_", path.stem)
        individual_csv = output_folder / "literature_review.csv"
        rows = read_csv(individual_csv)
        if len(rows) != 1:
            raise ValueError("Expected exactly one row in the per-paper review CSV.")

        result = append_review(self.library, digest, path.name, rows[0])
        self.library.state["analysed"][digest] = {
            "filename": path.name, "csv": str(individual_csv),
            "timestamp": timestamp(),
        }
        self.library.save()
        return {
            "status": "ANALYSED", "filename": path.name,
            "method_row": result["status"], "total_table_rows": result["rows"],
            "individual_csv": str(individual_csv.relative_to(self.root)),
            "comparison_table": result["table"],
            "warnings": warnings,
            "note": "Verify at least two fields against the original PDF.",
        }

    def analyse_all(self, limit: int = 0) -> dict:
        """Only analyse PDFs not previously completed; do not redo old records."""
        if not 0 <= limit <= 30:
            raise ValueError("limit must be between 0 and 30 (0 = all up to 30).")
        pending = self.library.pending()
        if limit:
            pending = pending[:limit]
        else:
            pending = pending[:30]
        results = []
        for item in pending:
            try:
                result = self.analyse_one(item["filename"])
            except Exception as error:
                print(f"[RAG FAILED] {item['filename']}: {error}")
                result = {"status": "FAILED", "filename": item["filename"],
                          "error": f"{type(error).__name__}: {str(error)[:160]}"}
            results.append(result)
        return {
            "processed": len(results),
            "analysed": sum(x["status"] == "ANALYSED" for x in results),
            "failed": sum(x["status"] == "FAILED" for x in results),
            "results": results,
            "comparison_table": str(self.library.comparison_csv.relative_to(self.root)),
            "still_pending": len(self.library.pending()),
        }

    def analyse_latest_downloads(self) -> dict:
        """Analyse only PDFs obtained for the most recent download batch.

        Intended for multi-tool tasks such as 'search, download, make a table'.
        Older, unrelated local PDFs are not included.
        """
        names = list(dict.fromkeys(self.library.state.get("latest_download_paths") or []))
        results = []
        for name in names[:30]:
            try:
                result = self.analyse_one(name)
            except Exception as error:
                result = {"status": "FAILED", "filename": name,
                          "error": f"{type(error).__name__}: {str(error)[:160]}"}
            results.append(result)
        return {
            "selected": len(names[:30]),
            "analysed": sum(item["status"] == "ANALYSED" for item in results),
            "already_analysed": sum(item["status"] == "ALREADY_ANALYSED" for item in results),
            "failed": sum(item["status"] == "FAILED" for item in results),
            "results": results,
            "comparison_table": str(self.library.comparison_csv.relative_to(self.root)),
        }

    def analyse_only_new_one(self) -> dict:
        """Avoid guessing which single PDF the student means when several are pending."""
        pending = self.library.pending()
        if not pending:
            return {"status": "NOTHING_NEW", "message": "All local PDFs have been analysed."}
        if len(pending) != 1:
            return {"status": "NEED_FILENAME", "pending_filenames":
                    [item["filename"] for item in pending],
                    "message": "More than one PDF has not been analysed. Ask the student which one."}
        return self.analyse_one(pending[0]["filename"])

    def list_local_pdfs(self) -> dict:
        return {"pdfs": [{k: v for k, v in item.items() if k != "modified"}
                         for item in self.library.inventory()]}

    def status(self) -> dict:
        return self.library.status()

    def failures(self) -> dict:
        rows = read_csv(self.library.manifest_csv)
        return {"failed_papers": [
            {key: row.get(key, "") for key in
             ("title", "doi", "error", "manual_url", "scholar_url")}
            for row in rows if row.get("status") == "FAILED"
        ], "manifest": "pdf_manifest.csv"}

    def table(self) -> dict:
        return table_summary(self.library)
