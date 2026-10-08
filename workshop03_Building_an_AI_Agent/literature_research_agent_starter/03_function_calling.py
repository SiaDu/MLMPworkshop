"""
Workshop 03 — Section 3: Automatic Function Calling + OpenAlex.

WHAT TO DO:
1. Activate the project's virtual environment and API key (see README).
2. Run: python 03_function_calling.py
3. Watch the [GEMINI], [PYTHON] and [TOOL RESULT] messages.
4. Change TOPIC and then PAPER_COUNT. Run again.

The Google Gen AI SDK handles function declarations, local function execution,
and sending the results back to Gemini. We add a small wrapper to show the
otherwise hidden tool call in the terminal.

This is ONE example search, not the multi-search agent loop in Section 4.
"""

import os  # Read your Gemini API key from the shell.
from google import genai  # Official Python SDK for the Gemini API.
from google.genai import types  # Tool and automatic-calling configuration.

# Import the REAL OpenAlex tool, already prepared by the instructor.
from tools import search_papers as openalex_search_papers


# CHANGE THESE TWO VALUES for the exercise.
TOPIC = "AI facial animation"
PAPER_COUNT = 5

# Use the same model as the previous section.
MODEL = "gemini-3.5-flash-lite"

# A simple counter helps us verify that a real Python function was called.
tool_calls = 0


def search_papers(query: str, limit: int = 5) -> list[dict]:
    """Search academic papers in OpenAlex using keywords.

    Args:
        query: Academic keywords, such as speech-driven facial animation.
        limit: Maximum number of paper records to return (1 to 10).
    """
    global tool_calls  # Count the actual local Python executions.
    tool_calls += 1

    # These logs print ONLY if the SDK actually calls this Python function.
    # Thus, they show the arguments Gemini asked the SDK to use.
    print("\n[GEMINI → PYTHON] Requested tool: search_papers", flush=True)
    print(f"[ARGS] query={query!r}, limit={limit}", flush=True)

    # The SDK calls this wrapper; the wrapper calls the existing OpenAlex tool.
    # Python/requests, NOT Gemini itself, contacts the OpenAlex API.
    print("[PYTHON] Calling OpenAlex...", flush=True)
    papers = openalex_search_papers(query=query, limit=limit)

    # Show concise proof that real records were returned by OpenAlex.
    print(f"[TOOL RESULT] Retrieved {len(papers)} paper records.", flush=True)
    for index, paper in enumerate(papers, start=1):
        print(
            f"  {index}. {paper.get('title') or 'Untitled'} "
            f"({paper.get('year') or 'unknown year'})",
            flush=True,
        )

    # Returning a list gives these real records back to Gemini via the SDK.
    return papers


if not os.getenv("GEMINI_API_KEY"):
    raise SystemExit("GEMINI_API_KEY is missing. Follow README Part A.")

if not 1 <= PAPER_COUNT <= 10:
    raise SystemExit("PAPER_COUNT must be between 1 and 10.")

# One user instruction. The SDK may make more than one network request
# to Gemini automatically as it completes the function-calling exchange.
prompt = (
    f"Use the search_papers tool to find up to {PAPER_COUNT} academic "
    f"papers about {TOPIC}. Call the tool once, with limit={PAPER_COUNT}. "
    "Only mention papers returned by OpenAlex. "
    "For each result, include its title, year and DOI if available. "
    "Do not fabricate missing metadata."
)

print(f"[USER] {prompt}\n", flush=True)
print("[GEMINI] Sending the request with search_papers as an available tool...", flush=True)

client = genai.Client()  # Reads GEMINI_API_KEY automatically.

try:
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            # Pass the Python FUNCTION, not its return value.
            # The SDK automatically exposes its name, docstring and arguments
            # to Gemini and executes it if Gemini requests a call.
            tools=[search_papers],

            # Limit this classroom demo to one tool-calling turn, followed
            # by the model response. More elaborate loops belong to Section 4.
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                maximum_remote_calls=2
            ),
        ),
    )
except Exception as error:
    # Network, credential, quota and OpenAlex API errors can surface here.
    raise SystemExit(
        f"The request failed: {error}\n"
        "Check your Gemini API key, network access and API limits. "
        "Read the troubleshooting section in README.md."
    ) from error

if tool_calls == 0:
    print(
        "\n[NOTICE] Gemini did not request search_papers. "
        "Tool use is model-directed; try the exercise again.",
        flush=True,
    )

print("\n[GEMINI] Final response:", flush=True)
print(response.text or "(No final text was returned.)")

# This script does not deduplicate or export the results.
# We will build that multi-step research pipeline in Section 4.
