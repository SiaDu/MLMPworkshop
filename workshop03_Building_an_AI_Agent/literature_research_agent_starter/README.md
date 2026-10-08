# Section 2 — LLM API + Structured Outputs

**Workshop 03 · Student hands-on guide**

## What you will build

Turn your **AI for Media survey topic** into a structured research `SearchPlan`.

- **Script 01:** Ask the Gemini API for three research queries (ordinary text).
- **Script 02:** Ask for structured JSON, validate it with Pydantic and save `search_plan.json`.
- **`tools.py`:** An instructor-prepared OpenAlex paper-search tool for **Section 3**. You do **not** need to write or edit it in Section 2.

**This README contains the full instructions and annotated code.** You are not expected to type the Python files from scratch: open the supplied files in VS Code, run them, and change the requested values.

## Before class: get a Gemini API key

1. Go to [Google AI Studio — API Keys](https://aistudio.google.com/apikey).
2. Sign in and create an API key (if eligible).
3. Copy your key. **Never paste your key into a public GitHub repository, shared document, screenshot or chat.**
4. Make sure `uv` is available from Workshop 02.

The model used in the examples is `gemini-3.5-flash-lite`. Free-tier availability and request limits depend on the provider and your account. Your instructor may give you a fallback exercise if access is unavailable.

## Part A — Set up your API key on Linux

**Terminal commands** are typed into your Linux terminal, **not** into a Python file.

### Step A1. Open your Bash configuration file

```bash
# nano is a text editor that runs inside the terminal.
# ~/.bashrc configures your Bash shell when it starts.
nano ~/.bashrc
```

Move to the **bottom** of the file. Add this line, replacing the placeholder with **your own** key:

```bash
# Make your Gemini API key available to programs as an environment variable.
export GEMINI_API_KEY="your_api_key_here"
```

**Save your edit in nano:**

1. Press **Ctrl + O** (write/save the file).
2. Press **Enter** (confirm the filename).
3. Press **Ctrl + X** (exit nano).

### Step A2. Apply your change to this terminal

```bash
# Reload ~/.bashrc so the new environment variable is available right now.
source ~/.bashrc

# Check WHETHER the key exists. Do not print your actual key.
echo "${GEMINI_API_KEY:+API key is set}"
```

Expected message: `API key is set`.

If nothing is printed, recheck the line you added to `~/.bashrc`.

### Alternative: one-line command instead of nano (NOT both)

The command below **also** adds a line to `~/.bashrc`. It is an alternative to **Step A1**, not an extra step:

```bash
# Alternative ONLY: append one export line to ~/.bashrc.
echo 'export GEMINI_API_KEY="YOUR_API_KEY"' >> ~/.bashrc

# Reload your Bash configuration.
source ~/.bashrc
```

**Use only ONE method:** `nano` **or** `echo >>`. Typing the real key directly into the terminal's `echo` command can save it in shell history, so `nano` is recommended.

**Lab setup:** Each student uses their own Linux account and computer, so you can keep your personal `GEMINI_API_KEY` in your own `~/.bashrc` for future classes. You normally need to run `source ~/.bashrc` only after editing it; new Bash terminal sessions load this configuration automatically. Keep your key private and never upload it to GitHub.

## Part B — Download the Starter Project and install dependencies

**You do not need to clone the whole MLMPworkshop repository or create a new GitHub repository.** Download only the starter project:

**Starter Project ZIP — Coming Soon.** The download link will be added after all workshop scripts are finalized. For now, the source files are maintained in this folder on the `dev` branch.

The final ZIP will contain `pyproject.toml`, both Python examples, `tools.py`, and this README, hosted in the existing MLMPworkshop repository.

### Step B1. Extract the ZIP (once published)

1. Open your **Downloads** folder on Linux.
2. Find `literature_research_agent_starter.zip`.
3. Right-click and choose **Extract Here**. You should now have a folder called `literature_research_agent_starter`.
4. Open this folder in VS Code (File → Open Folder).

Or, if you prefer the terminal:

```bash
# Unzip the starter project into your Downloads directory.
unzip ~/Downloads/literature_research_agent_starter.zip -d ~/Downloads
```

### Step B2. Enter the extracted folder

```bash
# Enter the downloaded project (NOT the full MLMPworkshop repository).
cd ~/Downloads/literature_research_agent_starter

# List the files. You should see pyproject.toml and the two .py examples.
ls
```

**Important:** Run the following commands from inside the folder containing `pyproject.toml`.

### Step B3. Install and activate dependencies

```bash
# Read pyproject.toml, install dependencies, and create a local .venv.
uv sync

# Activate the virtual environment for this terminal.
source .venv/bin/activate

# Verify that your active Python belongs to the project.
which python
python --version
```

**You do not need `sudo`.** If no suitable Python version is installed, ask your instructor before changing system Python. For example, you may use `uv python install 3.11` and then `uv sync --python 3.11`.

### Optional check: open Python interactively

After the virtual environment is activated, enter:

```bash
# Start Python's interactive prompt (you will see >>>).
python
```

Now you are **inside Python**. Type these lines one by one (do not type the `>>>` prompt):

```python
# Import the Gemini SDK installed by uv.
from google import genai

# Try to create a client using GEMINI_API_KEY.
client = genai.Client()

# Return to the Linux terminal.
exit()
```

**Important:** Creating a client checks local setup, **not** whether the API key is valid. The next step sends a real request.

## Part C — Your first LLM API call

```bash
# Run the prepared example: one actual LLM request, ordinary text response.
python 01_first_api_call.py
```

Read the comments in `01_first_api_call.py`. This is the **complete provided file**:

<details>
<summary>Show complete annotated code — 01_first_api_call.py</summary>

```python
"""
Workshop 03 — Section 2A: Your first Gemini API call.

Student task:
1. Run this file once.
2. Change TOPIC to your own AI for Media survey topic.
3. Run it again and compare the answers.
"""

import os  # Lets Python read environment variables, including the API key.

from google import genai  # Imports the Google Gemini Python library.


# Change this topic to something relevant to your own survey.
TOPIC = "AI facial animation"

# The model name identifies which Gemini model should answer our request.
MODEL = "gemini-3.5-flash-lite"


# Check that the API key exists WITHOUT showing the secret in the terminal.
if not os.getenv("GEMINI_API_KEY"):
    raise SystemExit(
        "GEMINI_API_KEY is missing. Follow the README to configure it."
    )

# Make a client. It reads GEMINI_API_KEY from the environment automatically.
# Important: this line alone DOES NOT test whether the key is valid.
client = genai.Client()

# This is the text we send to the model (the prompt).
prompt = (
    f"Suggest exactly three different academic search queries about {TOPIC}. "
    "Write a short numbered list. Do not invent paper titles or references."
)

print("Topic:", TOPIC)
print("Sending the first request to Gemini...")

# This call sends the prompt over the internet to the selected Gemini model.
# An actual API request is needed to confirm that the key/model works.
response = client.models.generate_content(
    model=MODEL,
    contents=prompt,
)

# Print the natural-language response returned by Gemini.
print("\n--- Model response ---")
print(response.text)

# Token counts let us see how much text was processed.
# These values are usage information, not monetary cost.
if response.usage_metadata:
    usage = response.usage_metadata
    print("\n--- Token usage ---")
    print("Input tokens:", usage.prompt_token_count)
    print("Output tokens:", usage.candidates_token_count)
```

</details>

**Your task:** Change `TOPIC = "AI facial animation"` to your survey topic, then run the file again.

Notice the answer is natural language. A Python program cannot safely assume that every reply will use the same bullet points or wording.

## Part D — Structured Outputs

```bash
# Request structured JSON using a Pydantic schema.
python 02_structured_output.py
```

The **complete annotated file** is below. It is already included in the ZIP.

<details>
<summary>Show complete annotated code — 02_structured_output.py</summary>

```python
"""
Workshop 03 — Section 2B: Ask Gemini for a structured JSON SearchPlan.

Student task:
1. Run this file.
2. Change TOPIC to your survey topic and run it again.
3. Find search_plan.json. This file will help with the next section.
Optional: add a 'research_focus: str' field to SearchPlan.
"""

import os  # Reads the GEMINI_API_KEY environment variable.
from datetime import date  # Gets the current year for a simple check.
from pathlib import Path  # Helps save our JSON output to a file.

from google import genai  # The official Google Gemini Python SDK.
from google.genai import types  # Configuration options for Gemini.
from pydantic import BaseModel, Field  # Define and describe a data schema.


# EDIT THIS: use your own survey topic.
TOPIC = "AI facial animation"
MODEL = "gemini-3.5-flash-lite"


# A Pydantic class defines the exact fields that Python expects.
# This is NOT an LLM agent or a paper-search function.
class SearchPlan(BaseModel):
    # str = a piece of text, such as "AI facial animation".
    topic: str = Field(description="The student's academic survey topic")

    # list[str] = a list of text strings (search queries).
    search_queries: list[str] = Field(
        description="Three distinct queries suitable for academic paper search"
    )

    # int = an integer, such as 2022.
    start_year: int = Field(
        description="Earliest publication year to search from"
    )


# Stop with a useful message if the student's key is not configured.
if not os.getenv("GEMINI_API_KEY"):
    raise SystemExit("Missing GEMINI_API_KEY. See the README.")

# Set up our API client; the key comes from the environment.
client = genai.Client()

# Tell Gemini what we need. The schema below enforces the data FORMAT.
prompt = (
    f"Create a literature search plan for the topic: {TOPIC}. "
    "Give exactly three different academic search queries. "
    "Focus on publications from 2022 onwards. "
    "Do not invent specific paper titles or citations."
)

# Request JSON whose fields follow our Pydantic model.
response = client.models.generate_content(
    model=MODEL,
    contents=prompt,
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=SearchPlan,
    ),
)

# A successful response should contain JSON text, not an empty response.
if not response.text:
    raise SystemExit("The model did not return any JSON text.")

# This checks the returned JSON against our expected Python field types.
# If a field is missing or the wrong type, Pydantic reports an error.
plan = SearchPlan.model_validate_json(response.text)

# Extra RULES for the lesson: correct JSON types are not enough.
# We also want EXACTLY three queries and a sensible publication year.
if len(plan.search_queries) != 3:
    raise ValueError("Expected exactly three search queries.")

if not (2000 <= plan.start_year <= date.today().year):
    raise ValueError("The start_year is outside the allowed range.")

# Convert the validated Python model back into neatly formatted JSON.
json_output = plan.model_dump_json(indent=2)

print("\n--- Validated SearchPlan (JSON) ---")
print(json_output)

# Demonstrate that Python can access each field directly.
print("\n--- Python can use individual fields ---")
print("Topic:", plan.topic)
print("First search query:", plan.search_queries[0])
print("Start year:", plan.start_year)

# Save this structured plan so the next lesson can reuse it.
output_file = Path("search_plan.json")
output_file.write_text(json_output + "\n", encoding="utf-8")
print("\nSaved file:", output_file.resolve())
```

</details>

The script:

1. Defines a **Pydantic `SearchPlan`** with `topic`, `search_queries` and `start_year`.
2. Supplies the model's **JSON Schema** to Gemini.
3. Uses `SearchPlan.model_validate_json(...)` to parse/check the response.
4. Checks two additional requirements: exactly three queries, and a valid publication year.
5. Saves a local **`search_plan.json`** file for the next workshop section.

Expected **shape** of output (values can differ):

```json
{
  "topic": "AI facial animation",
  "search_queries": [
    "speech-driven facial animation",
    "neural facial synthesis",
    "controllable facial performance generation"
  ],
  "start_year": 2022
}
```

**Your task:** Change `TOPIC` in `02_structured_output.py`. Run it again, open `search_plan.json` and inspect the three search queries.

**Optional challenge:** Add `research_focus: str` to `SearchPlan` and ask Gemini to fill it.

**Remember:** A correctly formatted JSON file does **not** prove that the research keywords, factual claims or paper references are accurate.

## What comes next?

In **Section 3 — Function Calling**, we will use the pre-written `tools.py` function:

```python
# Prepared by the instructor; students do not need to write it from scratch.
from tools import search_papers

papers = search_papers("speech-driven facial animation", limit=5)
```

A normal Python script can call `search_papers()`, but an **AI agent** lets the LLM **request** this function. The application is still responsible for executing the request and checking the result.

OpenAlex currently permits small anonymous searches; a free OpenAlex API key can increase the request budget. The tool automatically uses `OPENALEX_API_KEY` if one is configured.

## Instructor's 20-minute pacing

| Time | Activity |
| --- | --- |
| 0–3 min | Explain LLM API and API-key environment variables (students set keys up before class). |
| 3–7 min | Run `01_first_api_call.py`, change `TOPIC`. |
| 7–10 min | Compare natural language vs JSON and explain schema fields. |
| 10–17 min | Run `02_structured_output.py`, inspect `search_plan.json`, change topic. |
| 17–20 min | Explain validation vs correctness, tokens, rate limits and Section 3 hand-off. |

### Quick troubleshooting

| Symptom | Check |
| --- | --- |
| `uv: command not found` | Use the Workshop 02 uv setup or ask the instructor. |
| `No module named 'google'` | Did `uv sync` run in this folder? Is `.venv` active? |
| `GEMINI_API_KEY is missing` | Check `~/.bashrc` and run `source ~/.bashrc`. |
| `403`, `404` or model access error | Confirm the model is available in the student's API project; ask the instructor for a supported alternative. |
| `429` | You reached a quota or rate limit; stop repeated requests. |
| `ValidationError` | Compare the model output with the required `SearchPlan` fields. |

References: [Gemini API documentation](https://ai.google.dev/gemini-api/docs/get-started) · [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output) · [OpenAlex API](https://help.openalex.org/api/)


---

## Section 3 — Function Calling + OpenAlex Paper Search

**Student guide · Read the explanations, run the supplied Python files, and change only the indicated values.** The workshop website presents the concepts; this README contains the complete commands and annotated example.

### What you will learn

In Section 2 you asked Gemini to create a structured **SearchPlan**. In Section 3, you will use a **real academic search tool** and let Gemini decide how to call it:

```text
User asks for papers
        |
        v
Gemini requests search_papers(query, limit)
        |
        v
Google Gen AI Python SDK executes the LOCAL function
        |
        v
Python requests paper metadata from OpenAlex API
        |
        v
SDK returns the results to Gemini -> Gemini writes an answer
```

**Remember:** Gemini selects a function and its arguments, but **Python on your computer executes that function**. With *Automatic Function Calling*, the Google Gen AI SDK handles the repeated Gemini API requests and tool-result messages for you. The student provides the initial input **once**.

**Two APIs, different purposes:** Gemini decides how to use a tool and interprets its output. OpenAlex searches academic bibliographic metadata. An OpenAlex record is evidence of a database record, **not** proof that the paper is relevant, correctly indexed, or actually read by the model.

### Part A — Try OpenAlex without Gemini

The instructor already provided `tools.py`. Open it in VS Code and find:

```python
def search_papers(query: str, limit: int = 5) -> list[dict]:
```

| Part | Meaning |
| --- | --- |
| `search_papers` | The name of the Python function (tool). |
| `query: str` | Search keywords as text, e.g. `"speech-driven facial animation"`. |
| `limit: int = 5` | Number of paper records to request; default is 5. This tool allows 1–10. |
| `list[dict]` | The result is a list of Python dictionaries, one per paper. |

From the extracted **`literature_research_agent_starter`** folder, with your environment activated:

```bash
# Check that this terminal is inside the extracted starter folder.
pwd
ls

# Run the tool independently: this does NOT contact Gemini.
python tools.py
```

The existing test at the bottom of `tools.py` searches OpenAlex for **two** sample records. Output changes as the database changes. Each record can include `title`, `year`, `authors`, `doi`, and `openalex_url`; values can be missing.

**OpenAlex account:** Small anonymous searches are supported; an `OPENALEX_API_KEY` is optional for this exercise. A free account raises the daily API allowance. Do not repeatedly run queries if you receive HTTP 429. Official information: [OpenAlex API](https://help.openalex.org/api/) and [Authentication](https://help.openalex.org/api/authentication/).

### Part B — Let Gemini request the Python tool

First, make sure that your Gemini API Key and environment from Section 2 still work:

```bash
# Run this in your existing starter-project folder.
source .venv/bin/activate

# Confirm the secret is set without printing its value.
echo "${GEMINI_API_KEY:+API key is set}"
```

Run the prepared Section 3 file:

```bash
# One user request; SDK manages the underlying function-calling exchange.
python 03_function_calling.py
```

The central difference from Section 2 is this SDK configuration:

```python
# Give Gemini a reference to our Python function.
config=types.GenerateContentConfig(
    tools=[search_papers],
    automatic_function_calling=types.AutomaticFunctionCallingConfig(
        maximum_remote_calls=2
    ),
)
```

- **`tools=[search_papers]`**: provides the callable Python tool, including its name, description and parameters, to the model.
- **The model may choose the function and arguments**: the user does not manually fill in `query`.
- **The local SDK executes the function**: it passes Gemini's chosen arguments into `search_papers`, retrieves the returned list and sends it back to Gemini.
- **`maximum_remote_calls=2`**: bounds this short example to one automatic tool-calling turn followed by a model response. This is not a general agent search loop.
- **The model can still choose not to use a tool**: this script explicitly requests tool use in the prompt and prints a notice if the function was not called.

#### What you should see in the terminal

These are **illustrative log messages**, not actual paper titles:

```text
[USER] Use the search_papers tool to find up to 5 academic papers...
[GEMINI] Sending the request with search_papers as an available tool...

[GEMINI → PYTHON] Requested tool: search_papers
[ARGS] query='facial animation', limit=5
[PYTHON] Calling OpenAlex...
[TOOL RESULT] Retrieved 5 paper records.
  1. <title from OpenAlex> (2024)
  ...

[GEMINI] Final response:
<summary derived from the returned metadata>
```

Your own model may choose a different query, a different number of records may be returned, and the final response will vary. Look for the **`[ARGS]`**, **`[PYTHON]`**, and **`[TOOL RESULT]`** lines: these are printed by the local Python wrapper **only when the SDK executes the tool**.

#### Complete annotated code: `03_function_calling.py`

The full file is already supplied in your starter folder. The following code is for reading and reference; **you do not have to type it**.

<details>
<summary>Show full commented code — 03_function_calling.py</summary>

```python
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
        print(f"     DOI: {paper.get('doi') or 'not available'}", flush=True)
        print(
            f"     OpenAlex: {paper.get('openalex_url') or 'not available'}",
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
```

</details>

### Part C — Three student exercises

**Task 1 — Change the topic:** Edit only `TOPIC` in `03_function_calling.py`, for example `"AI-driven character animation"`. Save and run the file. Inspect the new `[ARGS]` query requested by Gemini.

**Task 2 — Change the number of papers:** Set `PAPER_COUNT = 3`, save, and run again. Did Gemini request `limit=3`? How many records did OpenAlex actually return? These numbers need not always match.

**Task 3 — Verify a source:** Copy a real DOI or `openalex_url` from a result and open it in your browser. Confirm that the linked record matches its title and year. Some papers have no DOI, so use another paper if needed.

The aim is to **observe the automatic tool-calling mechanism**, not to collect a perfect literature survey yet.

### Part D — Troubleshooting

| Problem | What to check |
| --- | --- |
| `No module named 'google'` or `requests` | Run `uv sync` inside the starter folder and activate `.venv`. |
| `GEMINI_API_KEY is missing` | Revisit Section 2 Part A and run `source ~/.bashrc`. |
| `403` or model access error | The selected Gemini model may not be enabled for your account. Ask your instructor. |
| `429 Too Many Requests` | Gemini or OpenAlex may have reached an account/rate quota. Stop repeat requests. |
| No `[GEMINI → PYTHON]` log | The model did not request the tool. Retry once or ask your instructor. |
| OpenAlex network/timeout error | Check internet connectivity; a database request is different from a Gemini request. |
| Fewer papers returned than requested | The search may have fewer indexed matches; `limit` is a maximum, not a guarantee. |
| Missing DOI | Some OpenAlex records have no DOI; use the `openalex_url` instead. |

### What comes next in Section 4?

Section 3 demonstrates **one search tool**. Section 4 will connect the previous `search_plan.json` to a repeatable research process: multiple search queries, checking whether the results are sufficient, handling duplicates, and exporting paper metadata into a CSV reading list.

**Important current limitation:** `SearchPlan` includes `start_year`, but the current `search_papers(query, limit)` tool has **no year-filter argument**. The publication-year rule is not applied by this Section 3 script. We can add this when building the Section 4 workflow.

References: [Google Gen AI SDK — Automatic Python function calling](https://googleapis.github.io/python-genai/#function-calling) · [Gemini Function Calling](https://ai.google.dev/gemini-api/docs/function-calling) · [OpenAlex API](https://help.openalex.org/api/)
