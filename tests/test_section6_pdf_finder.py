"""Offline regression tests for Workshop 03 Section 6 (no real network calls).

Run from the repository root:
    python -m unittest discover -s tests -p "test_section6_pdf_finder.py"
"""
import argparse
import csv
import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import pymupdf

MODULE = (
    Path(__file__).resolve().parents[1]
    / "workshop03_Building_an_AI_Agent"
    / "literature_research_agent_starter"
    / "06_pdf_finder.py"
)
spec = importlib.util.spec_from_file_location("pdf_finder", MODULE)
finder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(finder)


class FakeResponse:
    def __init__(self, url, status=200, headers=None, body=b""):
        self.url = url
        self.status_code = status
        self.headers = headers or {}
        self.body = body
        self.closed = False
        self.encoding = "utf-8"

    def close(self):
        self.closed = True

    def raise_for_status(self):
        if self.status_code >= 400:
            raise ValueError(f"HTTP {self.status_code}")

    def iter_content(self, chunk_size=65536):
        for i in range(0, len(self.body), chunk_size):
            yield self.body[i:i + chunk_size]

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        self.close()


class FakeSession:
    def __init__(self, responses):
        self.responses = responses
        self.requested = []

    def get(self, url, **kwargs):
        self.requested.append((url, kwargs))
        return self.responses[url]


class FakeRobots:
    def __init__(self, blocked=None):
        self.blocked = set(blocked or [])
        self.seen = []

    def allowed(self, url):
        self.seen.append(url)
        return (False, "robots.txt disallows automated access") if url in self.blocked else (True, "")


