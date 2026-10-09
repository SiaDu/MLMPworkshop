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

## Section 2 — Quick troubleshooting

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

**Two different files:** `tools.py` implements the actual OpenAlex search function; `03_function_calling.py` uses Gemini Automatic Function Calling to request that function. You need **both files in the same extracted starter folder**. View them on GitHub: [tools.py](tools.py) · [03_function_calling.py](03_function_calling.py).

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

**About years:** Section 3's Function Calling script does **not** pass a year filter. For Section 4, we extended `tools.py` with an optional `start_year` argument; the new agent now uses the SearchPlan year to filter the OpenAlex request.

References: [Google Gen AI SDK — Automatic Python function calling](https://googleapis.github.io/python-genai/#function-calling) · [Gemini Function Calling](https://ai.google.dev/gemini-api/docs/function-calling) · [OpenAlex API](https://help.openalex.org/api/)


---

## Section 4 — Build & Test Your Literature Research Agent

**Goal:** Combine what you learned in Section 2 (**Structured Outputs**) and Section 3 (**Function Calling**) into a small research agent that searches real academic metadata, checks and deduplicates the results, retries when necessary, and exports a CSV reading list.

The workshop website has **one interactive pipeline** showing both outcomes: **Enough Papers** and **Not Enough Papers**. Here you will run the **real Python script**.

### Part A — Understand the complete pipeline

```text
Research TOPIC
      |
      v
Load Section 2 SearchPlan (or generate it with Gemini + Pydantic)
      |
      v
Gemini requests search_papers(query, limit)
      |
      v
Local Python calls OpenAlex with start_year filter
      |
      v
Check year + basic metadata; deduplicate by DOI / OpenAlex ID
      |
      v
Enough unique records?
  | YES                     | NO (rounds remain)
  v                         v
Export papers.csv       Ask Gemini to revise keywords
+ search_log.json            |
                             └──> search_papers again
  |
  NO but max rounds reached -> Export available partial results
```

**A bounded agent workflow:** Gemini proposes/refines search queries and requests a Python tool. The **Python program**, not the LLM, enforces data checks, stopping conditions and export rules. We use `MAX_SEARCH_ROUNDS` to avoid endless requests. **A search round is one attempted OpenAlex tool search, not one Gemini API call**; the SDK may make additional Gemini requests internally to handle Function Calling.

| Earlier section | Reused in Section 4 |
| --- | --- |
| Section 2 — Structured Outputs | `SearchPlan` with `topic`, three `search_queries` and `start_year`. |
| Section 3 — Function Calling | Gemini SDK makes local `search_papers()` calls and receives actual OpenAlex data. |
| Section 4 — New | Search-result checks, deduplication, query revisions, stopping rules, CSV export and search log. |

**Do not confuse record count with relevance.** We count records that pass basic *metadata and year* checks. No automatic semantic relevance evaluation is implemented. A paper may be real, recent and still not suitable for your survey.

### Part B — Run the prepared agent

Make sure the starter folder contains:

```text
literature_research_agent_starter/
├── README.md
├── pyproject.toml
├── 01_first_api_call.py
├── 02_structured_output.py
├── 03_function_calling.py
├── 04_research_agent.py       <-- NEW
└── tools.py                   <-- Extended to support start_year
```

Open a terminal **in the starter folder**:

```bash
pwd
ls
source .venv/bin/activate
echo "${GEMINI_API_KEY:+API key is set}"
```

If you have not created the environment yet, complete Section 2 Part B first. Do **not** paste your API key directly into the Python files.

Then run:

```bash
python 04_research_agent.py
```

The script will:

1. Read `search_plan.json` from Section 2 **if the topic matches** and the plan passes validation. Otherwise, request a new structured plan from Gemini.
2. Use the first SearchPlan query to ask Gemini for a Function Call to `search_papers()`.
3. Pass the plan's **`start_year`** to OpenAlex's **`from_publication_date`** filter (e.g., `2022-01-01`). This is an actual API-side filter, not just a prompt instruction.
4. Check the returned records for a nonempty title, a publication year in range, and a DOI or OpenAlex URL. Remove duplicates using DOI/OpenAlex identifiers.
5. If there are not enough records, ask Gemini to **revise its next query** using previous search history and another SearchPlan suggestion.
6. Stop after the target is reached **or** the maximum number of search rounds. Export the collected records even if the target is not reached.

For Section 4 we extended the existing tool without breaking Section 3:

```python
# The new start_year parameter is optional.
def search_papers(query: str, limit: int = 5,
                  start_year: int | None = None) -> list[dict]:
    ...

# Example: OpenAlex will search only publications from 2022 onwards.
search_papers("facial animation", limit=5, start_year=2022)
```

**Only the OpenAlex paper metadata is used for the CSV.** The agent does not ask Gemini to invent paper titles or references.

### Part C — Change the settings

In `04_research_agent.py`, find this block:

```python
TOPIC = "AI facial animation"
TARGET_PAPERS = 10
MAX_SEARCH_ROUNDS = 3
PAPERS_PER_SEARCH = 5
DEFAULT_START_YEAR = 2022
```

| Setting | What it controls |
| --- | --- |
| `TOPIC` | Your AI for Media survey topic. Changing this causes the agent to regenerate the SearchPlan if the saved plan is for another topic. |
| `TARGET_PAPERS` | The number of unique records required to finish early. |
| `MAX_SEARCH_ROUNDS` | The maximum number of search attempts (1–5). A higher number uses more API calls. |
| `PAPERS_PER_SEARCH` | Maximum records returned per OpenAlex tool call (1–10). |
| `DEFAULT_START_YEAR` | Requested year for a newly generated plan. If a valid matching `search_plan.json` already exists, its own `start_year` takes precedence. |

**Recommended student tasks:**

1. **Use your topic.** Change `TOPIC` to your survey topic. Run the script. Check `[PLAN]` to see whether it reused or generated `search_plan.json`.
2. **Force an early stop.** Set `TARGET_PAPERS = 3` and `PAPERS_PER_SEARCH = 5`. Did the run stop before three rounds?
3. **Test the retry limit.** Set `TARGET_PAPERS = 10`, `PAPERS_PER_SEARCH = 3` and `MAX_SEARCH_ROUNDS = 2`. With at most six retrieved records, the script cannot reach ten in this run. Does it export a partial CSV?

You do not need to write a dispatcher or implement a loop from scratch. Observe the ready-made code; focus on what each stage is responsible for.

### Part D — Inspect the outputs

The script writes these files in the **same starter folder**:

| File | Meaning |
| --- | --- |
| `search_plan.json` | Topic, three academic queries, and `start_year`; reused from Section 2 or regenerated as needed. |
| `papers.csv` | Collected, deduplicated OpenAlex records. |
| `search_log.json` | Query history, retrieved count, added valid records, rounds, and reason for completion (target met or not). |

`papers.csv` contains these columns:

```text
title,year,authors,doi,openalex_url,search_query
```

Open `papers.csv` in a spreadsheet program or VS Code. Choose a real paper and open its `doi` or `openalex_url` in your browser. Check **title, year, and whether the work is actually relevant** to your survey.

**Why a separate search log?** It reveals what the agent did: which keywords were tried, which rounds returned duplicates, and whether it stopped because it found enough records or hit the iteration limit. This makes the workflow easier to inspect and debug.

#### Example terminal output (illustrative, not real results)

```text
[PLAN] Reusing search_plan.json from Section 2.
[TOPIC] AI facial animation
[YEAR FILTER] Publications from 2022 onwards
[TARGET] 10 unique records; at most 3 rounds

[ROUND 1/3] Proposed query: 'speech-driven facial animation'
[GEMINI → PYTHON] search_papers(query='...', limit=5)
[PYTHON] OpenAlex year filter: >= 2022
[TOOL RESULT] 5 record(s) retrieved.
[CHECK] +4 new valid, non-duplicate records. Total: 4/10.
[DECISION] Not enough papers: try a revised query if rounds remain.

...
[STOP] Maximum search rounds reached; exporting partial results.
[EXPORT] .../papers.csv (9 records)
[EXPORT] .../search_log.json
[REVIEW] Open source links and check each paper's relevance yourself.
```

### Complete annotated code — `04_research_agent.py`

The Python file is **provided**; you are not expected to type it. The complete code is included here so that you can inspect the pipeline and understand individual functions.

<details>
<summary>Show full commented code — 04_research_agent.py</summary>

```python
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
```

</details>

### Part E — Troubleshooting

| Problem | What to check |
| --- | --- |
| `GEMINI_API_KEY is missing` | Repeat Section 2's API key setup and `source ~/.bashrc`. |
| `No module named google` / `requests` | Run `uv sync` in the starter folder and activate `.venv`. |
| `403`, `404` or unavailable model | Your Gemini account may not have access to the selected model. Ask your instructor. |
| `429` or quota error | Gemini and OpenAlex have separate limits. Stop repeated requests and ask your instructor. |
| No results | Try a broader topic or earlier `start_year`. Confirm OpenAlex connectivity with `python tools.py`. |
| Only a partial CSV | The agent reached `MAX_SEARCH_ROUNDS` before `TARGET_PAPERS`; this is expected behavior, not necessarily an error. |
| Fewer papers after deduplication | Multiple searches returned the same records, or records lacked valid metadata. |
| `search_plan.json` not reused | Its saved topic differs from `TOPIC`, or it failed the schema/rule checks. |
| CSV contains irrelevant papers | This script does not perform semantic relevance evaluation; manually review titles and sources. |

**Before citing:** Inspect the actual paper, confirm the DOI and bibliographic metadata, and assess its relevance yourself. OpenAlex metadata is for discovery, not a substitute for reading or verifying the paper.

References: [OpenAlex filtering documentation](https://help.openalex.org/api/filtering/) · [Gemini Python SDK function calling](https://googleapis.github.io/python-genai/#function-calling)
