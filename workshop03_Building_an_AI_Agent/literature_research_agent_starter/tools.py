"""
Workshop 03 — Section 3: A ready-made paper-search TOOL.

In Section 2, students do NOT need to type or edit this file.
In Section 3, we will connect search_papers() to an LLM tool call.

A tool is a normal Python function. The LLM can REQUEST this function;
Python actually executes it and retrieves the real results.

OpenAlex documentation: https://help.openalex.org/api/
"""

import os  # Used for an optional OpenAlex API key.

import requests  # Makes ordinary HTTP requests to websites/APIs.


def search_papers(query: str, limit: int = 5) -> list[dict]:
    """
    Search the OpenAlex academic metadata API.

    Arguments:
        query: Keywords, e.g. "speech-driven facial animation".
        limit: Maximum number of papers to return (1 to 10).

    Returns:
        A list of dictionaries containing real bibliographic metadata.
        This function does NOT download or read the paper's full text.
    """

    # Protect the API from empty input and unnecessarily large requests.
    if not query.strip():
        raise ValueError("The search query cannot be empty.")

    if not 1 <= limit <= 10:
        raise ValueError("Limit must be between 1 and 10.")

    # The OpenAlex works endpoint searches academic publications.
    url = "https://api.openalex.org/works"

    # Query parameters are added to the URL by requests safely.
    params = {"search": query, "per_page": limit}

    # A key is optional for small searches. A free OpenAlex account
    # provides a bigger daily quota if the class needs it.
    headers = {}
    api_key = os.getenv("OPENALEX_API_KEY")
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    # Send ONE HTTP GET request. A timeout avoids hanging forever.
    response = requests.get(url, params=params, headers=headers, timeout=15)

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