class PDFTests(unittest.TestCase):
    def test_id_and_doi_from_section4_csv(self):
        paths, doi = finder.work_lookup_paths({
            "openalex_url": "https://openalex.org/W1234",
            "doi": "https://doi.org/10.1234/example",
        })
        self.assertEqual(paths, ["W1234", "https://doi.org/10.1234/example"])
        self.assertEqual(doi, "10.1234/example")

    def test_openalex_oa_locations_only_and_deduplicated(self):
        pdfs, pages = finder.openalex_locations({
            "doi": "https://doi.org/10.1234/a",
            "best_oa_location": {
                "pdf_url": "https://repo.edu/a.pdf",
                "landing_page_url": "https://repo.edu/paper",
            },
            "locations": [
                {"is_oa": True, "pdf_url": "https://repo.edu/a.pdf"},
                {"is_oa": False, "pdf_url": "https://private.edu/no.pdf"},
            ],
        })
        self.assertEqual(pdfs, ["https://repo.edu/a.pdf"])
        self.assertEqual(pages, ["https://repo.edu/paper", "https://doi.org/10.1234/a"])

    def test_html_pdf_extraction_with_relative_links(self):
        urls = finder.extract_pdf_urls(
            '<meta name="citation_pdf_url" content="/fulltext/a.pdf">'
            '<a href="supplement.pdf">PDF</a>'
            '<a href="/login">Log in</a>',
            "https://repo.edu/article/1",
        )
        self.assertEqual(urls, [
            "https://repo.edu/fulltext/a.pdf",
            "https://repo.edu/article/supplement.pdf",
        ])

    def test_non_public_urls_are_rejected(self):
        for url in ("file:///tmp/x.pdf", "http://localhost/x.pdf",
                    "http://127.0.0.1/file.pdf", "http://host.local/pdf"):
            self.assertFalse(finder.public_http_url(url), url)

    def test_redirects_checked_before_following(self):
        a, b = "https://repo.edu/download", "https://pdfhost.edu/real.pdf"
        session = FakeSession({
            a: FakeResponse(a, 302, {"Location": b}),
            b: FakeResponse(b, 200),
        })
        robots = FakeRobots()
        response = finder.get_public_resource(
            session, robots, a, "application/pdf", (8, 20)
        )
        self.assertIs(response, session.responses[b])
        self.assertEqual(robots.seen, [a, b])
        self.assertFalse(session.requested[0][1]["allow_redirects"])

        blocked = FakeRobots(blocked={b})
        session2 = FakeSession({
            a: FakeResponse(a, 302, {"Location": b}),
        })
        with self.assertRaisesRegex(ValueError, "robots.txt"):
            finder.get_public_resource(session2, blocked, a, "*/*", (8, 20))
        self.assertEqual(len(session2.requested), 1)

    def test_pdf_signature_and_pymupdf_validation(self):
        with tempfile.TemporaryDirectory() as temp:
            out = Path(temp) / "paper.pdf"
            doc = pymupdf.open()
            doc.new_page()
            pdf_bytes = doc.tobytes()
            doc.close()
            url = "https://repo.edu/valid.pdf"
            response = FakeResponse(url, body=pdf_bytes)
            with patch.object(finder, "get_public_resource", return_value=response):
                self.assertEqual(
                    finder.download_pdf(None, None, url, out, 10_000_000), url
                )
            self.assertTrue(out.is_file())
            finder.validate_pdf(out)

            invalid = FakeResponse(url, body=b"<html>Please log in</html>")
            out.unlink()
            with patch.object(finder, "get_public_resource", return_value=invalid):
                with self.assertRaisesRegex(ValueError, "not a PDF"):
                    finder.download_pdf(None, None, url, out, 10_000_000)
            self.assertFalse(out.exists())
            self.assertFalse(out.with_suffix(".pdf.part").exists())

    def test_openalex_failure_still_tries_doi_landing(self):
        with tempfile.TemporaryDirectory() as temp:
            with patch.object(finder, "openalex_work", side_effect=ValueError("failed")):
                with patch.object(finder, "additional_open_pdf_sources",
                                  return_value=([], [], [])):
                    with patch.object(finder, "scrape_landing_page", return_value=[]) as scrape:
                        result = finder.process_paper(
                            None, None,
                            {"title": "Test paper", "doi": "10.1234/demo"},
                            1, Path(temp), 10_000_000
                        )
            self.assertEqual(result["status"], "FAILED")
            self.assertIn("OpenAlex", result["error"])
            self.assertTrue(result["manual_url"].startswith("https://doi.org/"))
            scrape.assert_called_once()


    def test_additional_source_apis_find_distinct_public_pdfs(self):
        doi = "10.1234/example"
        semantic = {
            "title": "Example", "openAccessPdf": {"url": "https://arxiv.org/pdf/2201.12345"}
        }
        pmc = {
            "resultList": {"result": [{
                "doi": doi, "isOpenAccess": "Y", "pmcid": "PMC1234567",
                "fullTextUrlList": {"fullTextUrl": []}
            }]}
        }

        class JSONResponse:
            def __init__(self, payload):
                self.payload = payload
            def raise_for_status(self):
                pass
            def json(self):
                return self.payload

        class APISession:
            def get(self, url, **kwargs):
                if "semanticscholar" in url:
                    return JSONResponse(semantic)
                if "ebi.ac.uk" in url:
                    return JSONResponse(pmc)
                raise AssertionError(url)

        pdfs, pages, errors = finder.additional_open_pdf_sources(APISession(), doi)
        self.assertIn("https://arxiv.org/pdf/2201.12345", pdfs)
        self.assertIn("https://europepmc.org/articles/PMC1234567?pdf=render", pdfs)
        self.assertEqual(errors, [])
        self.assertIn("https://europepmc.org/articles/PMC1234567", pages)

    def test_provider_failure_is_not_a_batch_stopper(self):
        class ErrorResponse:
            def raise_for_status(self):
                raise ValueError("HTTP 429")
        class APISession:
            def get(self, url, **kwargs):
                return ErrorResponse()

        pdfs, pages, errors = finder.additional_open_pdf_sources(
            APISession(), "10.1234/example"
        )
        self.assertEqual(pdfs, [])
        self.assertEqual(pages, [])
        self.assertEqual(len(errors), 2)

    def test_openalex_cache_api_key_is_not_exposed_in_manifest(self):
        raw = ("https://content.openalex.org/works/W123.pdf?"
               "api_key=SECRET&download=1")
        self.assertNotIn("SECRET", finder.redact_api_keys(raw))
        self.assertIn("download=1", finder.redact_api_keys(raw))

        class CaptureSession:
            def __init__(self):
                self.kwargs = None
            def get(self, url, **kwargs):
                self.kwargs = kwargs
                return FakeResponse(url)

        session = CaptureSession()
        with patch.dict(finder.os.environ, {"OPENALEX_API_KEY": "SECRET"}):
            response = finder.get_public_resource(
                session, FakeRobots(), "https://content.openalex.org/works/W123.pdf",
                "application/pdf", (8, 20), api_key="SECRET"
            )
        self.assertEqual(session.kwargs["params"], {"api_key": "SECRET"})
        self.assertIsNotNone(response)

    def test_retraction_flag_from_openalex_is_reported(self):
        work = {
            "id": "https://openalex.org/W123",
            "doi": "https://doi.org/10.1234/example",
            "is_retracted": True,
            "locations": [], "best_oa_location": None,
        }
        with tempfile.TemporaryDirectory() as temp:
            with patch.object(finder, "openalex_work", return_value=work):
                with patch.object(finder, "additional_open_pdf_sources",
                                  return_value=([], [], [])):
                    with patch.object(finder, "scrape_landing_page", return_value=[]):
                        record = finder.process_paper(
                            None, None, {"title": "Example", "doi": "10.1234/example"},
                            1, Path(temp), 10_000_000
                        )
        self.assertEqual(record["research_status"], "RETRACTED")


    def test_manifest_continues_after_an_unexpected_row_error(self):
        with tempfile.TemporaryDirectory() as temp:
            temp = Path(temp)
            source, report = temp / "papers.csv", temp / "manifest.csv"
            with source.open("w", newline="", encoding="utf-8") as out:
                writer = csv.DictWriter(out, fieldnames=["title", "doi", "openalex_url"])
                writer.writeheader()
                writer.writerow({"title": "First", "doi": "10.1234/a"})
                writer.writerow({"title": "Second", "doi": "10.1234/b"})

            def mocked_process(_session, _robots, row, *_args):
                if row["title"] == "First":
                    raise RuntimeError("Test exception")
                return {
                    "title": row["title"], "doi": row["doi"], "openalex_url": "",
                    "status": "DOWNLOADED", "pdf_path": "papers/second.pdf",
                    "source_pdf_url": "https://repo.edu/second.pdf",
                    "candidate_pdf_url": "https://repo.edu/second.pdf",
                    "manual_url": "", "scholar_url": "", "error": "",
                }

            args = argparse.Namespace(
                input=source, output_dir=temp / "papers", manifest=report,
                limit=0, max_pdf_mb=40,
            )
            with patch.object(finder, "parse_args", return_value=args):
                with patch.object(finder, "process_paper", side_effect=mocked_process):
                    finder.main()
            with report.open(newline="", encoding="utf-8") as stream:
                rows = list(csv.DictReader(stream))
            self.assertEqual([r["status"] for r in rows], ["FAILED", "DOWNLOADED"])
            self.assertIn("Unexpected error", rows[0]["error"])


if __name__ == "__main__":
    unittest.main()
