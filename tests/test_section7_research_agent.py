"""Offline tests for Section 7's cumulative research agent (no Gemini/OpenAlex calls)."""
import csv
import json
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

STARTER = (Path(__file__).resolve().parents[1]
           / "workshop03_Building_an_AI_Agent"
           / "literature_research_agent_starter")
sys.path.insert(0, str(STARTER))

from research_agent.comparison import append_review, REVIEW_FIELDS
from research_agent.pipeline import ResearchPipeline
from research_agent.storage import Library, read_csv, write_csv_atomic, pdf_sha256


class CompleteAgentTests(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.addCleanup(self.tempdir.cleanup)
        self.root = Path(self.tempdir.name)
        self.library = Library(self.root)

    def test_merge_papers_retains_existing_and_skips_duplicate_doi(self):
        old = {"title": "Paper A", "doi": "https://doi.org/10.1234/test",
               "year": "2024", "authors": "Author A"}
        new = {"title": "Paper B", "doi": "https://doi.org/10.5678/other",
               "year": "2025", "authors": ["Author B", "Author C"]}
        self.assertEqual(self.library.merge_papers([old]), (1, 1))
        self.assertEqual(self.library.merge_papers([
            {"title": "A duplicate", "doi": "10.1234/TEST"}, new
        ]), (1, 2))
        rows = read_csv(self.library.paper_csv)
        self.assertEqual(rows[0]["title"], "Paper A")
        self.assertEqual(rows[1]["authors"], "Author B, Author C")

    def test_method_table_preserves_student_edits_and_existing_rows(self):
        first = {key: "" for key in REVIEW_FIELDS}
        first.update({"Paper Title": "Paper A", "Model": "Transformer"})
        second = {key: "" for key in REVIEW_FIELDS}
        second.update({"Paper Title": "Paper B", "Model": "CNN"})

        x = append_review(self.library, "sha-of-a", "a.pdf", first)
        self.assertEqual(x["status"], "ADDED_ROW")
        rows = read_csv(self.library.comparison_csv)
        rows[0]["Model"] = "Manually corrected method"
        rows[0]["My Notes"] = "Read original figure"
        original_header = REVIEW_FIELDS + ["PDF SHA256", "PDF Filename", "My Notes"]
        write_csv_atomic(self.library.comparison_csv, rows, original_header)

        again = append_review(self.library, "sha-of-a", "a.pdf", first)
        self.assertEqual(again["status"], "EXISTING_ROW")
        new = append_review(self.library, "sha-of-b", "b.pdf", second)
        self.assertEqual(new["rows"], 2)
        final = read_csv(self.library.comparison_csv)
        self.assertEqual(final[0]["Model"], "Manually corrected method")
        self.assertEqual(final[0]["My Notes"], "Read original figure")
        self.assertEqual(final[1]["Paper Title"], "Paper B")

    def test_manual_pdf_one_new_or_request_filename_when_ambiguous(self):
        one = self.library.papers / "my_manual_paper.pdf"
        one.write_bytes(b"%PDF-1.4\nlocal data for offline tests")
        pipeline = ResearchPipeline(self.root)
        with patch.object(pipeline, "analyse_one",
                          return_value={"status": "ANALYSED", "filename": one.name}) as analyse:
            result = pipeline.analyse_only_new_one()
            self.assertEqual(result["status"], "ANALYSED")
            analyse.assert_called_once_with("my_manual_paper.pdf")
        (self.library.papers / "another.pdf").write_bytes(b"%PDF-1.4\nsecond")
        with patch.object(pipeline, "analyse_one") as analyse:
            result = pipeline.analyse_only_new_one()
            self.assertEqual(result["status"], "NEED_FILENAME")
            self.assertEqual(len(result["pending_filenames"]), 2)
            analyse.assert_not_called()

    def test_pdf_file_path_never_reads_outside_papers(self):
        (self.root / "secret.pdf").write_bytes(b"secret")
        with self.assertRaises(FileNotFoundError):
            self.library.paper_path("secret.pdf")
        (self.library.papers / "inside.pdf").write_bytes(b"%PDF")
        self.assertEqual(self.library.paper_path("../inside.pdf").name, "inside.pdf")

    def test_search_wraps_section4_and_preserves_all_metadata(self):
        class FakePlan:
            def __init__(self, topic, search_queries, start_year):
                self.topic = topic
                self.search_queries = search_queries
                self.start_year = start_year
            def model_dump_json(self, indent=2):
                return json.dumps(vars(self), indent=indent)

        fake = SimpleNamespace(
            SearchPlan=FakePlan, TOPIC="Old topic", TARGET_PAPERS=10,
            DEFAULT_START_YEAR=2022, PLAN_FILE=Path("search_plan.json"),
            PAPERS_FILE=Path("papers.csv"), LOG_FILE=Path("search_log.json"),
        )
        received = []
        def fake_main():
            plan = json.loads(fake.PLAN_FILE.read_text(encoding="utf-8"))
            received.append((fake.TOPIC, fake.TARGET_PAPERS,
                             fake.DEFAULT_START_YEAR, plan["start_year"]))
            write_csv_atomic(fake.PAPERS_FILE, [
                {"title": "Mocked Real Record", "doi": "10.1234/a",
                 "openalex_url": "https://openalex.org/W123",
                 "year": "2024", "authors": "A", "search_query": "q"}
            ], ["title", "doi", "openalex_url", "year", "authors", "search_query"])
            fake.LOG_FILE.write_text(json.dumps({"stop_reason": "target_reached"}))
        fake.main = fake_main

        pipeline = ResearchPipeline(self.root)
        with patch("research_agent.pipeline.load_script", return_value=fake):
            first = pipeline.search("Speech-driven animation", 5, 2023)
            second = pipeline.search("Speech-driven animation", 5, 2023)
        self.assertEqual(first["new_unique_papers"], 1)
        self.assertEqual(second["new_unique_papers"], 0)
        self.assertEqual(second["library_total"], 1)
        self.assertEqual(received, [
            ("Speech-driven animation", 5, 2023, 2023),
            ("Speech-driven animation", 5, 2023, 2023)
        ])
        self.assertEqual(fake.TOPIC, "Old topic")
        self.assertEqual(len(self.library.state["search_history"]), 0)
        self.assertEqual(len(pipeline.library.state["search_history"]), 2)

    def test_only_download_latest_search_and_analyse_that_batch(self):
        self.library.merge_papers([
            {"title": "Old topic", "doi": "10.1234/old"},
            {"title": "New topic", "doi": "10.1234/new"},
        ])
        self.library.state["latest_search_ids"] = ["doi:10.1234/new"]
        self.library.save()

        seen_indexes = []
        fake = SimpleNamespace(
            USER_AGENT="Workshop test",
            MANIFEST_COLUMNS=[
                "title", "doi", "openalex_url", "status", "pdf_path",
                "source_pdf_url", "candidate_pdf_url", "manual_url",
                "scholar_url", "research_status", "error"
            ],
            RobotsPolicy=lambda session: object(),
        )
        def process(_session, _robots, row, index, directory, _max_bytes):
            seen_indexes.append(index)
            filename = "new_topic.pdf"
            (directory / filename).write_bytes(b"%PDF-1.4\nmock PDF contents")
            return {"title": row["title"], "doi": row["doi"],
                    "status": "DOWNLOADED", "pdf_path": "papers/" + filename}
        fake.process_paper = process

        pipeline = ResearchPipeline(self.root)
        with patch("research_agent.pipeline.load_script", return_value=fake):
            result = pipeline.download()
        self.assertEqual(result["scope"], "latest_search")
        self.assertEqual(result["processed"], 1)
        self.assertEqual(seen_indexes, [2])  # Preserves stable original row numbering.
        self.assertEqual(pipeline.library.state["latest_download_paths"],
                         ["new_topic.pdf"])

        # An older unrelated PDF must not join this analysis batch.
        (self.library.papers / "old_unprocessed.pdf").write_bytes(b"%PDF-1.4\nolder")
        with patch.object(pipeline, "analyse_one",
                          return_value={"status": "ANALYSED"}) as analyse:
            report = pipeline.analyse_latest_downloads()
        self.assertEqual(report["selected"], 1)
        analyse.assert_called_once_with("new_topic.pdf")

    def test_analyse_single_pdf_appends_once_without_repeating_llm(self):
        pdf = self.library.papers / "my_manually_added.pdf"
        pdf.write_bytes(b"%PDF-1.4\nunique content")
        calls = {"gemini": 0}
        fake = SimpleNamespace()
        fake.read_pdf = lambda p: ["Page 1: Mocked paper"]
        fake.make_chunks = lambda pages: [{"id": "C1", "text": pages[0]}]
        fake.retrieve = lambda chunks: ({"model": ["C1"]}, chunks)
        def analyse(_pages, _selected):
            calls["gemini"] += 1
            return SimpleNamespace(paper_title="My Paper")
        fake.gemini_analyse = analyse
        fake.verify_answers = lambda analysis, selected: {"model": {
            "answer": "Transformer", "evidence_ids": ["C1"]
        }}
        fake.lookup_metadata = lambda pages, title, doi: (
            {"title": title, "year": "2026", "venue": "Demo Journal",
             "doi": "", "openalex_url": ""}, []
        )
        fake.fetch_bibtex = lambda doi: ""
        def outputs(pdf_path, pages, chunks, retrieved, selected, verified,
                    meta, bibtex, warnings):
            folder = self.library.outputs / pdf_path.stem
            folder.mkdir(parents=True, exist_ok=True)
            row = {key: "" for key in REVIEW_FIELDS}
            row.update({"Paper Title": "My Paper", "Model": "Transformer"})
            write_csv_atomic(folder / "literature_review.csv", [row], REVIEW_FIELDS)
        fake.write_outputs = outputs

        pipeline = ResearchPipeline(self.root)
        with patch("research_agent.pipeline.load_script", return_value=fake):
            first = pipeline.analyse_one(pdf.name)
            second = pipeline.analyse_one(pdf.name)
        self.assertEqual(first["status"], "ANALYSED")
        self.assertEqual(second["status"], "ALREADY_ANALYSED")
        self.assertEqual(calls["gemini"], 1)
        self.assertEqual(read_csv(self.library.comparison_csv)[0]["Model"], "Transformer")
        self.assertEqual(len(read_csv(self.library.comparison_csv)), 1)
        self.assertEqual(len(pipeline.library.pending()), 0)

    def test_download_failure_continues_and_report_preserves_old_entries(self):
        self.library.merge_papers([
            {"title": "A", "doi": "10.1234/a"},
            {"title": "B", "doi": "10.1234/b"},
        ])
        fake = SimpleNamespace(
            USER_AGENT="Workshop test", MANIFEST_COLUMNS=[
                "title", "doi", "openalex_url", "status", "pdf_path",
                "source_pdf_url", "candidate_pdf_url", "manual_url",
                "scholar_url", "research_status", "error"
            ],
            RobotsPolicy=lambda session: object()
        )
        def process(session, robots, row, index, directory, max_bytes):
            if index == 1:
                raise ValueError("Intentional test failure")
            return {"title": row["title"], "doi": row["doi"],
                    "status": "DOWNLOADED", "pdf_path": "papers/b.pdf"}
        fake.process_paper = process
        pipeline = ResearchPipeline(self.root)
        with patch("research_agent.pipeline.load_script", return_value=fake):
            report = pipeline.download()
        self.assertEqual(report["processed"], 2)
        self.assertEqual(report["FAILED"], 1)
        self.assertEqual(report["DOWNLOADED"], 1)
        self.assertEqual(len(read_csv(self.library.manifest_csv)), 2)


if __name__ == "__main__":
    unittest.main()
