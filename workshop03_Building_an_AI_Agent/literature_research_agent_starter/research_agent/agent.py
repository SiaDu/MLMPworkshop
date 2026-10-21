"""Natural language tool routing with Gemini Chat automatic function calling."""
import os
from google import genai
from google.genai import types

from .pipeline import ResearchPipeline


SYSTEM_INSTRUCTION = """You are a literature-research assistant working in a local
student Python project. You have tools to search OpenAlex, find open PDFs,
analyse local PDF full text, and maintain a method comparison CSV.

Act on the user's actual request, using tools rather than inventing results.
- A search produces metadata, NOT full-text analysis.
- A PDF downloader may fail. Never claim unavailable PDFs were analysed.
- To perform a complete "find papers and make method table" request:
  search the requested topic/count/year, download PDFs from that latest search,
  use analyse_latest_downloads() (not all unrelated PDFs), then report the
  actual comparison-table rows.
- If the user wants to analyse a specified local PDF, use analyse_pdf(filename).
- If they say "only the one new PDF" without a filename, use
  analyse_only_new_pdf(): if it returns NEED_FILENAME, ask which file.
- If they ask to analyse all available PDFs, use analyse_unprocessed_pdfs().
- A user request about status or failures must not trigger new downloads.
- Do not repeatedly call a tool that has just failed. Explain its error.
- Do not delete or overwrite files. The underlying Python tools own all
  validation, caching, and file changes.
- Be careful about numbers. "10 found" is NOT "10 analysed".
- Do not fabricate scholarly citations, methods, datasets, or evidence.
- Always mention that LLM-derived method fields require checking with the PDF.
- Keep final answers clear and brief. You may respond in the user's language.
"""


def create_agent(pipeline: ResearchPipeline, model: str | None = None):
    """Create a multi-turn Gemini chat with a bounded autonomous tool loop."""
    if not os.getenv("GEMINI_API_KEY"):
        raise ValueError("GEMINI_API_KEY is missing. Use the existing Section 2 key.")

    def call(name, action):
        try:
            print(f"\n[TOOL] {name}", flush=True)
            result = action()
            return {"ok": True, **result}
        except Exception as exc:
            print(f"[TOOL ERROR] {name}: {type(exc).__name__}: {exc}", flush=True)
            return {"ok": False, "tool": name,
                    "error": f"{type(exc).__name__}: {str(exc)[:200]}"}

    def search_papers(topic: str, count: int = 10, start_year: int = 2022) -> dict:
        """Find real paper metadata using Section 4's bounded research agent.

        Args:
            topic: Research topic expressed as English academic keywords.
            count: Desired unique paper records (1 to 30).
            start_year: Earliest publication year, inclusive.
        """
        return call("search_papers", lambda: pipeline.search(topic, count, start_year))

    def download_open_pdfs(limit: int = 0, latest_search_only: bool = True) -> dict:
        """Download openly available PDF versions, defaulting to the latest search.

        Args:
            limit: Number of selected records to process (0 for all, up to 30).
            latest_search_only: True for the latest search, False for all papers.csv.
        """
        return call("download_open_pdfs",
                    lambda: pipeline.download(limit, latest_search_only))

    def analyse_latest_downloads() -> dict:
        """Analyse only the PDFs from the latest download batch, not unrelated papers."""
        return call("analyse_latest_downloads", pipeline.analyse_latest_downloads)

    def analyse_unprocessed_pdfs(limit: int = 0) -> dict:
        """Analyse every unprocessed local PDF and append results to method table.

        Args:
            limit: Maximum PDF files to analyse (0 for all, capped at 30).
        """
        return call("analyse_unprocessed_pdfs", lambda: pipeline.analyse_all(limit))

    def analyse_pdf(filename: str) -> dict:
        """Analyse exactly one PDF already inside papers/, updating only its row.

        Args:
            filename: Filename of a PDF in papers/, e.g. new_paper.pdf.
        """
        return call("analyse_pdf", lambda: pipeline.analyse_one(filename))

    def analyse_only_new_pdf() -> dict:
        """Analyse a sole unprocessed PDF, or request a filename if ambiguous."""
        return call("analyse_only_new_pdf", pipeline.analyse_only_new_one)

    def list_local_pdfs() -> dict:
        """List PDFs in papers/ and identify which have already been analysed."""
        return call("list_local_pdfs", pipeline.list_local_pdfs)

    def show_library_status() -> dict:
        """Show paper counts, PDF counts, pending work and cumulative table size."""
        return call("show_library_status", pipeline.status)

    def show_download_failures() -> dict:
        """Report failed PDF downloads and safe links for manual follow-up."""
        return call("show_download_failures", pipeline.failures)

    def show_method_table() -> dict:
        """Show the cumulative method comparison table's location and paper titles."""
        return call("show_method_table", pipeline.table)

    client = genai.Client()
    # AFC is deliberately used through Chat.send_message (not Models.generate_content).
    # The SDK may call selected Python functions, inspect results, then call more.
    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_INSTRUCTION,
        temperature=0.2,
        tools=[
            search_papers, download_open_pdfs, analyse_latest_downloads,
            analyse_unprocessed_pdfs,
            analyse_pdf, analyse_only_new_pdf, list_local_pdfs,
            show_library_status, show_download_failures, show_method_table,
        ],
        automatic_function_calling=types.AutomaticFunctionCallingConfig(
            maximum_remote_calls=12
        ),
    )
    try:
        chat = client.chats.create(
            model=model or os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"),
            config=config,
        )
    except BaseException:
        client.close()
        raise
    # IMPORTANT: The chat alone does not keep genai.Client alive reliably.
    # Return both and retain the client until the terminal session finishes.
    return client, chat
