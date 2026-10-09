"""
Workshop 03 — Section 4: Build & Test the Literature Research Agent.

This is a ready-to-run classroom example. Students change the four settings
below, then run: python 04_research_agent.py

Pipeline:
    Load or generate a Pydantic SearchPlan (Section 2)
    -> Gemini requests a Python search tool (Section 3)
    -> OpenAlex returns real paper metadata with a year filter
    -> Python checks metadata and removes duplicates
    -> If short, Gemini revises the query (up to MAX_SEARCH_ROUNDS)
    -> Export papers.csv and search_log.json

IMPORTANT: The automatic checks below verify metadata, publication year, and
duplicate IDs. They do NOT verify semantic research relevance. Students must
read the paper records before using them in an academic survey.
"""

import csv  # Write a spreadsheet-readable paper list.
import json  # Save an audit log of the search.
import os  # Read the GEMINI_API_KEY environment variable.
from datetime import date
from pathlib import Path

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from tools import search_papers as openalex_search_papers


# ===== STUDENT SETTINGS: change these, not the tool execution code. =====
TOPIC = "AI facial animation"
TARGET_PAPERS = 10
MAX_SEARCH_ROUNDS = 3
PAPERS_PER_SEARCH = 5  # Each OpenAlex request returns at most 5 records.
DEFAULT_START_YEAR = 2022

MODEL = "gemini-3.5-flash-lite"

PLAN_FILE = Path("search_plan.json")  # Reuse Section 2's output if it matches.
PAPERS_FILE = Path("papers.csv")
LOG_FILE = Path("search_log.json")


# Section 2 — a schema constrains the structure of Gemini's plan.
class SearchPlan(BaseModel):
    topic: str = Field(description="The student's research topic")
    search_queries: list[str] = Field(
        description="Exactly three distinct academic paper-search queries"
    )
    start_year: int = Field(description="Earliest publication year (inclusive)")


# When we need another round, ask Gemini for ONE revised search query.
class RevisedQuery(BaseModel):
    query: str = Field(description="One new academic paper-search query")


def check_plan(plan: SearchPlan) -> None:
    """Extra rule checks (Section 2). They supplement Pydantic's schema."""
    if len(plan.search_queries) != 3:
        raise ValueError("SearchPlan must contain exactly three queries.")
    if any(not query.strip() for query in plan.search_queries):
        raise ValueError("Search queries cannot be empty.")
    if len({q.casefold().strip() for q in plan.search_queries}) != 3:
        raise ValueError("Search queries must be distinct.")
    if not 2000 <= plan.start_year <= date.today().year:
        raise ValueError("SearchPlan start_year is outside the valid range.")


def load_or_generate_plan(client: genai.Client) -> SearchPlan:
    """Reuse a matching Section 2 plan; otherwise generate a fresh plan."""
    if PLAN_FILE.exists():
        try:
            previous = SearchPlan.model_validate_json(
                PLAN_FILE.read_text(encoding="utf-8")
            )
            check_plan(previous)
            if previous.topic.strip().casefold() == TOPIC.strip().casefold():
                print("[PLAN] Reusing search_plan.json from Section 2.")
                return previous
            print("[PLAN] Topic changed; generating a new SearchPlan.")
        except (ValueError, OSError) as error:
            print(f"[PLAN] Previous SearchPlan is invalid: {error}")

    print("[GEMINI] Generating a structured SearchPlan...")
    response = client.models.generate_content(
        model=MODEL,
        contents=(
            f"Generate a literature search plan for: {TOPIC}. "
            "Provide exactly three distinct, useful academic search queries. "
            f"Use start_year={DEFAULT_START_YEAR}. "
            "Do not invent paper titles or citations."
        ),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=SearchPlan,
        ),
    )
    if not response.text:
        raise ValueError("Gemini did not return a SearchPlan.")
    plan = SearchPlan.model_validate_json(response.text)
    check_plan(plan)
    if plan.topic.strip().casefold() != TOPIC.strip().casefold():
        # Keep the user-supplied topic as our authoritative research goal.
        plan = plan.model_copy(update={"topic": TOPIC.strip()})
    PLAN_FILE.write_text(plan.model_dump_json(indent=2) + "\n", encoding="utf-8")
    print("[PLAN] Saved search_plan.json.")
    return plan


