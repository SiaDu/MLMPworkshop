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

**[Download literature_research_agent_starter.zip](../../docs/workshop03/downloads/literature_research_agent_starter.zip)**

This ZIP contains `pyproject.toml`, both Python examples, `tools.py`, and this README. It is hosted in the existing MLMPworkshop repository.

### Step B1. Extract the ZIP

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

## Part E — API safety and rate limits (1 minute)

- **API key:** a private credential; never put it inside `.py` files, Git commits or screenshots.
- **Tokens:** the model's input/output usage units; see the counts printed by Script 01.
- **Rate limits:** do not run an endless API-request loop. If you receive HTTP 429, stop and consult the instructor.
- **No real paper search yet:** Gemini generates *search terms*, not verified citations. Section 3 uses OpenAlex for actual metadata.

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
