"""
Workshop 03 — Sections 3 and 4: a ready-made paper-search TOOL.

In Section 2, students do NOT need to type or edit this file.
In Section 3, we connect search_papers() to an LLM tool call.
In Section 4, the optional start_year argument filters OpenAlex results.

A tool is a normal Python function. The LLM can REQUEST this function;
Python actually executes it and retrieves the real results.

OpenAlex documentation: https://help.openalex.org/api/
"""

import os  # Used for an optional OpenAlex API key.

import requests  # Makes ordinary HTTP requests to websites/APIs.


def search_papers(query: str, limit: int = 5, start_year: int | None = None) -> list[dict]:
    """
    Search the OpenAlex academic metadata API.

    Arguments:
        query: Keywords, e.g. "speech-driven facial animation".
        limit: Maximum number of papers to return (1 to 10).
        start_year: Optional inclusive publication-year filter. Section 3
            can omit this; Section 4 passes the SearchPlan's start_year.

    Returns:
        A list of dictionaries containing real bibliographic metadata.
        This function does NOT download or read the paper's full text.
    """

    # Protect the API from empty input and unnecessarily large requests.
    if not query.strip():
        raise ValueError("The search query cannot be empty.")

    if not 1 <= limit <= 10:
        raise ValueError("Limit must be between 1 and 10.")

    # An optional start-year filter runs at OpenAlex, not just in Python.
    if start_year is not None and not 2000 <= start_year <= 2100:
        raise ValueError("start_year must be between 2000 and 2100.")

    # The OpenAlex works endpoint searches academic publications.
    url = "https://api.openalex.org/works"

    # Query parameters are added to the URL by requests safely.
    params = {"search": query, "per_page": limit}
    if start_year is not None:
        # OpenAlex supports from_publication_date as a works filter.
        params["filter"] = f"from_publication_date:{start_year}-01-01"

    # A key is optional for small searches. A free OpenAlex account
    # provides a bigger daily quota if the class needs it.
    api_key = os.getenv("OPENALEX_API_KEY")
    if api_key:
        # OpenAlex accepts an API key in the api_key query parameter.
        params["api_key"] = api_key

    # Send ONE HTTP GET request. A timeout avoids hanging forever.
    response = requests.get(url, params=params, timeout=15)

    # Fail clearly if OpenAlex returns an error such as 429 (rate limit).
    response.raise_for_status()

    # OpenAlex sends JSON; Python converts it into dictionaries/lists.
    data = response.json()

    papers = []
    for work in data.get("results", []):
        # Some records do not include authors or a DOI, so use safe defaults.
        authors = [
            entry.get("author", {}).get("display_name", "")
            for entry in work.get("authorships", [])[:5]
        ]

        papers.append(
            {
                "title": work.get("display_name") or work.get("title"),
                "year": work.get("publication_year"),
                "authors": [name for name in authors if name],
                "doi": work.get("doi"),
                "openalex_url": work.get("id"),
            }
        )

    return papers


# This runs only when a person executes: python tools.py
# It does not run automatically when another file imports search_papers.
if __name__ == "__main__":
    print("Searching OpenAlex for two example papers...")
    for paper in search_papers("speech-driven facial animation", limit=2):
        print(paper)