def revise_query(
    client: genai.Client, plan: SearchPlan, previous: list[str],
    found: int, suggested: str,
) -> str:
    """Use Gemini to reformulate keywords when more papers are needed."""
    print(f"[GEMINI] Only {found}/{TARGET_PAPERS} papers so far; revising query...")
    reply = client.models.generate_content(
        model=MODEL,
        contents=(
            f"Research topic: {plan.topic}. Year >= {plan.start_year}. "
            f"Previously searched: {previous}. "
            f"Found {found} unique records; need {TARGET_PAPERS}. "
            f"Consider this alternative search direction: {suggested}. "
            "Suggest ONE different, focused academic search query that is "
            "not identical to previous queries. Do not give paper titles."
        ),
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RevisedQuery,
        ),
    )
    if not reply.text:
        raise ValueError("Gemini did not return a revised query.")
    proposed = RevisedQuery.model_validate_json(reply.text).query.strip()
    if proposed and proposed.casefold() not in {q.casefold() for q in previous}:
        return proposed
    if suggested.casefold() not in {q.casefold() for q in previous}:
        print("[PLAN] Reusing an unused SearchPlan alternative.")
        return suggested
    raise ValueError("No distinct search query could be generated.")


def paper_ids(paper: dict) -> set[str]:
    """Stable deduplication keys: DOI and OpenAlex work ID when present."""
    keys = set()
    if paper.get("doi"):
        keys.add("doi:" + str(paper["doi"]).strip().lower())
    if paper.get("openalex_url"):
        keys.add("openalex:" + str(paper["openalex_url"]).strip().lower())
    # If no identifiers exist, title + year is a best-effort fallback.
    if not keys:
        keys.add(
            "title:" + str(paper.get("title", "")).strip().casefold()
            + ":" + str(paper.get("year", ""))
        )
    return keys


def main() -> None:
    # These limits prevent an unbounded, expensive agent loop.
    if not os.getenv("GEMINI_API_KEY"):
        raise SystemExit("GEMINI_API_KEY is missing. Follow Section 2 README.")
    if not TOPIC.strip():
        raise SystemExit("TOPIC cannot be empty.")
    if not 1 <= TARGET_PAPERS <= 30:
        raise SystemExit("TARGET_PAPERS must be between 1 and 30.")
    if not 1 <= MAX_SEARCH_ROUNDS <= 5:
        raise SystemExit("MAX_SEARCH_ROUNDS must be between 1 and 5.")
    if not 1 <= PAPERS_PER_SEARCH <= 10:
        raise SystemExit("PAPERS_PER_SEARCH must be between 1 and 10.")

    client = genai.Client()
    plan = load_or_generate_plan(client)
    print(f"\n[TOPIC] {plan.topic}")
    print(f"[YEAR FILTER] Publications from {plan.start_year} onwards")
    print(f"[TARGET] {TARGET_PAPERS} unique records; at most {MAX_SEARCH_ROUNDS} rounds")

    papers: list[dict] = []
    seen: set[str] = set()
    used_queries: list[str] = []
    search_log: list[dict] = []

    for round_number in range(1, MAX_SEARCH_ROUNDS + 1):
        # First round uses Section 2's first query. Subsequent queries are
        # actively revised by Gemini using unused plan suggestions as seeds.
        if round_number == 1:
            query = plan.search_queries[0]
        else:
            suggestion = plan.search_queries[min(round_number - 1, 2)]
            query = revise_query(
                client, plan, used_queries, len(papers), suggestion
            )

        print(f"\n[ROUND {round_number}/{MAX_SEARCH_ROUNDS}] Proposed query: {query!r}")

        # The wrapper lets students SEE automatic function execution.
        # It is intentionally defined here to capture the chosen year filter.
        called: list[dict] = []

        def search_papers(query: str, limit: int = 5) -> list[dict]:
            """Search OpenAlex for academic papers using keyword arguments.

            Args:
                query: Keywords for academic paper discovery.
                limit: Maximum records to retrieve, from 1 to 10.
            """
            # Enforce our own maximum even if Gemini suggests a larger value.
            safe_limit = max(1, min(int(limit), PAPERS_PER_SEARCH, 10))
            print(f"[GEMINI → PYTHON] search_papers(query={query!r}, limit={safe_limit})")
            print(f"[PYTHON] OpenAlex year filter: >= {plan.start_year}")
            records = openalex_search_papers(
                query=query, limit=safe_limit, start_year=plan.start_year
            )
            called.append({"query": query, "limit": safe_limit, "records": records})
            print(f"[TOOL RESULT] {len(records)} record(s) retrieved.")
            return records

        # Gemini chooses a tool call; the SDK executes the local function.
        # ANY asks for a tool call. The low call limit prevents extra tool
        # executions in this simple one-search-per-round example.
        client.models.generate_content(
            model=MODEL,
            contents=(
                f"Call search_papers ONCE for this research topic: {plan.topic}. "
                f"Use the search direction '{query}' and limit={PAPERS_PER_SEARCH}. "
                "We need genuine OpenAlex metadata, not invented citations."
            ),
            config=types.GenerateContentConfig(
                tools=[search_papers],
                automatic_function_calling=types.AutomaticFunctionCallingConfig(
                    maximum_remote_calls=2
                ),
                tool_config=types.ToolConfig(
                    function_calling_config=types.FunctionCallingConfig(mode="ANY")
                ),
            ),
        )
        if not called:
            # If no local tool executed, there is no evidence to export.
            raise RuntimeError("Gemini did not execute the search_papers tool.")

        # Inspect only ACTUAL OpenAlex results captured inside the tool.
        added = 0
        returned = 0
        for call in called:
            actual_query = call["query"]
            used_queries.append(actual_query)
            returned += len(call["records"])
            for paper in call["records"]:
                title = paper.get("title")
                year = paper.get("year")
                # Rule checks: year and metadata, NOT semantic relevance.
                if not isinstance(title, str) or not title.strip():
                    continue
                if type(year) is not int or not plan.start_year <= year <= date.today().year:
                    continue
                if not (paper.get("doi") or paper.get("openalex_url")):
                    continue
                keys = paper_ids(paper)
                if keys & seen:
                    continue
                seen.update(keys)
                papers.append({
                    "title": title.strip(),
                    "year": year,
                    "authors": "; ".join(paper.get("authors") or []),
                    "doi": paper.get("doi") or "",
                    "openalex_url": paper.get("openalex_url") or "",
                    "search_query": actual_query,
                })
                added += 1
                if len(papers) >= TARGET_PAPERS:
                    break
            if len(papers) >= TARGET_PAPERS:
                break

        search_log.append({
            "round": round_number,
            "planned_query": query,
            "tool_queries": [entry["query"] for entry in called],
            "retrieved": returned,
            "new_unique_valid_records": added,
            "total_unique_valid_records": len(papers),
        })
        print(
            f"[CHECK] +{added} new valid, non-duplicate records. "
            f"Total: {len(papers)}/{TARGET_PAPERS}."
        )
        if len(papers) >= TARGET_PAPERS:
            print("[STOP] Target reached.")
            break
        print("[DECISION] Not enough papers: try a revised query if rounds remain.")
    else:
        print("[STOP] Maximum search rounds reached; exporting partial results.")

    # Save REAL returned paper metadata, not generated bibliography entries.
    with PAPERS_FILE.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "title", "year", "authors", "doi", "openalex_url", "search_query"
            ],
        )
        writer.writeheader()
        writer.writerows(papers)

    LOG_FILE.write_text(
        json.dumps({
            "topic": plan.topic,
            "start_year": plan.start_year,
            "target_papers": TARGET_PAPERS,
            "max_search_rounds": MAX_SEARCH_ROUNDS,
            "finished_with_target": len(papers) >= TARGET_PAPERS,
            "total_unique_valid_records": len(papers),
            "searches": search_log,
            "note": "No automatic semantic relevance check; verify papers manually.",
        }, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    print(f"\n[EXPORT] {PAPERS_FILE.resolve()} ({len(papers)} records)")
    print(f"[EXPORT] {LOG_FILE.resolve()}")
    print("[REVIEW] Open source links and check each paper's relevance yourself.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        raise SystemExit(
            f"Research run failed: {error}\n"
            "Check API keys, quotas, network access, and the SearchPlan."
        ) from error
