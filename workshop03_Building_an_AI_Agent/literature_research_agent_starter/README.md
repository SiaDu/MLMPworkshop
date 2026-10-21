# Section 2 — LLM API + Structured Outputs

**Workshop 03 · Student hands-on guide**

## What you will build

Turn your **AI for Media survey topic** into three sets of academic search keywords and save them in a structured `SearchPlan`. A search query is a set of keywords or a short phrase used to find papers in a database.

- **Script 01:** Ask the Gemini API for three sets of search keywords (ordinary text).
- **Script 02:** Ask for structured JSON, validate it with Pydantic and save `search_plan.json`.
- **`tools.py`:** An instructor-prepared OpenAlex paper-search tool for **Section 3**. You do **not** need to write or edit it in Section 2.

**This README contains the full instructions and annotated code.** You are not expected to type the Python files from scratch: open the supplied files in VS Code, run them, and change the requested values.

## Before class: get a Gemini API key

1. Go to [Google AI Studio — API Keys](https://aistudio.google.com/apikey).
2. Sign in and create an API key (if eligible).
3. Copy your key. **Never paste your key into a public GitHub repository, shared document, screenshot or chat.**

The model used in the examples is `gemini-3.5-flash-lite`. Free-tier availability and request limits depend on the provider and your account. Your instructor may give you a fallback exercise if access is unavailable.

## Part A — Set up your API key on Linux

**Terminal commands** are typed into your Linux terminal, **not** into a Python file.

### Step A1. Open your Bash/Zsh configuration file

check what shell you use
```text
echo $SHELL
```
if bash

```bash
# nano is a text editor that runs inside the terminal.
# ~/.bashrc configures your Bash shell when it starts.
nano ~/.bashrc
```
if zsh
```bash
nano ~/.zshrc
```

Move to the **bottom** of the file. Add this line, replacing the placeholder with **your own** key:

```bash
# Make your Gemini API key available to programs as an environment variable.
export GEMINI_API_KEY="your_api_key_here"
```
![Example](images/nano.png)

**Save your edit in nano:**

1. Press **Ctrl + O** (write/save the file).
2. Press **Enter** (confirm the filename).
3. Press **Ctrl + X** (exit nano).

### Step A2. Apply your change to this terminal

```bash
# Reload ~/.bashrc or ~/.zshrc so the new environment variable is available right now.
source ~/.zshrc
or
source ~/.bashrc

# Check WHETHER the key exists. Do not print your actual key.
echo "${GEMINI_API_KEY:+API key is set}"
```

Expected message: `API key is set`.

If nothing is printed, recheck the line you added to `~/.bashrc` or `~/.zshrc`.

## Part B — Download the Starter Project and install dependencies

**You do not need to clone the whole MLMPworkshop repository or create a new GitHub repository.** Download only the starter project:

**[⬇ Download the Literature Research Agent Starter ZIP](https://github.com/SiaDu/MLMPworkshop/raw/refs/heads/main/workshop03_Building_an_AI_Agent/literature_research_agent_starter.zip)**

### Step B1. Extract the ZIP 

1. Open your **Downloads** folder on Linux.
2. Find `literature_research_agent_starter.zip`.
3. Move it to your Desktop, right-click and choose **Extract Here**. You should now have a folder called `literature_research_agent_starter`.
4. It should be in `~/Desktop/literature_research_agent_starter/`.

### Step B2. Enter the extracted folder

```bash
# Enter the downloaded project (NOT the full MLMPworkshop repository).
cd ~/Desktop/literature_research_agent_starter

# Open this folder in VScode
code .

# List the files. You should see pyproject.toml, five numbered .py scripts, and tools.py.
ls
```

**Important:** Run the following commands from inside the folder containing `pyproject.toml`.

### Step B3. Install and activate dependencies

```bash
uv venv
source .venv/bin/activate

# Read pyproject.toml, install dependencies, and create a local .venv.
uv sync

# Verify that your active Python belongs to the project.
which python
python --version
```
![Example](images/3.png)

If no suitable Python version is installed, ask your instructor before changing system Python. For example, you may use `uv python install 3.11` and then `uv sync --python 3.11`.

### Optional check: open Python interactively

After the virtual environment is activated, enter:

```bash
# Start Python's interactive prompt (you will see >>>).
python
```

Now you are **inside Python**. **Type** these lines **one by one**:

```python
# Import the Gemini SDK installed by uv.
from google import genai

# Try to create a client using GEMINI_API_KEY.
client = genai.Client()

# Return to the Linux terminal.
exit()
```
![Example](images/4.png)

**Important:** Creating a client checks local setup, **not** whether the API key is valid. The next step sends a real request.

## Part C — Your first LLM API call

```bash
# Run the prepared example: one actual LLM request, ordinary text response.
python 01_first_api_call.py
```

Read the comments in `01_first_api_call.py`. 

**Your task:** Change `TOPIC = "AI facial animation"` to your survey topic, then run the file again.

![Example](images/5.png) Here is the example for `TOPIC = "AI facial animation"`

Notice the answer is natural language. A Python program cannot safely assume that every reply will use the same bullet points or wording.

## Part D — Structured Outputs

```bash
# Request structured JSON using a Pydantic schema.
python 02_structured_output.py
```

It is already included in the ZIP.

The script:

1. Defines a **Pydantic `SearchPlan`** with `topic`, `search_queries` and `start_year`. A SearchPlan stores our research topic, three keyword searches, and the earliest publication year.
2. Supplies the model's **JSON Schema** to Gemini.
3. Uses `SearchPlan.model_validate_json(...)` to parse/check the response.
4. Checks two additional requirements: exactly three queries, and a valid publication year.
5. Saves a local **`search_plan.json`** file for the next workshop section.

Expected **shape** of output (values can differ):

![Example](images/6.png)

**Your task:** Change `TOPIC` in `02_structured_output.py`. Run it again, open `search_plan.json` and inspect the three search queries.

**Optional challenge:** Add `research_focus: str` to `SearchPlan` and ask Gemini to fill it.

**Remember:** A correctly formatted JSON file does **not** prove that the research keywords, factual claims or paper references are accurate.

## Section 2 — Quick troubleshooting

| Symptom | Check |
| --- | --- |
| `uv: command not found` | Use the Workshop 02 uv setup or ask the instructor. |
| `No module named 'google'` | Did `uv sync` run in this folder? Is `.venv` active? |
| `GEMINI_API_KEY is missing` | Check `~/.bashrc` or `~/.zshrc` and run `source ~/.bashrc` or `source ~/.zshrc`. |
| `403`, `404` or model access error | Confirm the model is available in the student's API project; ask the instructor for a supported alternative. |
| `429` | You reached a quota or rate limit; stop repeated requests. |
| `ValidationError` | Compare the model output with the required `SearchPlan` fields. |

References: [Gemini API documentation](https://ai.google.dev/gemini-api/docs/get-started) · [Structured outputs](https://ai.google.dev/gemini-api/docs/structured-output) · [OpenAlex API](https://help.openalex.org/api/)


---

## Section 3 — Function Calling + OpenAlex Paper Search

### What you will learn

In Section 2 you asked Gemini to create a structured **SearchPlan**. In Section 3, you will use a **real academic search tool** and let Gemini decide how to call it:

```text
User: "Find up to 5 academic papers about AI facial animation."
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

**Remember:** Gemini selects a function and its arguments, but **Python on your computer executes that function**. With *Automatic Function Calling*, you enter the instruction once. The SDK may call Gemini more than once to complete the tool-calling process. This is different from running multiple OpenAlex searches.

**Function vs. Tool:** A Python function is code that Python can run. A tool is an ability offered to an LLM. Tools may use local functions, external APIs, libraries, software or other AI models. Here, `search_papers()` is a Python function provided to Gemini as a tool.

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
| `limit: int = 5` | Number of paper records to request; default is 5. **Our workshop tool** allows 1–10, while OpenAlex supports up to 100 per page. |
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

**OpenAlex Free Access:** Small searches work without an API key (about 100 keyword searches per day). A free API key provides a $1 daily allowance (about 1,000 keyword searches); no payment card is required. The limits depend on the type of API call. Our workshop limits each search to 10 papers, although OpenAlex supports up to 100 results per page. If you receive HTTP 429, stop repeated requests. Official information: [OpenAlex API](https://help.openalex.org/api/) · [Authentication](https://help.openalex.org/api/authentication/) · [Example costs](https://help.openalex.org/access/example-costs/).

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

![Example](images/7.png)

Part of them are **illustrative log messages**, not actual paper titles.

Your own model may choose a different query, a different number of records may be returned, and the final response will vary. Look for the **`[ARGS]`**, **`[PYTHON]`**, and **`[TOOL RESULT]`** lines: these are printed by the local Python wrapper **only when the SDK executes the tool**.

### Part C — Three exercises

**Task 1 — Change the topic:** Edit only `TOPIC` in `03_function_calling.py`, for example `"AI-driven character animation"`. Save and run the file. Inspect the new `[ARGS]` query requested by Gemini.

**Task 2 — Change the number of papers:** Set `PAPER_COUNT = 3`, save, and run again. Did Gemini request `limit=3`? How many records did OpenAlex actually return? These numbers need not always match.

**Task 3 — Verify a source:** Copy a real DOI or `openalex_url` from a result and open it in your browser. Confirm that the linked record matches its title and year. Some papers have no DOI, so use another paper if needed.

The aim is to **observe the automatic tool-calling mechanism**, not to collect a perfect literature survey yet.

### Part D — Troubleshooting

| Problem | What to check |
| --- | --- |
| `No module named 'google'` or `requests` | Run `uv sync` inside the starter folder and activate `.venv`. |
| `GEMINI_API_KEY is missing` | Revisit Section 2 Part A and run `source ~/.bashrc` or `source ~/.zshrc`. |
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

**Reliability:** Temporary Gemini HTTP 429/500/502/503/504 errors are retried with waits of 2s, 4s, and 8s. If a later round still fails, the agent exports papers already found and records the failure in `search_log.json` (`stop_reason`, `error`, `rounds_completed`). If OpenAlex already returned records before Gemini's final response failed, the script avoids repeating the same search.

**A bounded agent workflow:** Gemini proposes/refines search queries and requests a Python tool. The **Python program**, not the LLM, enforces data checks, stopping conditions and export rules. We use `MAX_SEARCH_ROUNDS` to avoid endless requests. **One search round means one attempted paper search through OpenAlex, not one Gemini API call**; the SDK may call Gemini more than once to complete Function Calling.

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
6. Stop after reaching the target or the maximum number of search rounds. Retry temporary Gemini errors up to three times; if they persist in a later round, export any successfully collected records instead of discarding them.

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
| `search_log.json` | Query history, retrieved counts, valid records, and stop reason (`target_reached`, `max_rounds_reached` or `error`), plus any error and number of completed rounds. |

`papers.csv` contains these columns:

```text
title,year,authors,doi,openalex_url,search_query
```

Open `papers.csv` in a spreadsheet program or VS Code. Choose a real paper and open its `doi` or `openalex_url` in your browser. Check **title, year, and whether the work is actually relevant** to your survey.

**Why a separate search log?** It reveals what the agent did: which keywords were tried, which rounds returned duplicates, and whether it stopped because it found enough records or hit the iteration limit. This makes the workflow easier to inspect and debug.

#### Example terminal output

![Example](images/8.png)
![Example](images/9.png)
![Example](images/10.png)

### Part E — Troubleshooting

| Problem | What to check |
| --- | --- |
| `GEMINI_API_KEY is missing` | Repeat Section 2's API key setup and `source ~/.bashrc`. |
| `No module named google` / `requests` | Run `uv sync` in the starter folder and activate `.venv`. |
| `403`, `404` or unavailable model | Your Gemini account may not have access to the selected model. Ask your instructor. |
| `429` or quota error | Gemini and OpenAlex have separate limits. The script retries temporary Gemini errors up to three times; for a persistent quota error, check with your instructor. |
| `503 UNAVAILABLE` | Gemini is temporarily busy. The script waits 2s, 4s and 8s before retrying. If still unavailable, inspect the exported partial CSV and `search_log.json`. Or try chance `MODEL = "gemini-3.5-flash-lite"` to `gemini-3.1-flash-lite`, `gemini-3.5-flash` or `gemini-3.6-flash`|
| No results | Try a broader topic or earlier `start_year`. Confirm OpenAlex connectivity with `python tools.py`. |
| Only a partial CSV | The agent reached `MAX_SEARCH_ROUNDS` before `TARGET_PAPERS`; this is expected behavior, not necessarily an error. |
| Fewer papers after deduplication | Multiple searches returned the same records, or records lacked valid metadata. |
| `search_plan.json` not reused | Its saved topic differs from `TOPIC`, or it failed the schema/rule checks. |
| CSV contains irrelevant papers | This script does not perform semantic relevance evaluation; manually review titles and sources. |

**Before citing:** Inspect the actual paper, confirm the DOI and bibliographic metadata, and assess its relevance yourself. OpenAlex metadata is for discovery, not a substitute for reading or verifying the paper.

References: [OpenAlex filtering documentation](https://help.openalex.org/api/filtering/) · [Gemini Python SDK function calling](https://googleapis.github.io/python-genai/#function-calling)


---

# Section 5 — RAG: Analyse Your Own Research Paper

**Guided Hands-on.** Section 4 found paper *metadata* using OpenAlex. In Section 5 you analyse the *contents* of **one paper of your own choosing**.

**Your goal:** Download your own research paper PDF, provide its file path, and produce a **13-column, one-row Literature Review table** with evidence references.

### Part A — Prepare your own paper

1. Choose a paper relevant to your AI for Media survey, either from Section 4's `papers.csv` or from your own search.
2. Get a PDF that you can access and are allowed to process with the Gemini API. Choose one with selectable text rather than a scanned image. Do not upload confidential material without permission.
3. Open your existing project folder and create `papers/` if needed:

```bash
cd ~/Desktop/literature_research_agent_starter
mkdir -p papers
```

4. Place your PDF in `papers/`, for example `papers/my_paper.pdf`. You will use this file path in Part C.

### Part B — Understand the workflow

```text
Your PDF
  ↓
PyMuPDF extracts selectable text, keeping page numbers
  ↓
Python creates overlapping chunks
  ↓
BM25 lexical retrieval finds evidence for 9 analysis questions
  ↓
Gemini + Pydantic creates structured answers citing chunk IDs
  ↓
Python checks that cited IDs exist and exports the results
  ↓
literature_review.csv + evidence.json (+ paper.bib if available)
```

Four of the CSV columns contain publication details. The script tries to identify the paper using its DOI or OpenAlex; Section 4's `papers.csv` can help with this, but it does **not** contain the full paper text.

**RAG** means **Retrieval-Augmented Generation**. Python retrieves text passages first; Gemini then answers using those passages. **BM25** searches for matching words.

### Part C — Run the script

**Download the additional workshop files** and add them to your existing starter project:

**[⬇ Download workshop03_added_files.zip](https://raw.githubusercontent.com/SiaDu/MLMPworkshop/main/workshop03_Building_an_AI_Agent/workshop03_added_files.zip)**

1. Download and extract the ZIP on your Desktop.
2. Copy the extracted files into your **existing** `literature_research_agent_starter/` folder. Replace `pyproject.toml` when prompted; keep your own `papers/`, `outputs/` and `state/` data.
3. Check that `05_rag.py` is present. Sections 6–7 also use `06_pdf_finder.py`, `07_research_agent.py` and `research_agent/`. If a file is missing from the ZIP, get it from the [GitHub starter folder](https://github.com/SiaDu/MLMPworkshop/tree/main/workshop03_Building_an_AI_Agent/literature_research_agent_starter).

**Important:** Copy the files into the existing project, not into a second nested `literature_research_agent_starter/` folder.

The project structure for the later sections is:

```text
literature_research_agent_starter/
├── 01_first_api_call.py ... 04_research_agent.py
├── 05_rag.py
├── 06_pdf_finder.py
├── 07_research_agent.py
├── tools.py
├── pyproject.toml                 # Updated dependencies
├── research_agent/                # Section 7 Python modules
├── papers/                        # Your own PDFs
├── outputs/                       # Created by the programs
└── state/                         # Created by Section 7
```

Update dependencies in the **same** starter environment:

```bash
cd ~/Desktop/literature_research_agent_starter
pwd
ls
uv sync
source .venv/bin/activate
python -c "import os; print('API key is set' if os.getenv('GEMINI_API_KEY') else 'Missing API key')"
```

The programs create `outputs/` and `state/` when needed.

Run the analysis on **your own PDF**:

```bash
python 05_rag.py --pdf "papers/my_paper.pdf"
```

Replace `my_paper.pdf` with your real filename. Quotation marks handle spaces in paths. Absolute paths also work.

**Optional:** If your PDF's DOI is unclear or was not detected, provide the verified DOI yourself:

```bash
python 05_rag.py --pdf "papers/my_paper.pdf" --doi "10.1234/your-doi"
```

The DOI above is a **placeholder, not a real DOI**. Replace it with your paper's DOI.

Watch the terminal for `[PDF]`, `[RETRIEVE]` and `[EXPORT]` to check that the script processed the PDF and saved its output.

### Part D — Inspect the output

For `papers/my_paper.pdf`, output appears at:

```text
outputs/
└── my_paper/
    ├── literature_review.csv  ← one row; 13 columns
    ├── evidence.json          ← per-field answers + source chunk IDs and pages
    └── paper.bib              ← only if a verified DOI returns BibTeX
```

![Example](images/12.png)

CSV columns:

```text
BibTeX, Year, Journal / Conference, Paper Title,
Model, Dataset Name, Evaluation Metric, Core Research Question, Solution,
Dataset Description,
Contributions, Limitations, Future Work
```
![Example](images/11.png)

`Dataset Name` is the dataset identifier; `Dataset Description` explains the data. `Model` names the model or architecture.

![Example](images/13.png)

**Note:** If the paper's details cannot be verified, `paper.bib` may be missing. This does not mean RAG analysis failed.

### Part E — Verify two fields (required)

1. Open `literature_review.csv`.
2. Choose **two fields** (for example, `Evaluation Metric` and `Limitations`).
3. In `evidence.json`, find each field's `answer`, `evidence_ids`, and evidence `page` / `text`.
4. Locate the original passages **in your own PDF** and decide if the answers are actually justified.

If a field is `Not found in retrieved evidence`, it means **the current retrieval did not find enough evidence**. It does **not** mean the paper definitely omits that information. Cite your **original paper**, not the LLM.

**Limitations:** Column-aware extraction improves common two-column layouts but may still mishandle tables, equations and unusual page designs. BM25 may miss semantic synonyms. Python validates chunk references but **cannot guarantee factual correctness**. Do not treat these outputs as verified citations without checking.

### Part F — Troubleshooting

| Issue | Check |
| --- | --- |
| `PDF not found` | Check the actual filename, path and current working directory. |
| Very little PDF text extracted | Choose a text-based PDF. OCR is not included. |
| Missing `pymupdf` / `rank_bm25` | Run `uv sync` using the updated project and activate `.venv`. |
| Missing Gemini key | Follow Section 2's API key setup. Never paste a key in source code. |
| Gemini 429 / 503 | Limits and availability vary. The script retries temporary errors three times. |
| Missing BibTeX or journal | The paper could not be reliably identified, or the DOI service could not produce BibTeX. |
| `Not found in retrieved evidence` | Review the PDF and `FIELD_QUERIES` in `05_rag.py`; keyword retrieval has limits. |
| Wrong answer or citation | Check the referenced page, correct your own notes and report the problem. |

### Advanced Challenge (Optional)

No starter code or solution is provided. Try your own approach.

- Compare BM25 with embedding-based semantic search on the *same* PDF.

Documentation: [PyMuPDF](https://pymupdf.readthedocs.io/en/latest/) · [rank-bm25](https://pypi.org/project/rank-bm25/) · [Gemini Structured Outputs](https://ai.google.dev/gemini-api/docs/structured-output) · [OpenAlex](https://developers.openalex.org/) · [Crossref DOI Content Negotiation](https://www.crossref.org/documentation/retrieve-metadata/content-negotiation/).


---

# Section 6 — Web Scraping + Automatic PDF Downloading

**Hands-on guide.** Use Section 4's `papers.csv` to automatically download available research paper PDFs. The concepts (HTTP responses, API vs. Web Scraping and HTML parsing) are explained on the [Section 6 workshop website](https://siadu.github.io/MLMPworkshop/workshop03/#s6).

**Goal:** Run `06_pdf_finder.py`, inspect the PDFs saved under `papers/`, and examine `pdf_manifest.csv`. This script does **not** call an LLM.

## Part A — Run the PDF Finder

**Input:** `papers.csv` generated by `04_research_agent.py`. Keep working inside your existing `literature_research_agent_starter/` project.

Check that the input file is present:

```bash
pwd
ls papers.csv
```

**First, test five papers:**

```bash
python 06_pdf_finder.py --input papers.csv --limit 5
```

**Then, process the complete CSV:**

```bash
python 06_pdf_finder.py --input papers.csv
```

The script creates `papers/` if necessary, saves readable PDFs there and writes the download report to `pdf_manifest.csv`. It leaves `papers.csv` unchanged.

The script first checks PDF links returned by OpenAlex, Semantic Scholar and Europe PMC. If needed, it checks paper webpages for a PDF link. It does not automatically scrape Google Scholar or bypass access restrictions.

**Optional:** `OPENALEX_API_KEY` may enable additional OpenAlex cached PDFs. No new API key is required for this task.

## Part B — Check the Results

Example project output:

```text
literature_research_agent_starter/
├── papers.csv                     # Section 4 input
├── 06_pdf_finder.py
├── pdf_manifest.csv               # Section 6 result report
└── papers/
    ├── paper_004_example.pdf
    └── paper_007_another_example.pdf
```

![Example](images/14.png)

The terminal prints a status for **each** processed paper:

| Status | What to do |
| --- | --- |
| `DOWNLOADED` | Open the newly downloaded PDF in `papers/`. |
| `EXISTING` | A valid PDF is already in `papers/`; no new download is needed. |
| `FAILED` | Check `error` and `manual_url` in `pdf_manifest.csv`. The script continues to the next paper. |

Example of a *possible* summary (your results will differ):

```text
[SUMMARY] downloaded=5, existing=1, failed=4
```

This means **six valid PDFs are available**: five newly downloaded and one existing. `EXISTING` is not a failure.

### Read `pdf_manifest.csv`

Open the report in a spreadsheet application or VS Code. Each processed paper occupies one row:

| Column | What it contains |
| --- | --- |
| `title` / `doi` / `openalex_url` | Paper details |
| `status` / `pdf_path` | Download result and local PDF path |
| `source_pdf_url` / `candidate_pdf_url` | Successful download link / attempted PDF link |
| `manual_url` / `scholar_url` | Paper page / Google Scholar link for manual checking |
| `research_status` | `RETRACTED`, `NOT_FLAGGED` or `UNKNOWN` |
| `error` | Reason recorded for a failed download, if known |

**Important:** Each run **rewrites** `pdf_manifest.csv`. Running with `--limit 5` creates a five-paper report; the later full run replaces it with a report for all input rows. Valid PDFs already in `papers/` are reused.

If `research_status` is `RETRACTED`, inspect the original retraction notice before using the work as research evidence. `NOT_FLAGGED` does not certify academic reliability; `UNKNOWN` means the status was not established.

## Part C — Handle Failed Downloads

1. Filter `pdf_manifest.csv` for `FAILED` rows.
2. Read `error` and check whether `candidate_pdf_url` contains a link.
3. Open `manual_url` in your browser. You can also try `scholar_url` to look for an available PDF.
4. If you find a PDF you can access and are allowed to use, save it in `papers/`. Respect login, payment and website access restrictions; do not bypass them.

**Note:** A PDF may require login or payment, but downloads can also fail for technical reasons. HTTP 403 only tells you that the request was rejected; it does **not** prove there is a paywall.

## Part D — Your Tasks

**Required:**
1. Run `06_pdf_finder.py` for all papers in your `papers.csv`.
2. Open `pdf_manifest.csv` and count how many papers have `DOWNLOADED`, `EXISTING` and `FAILED`. Check one local PDF opens correctly.
3. Choose one `FAILED` row. Read `error`, check whether `candidate_pdf_url` contains a link, and open `manual_url` to look for the paper yourself.

**Optional:** Open a paper webpage you can access. Check its HTML for `citation_pdf_url` or a PDF `<a>` link, and compare it with the automatic report.

### Troubleshooting

| Problem | Action |
| --- | --- |
| `papers.csv` not found | Run Section 4 and check the current working directory. |
| HTTP `403` / `robots.txt disallows automated access` | Automated access was blocked. Use the manual links and respect access restrictions. |
| HTTP `429` | Stop repeated requests; the website may be limiting access. |
| `No PDF link found in HTML` | Inspect `manual_url` yourself; the website might use another page structure. |
| `Response was not a PDF file` | The server returned another format, possibly HTML. |
| `EXISTING` | No action needed; a valid local PDF was found. |
| `RETRACTED` | Verify the paper's status before including it in academic work. |

For conceptual explanations and an interactive HTML Parsing demonstration, return to [Section 6 — Web Scraping](https://siadu.github.io/MLMPworkshop/workshop03/#s6).

---

# Section 7 — Complete Literature Research Agent

**Hands-on guide.** Section 7 combines the paper search (Section 4), single-paper RAG analysis (Section 5), and automatic open-PDF downloading (Section 6) into **one natural-language terminal Agent**.

**Your goal:** Ask the Agent for a research task from **any starting point**, then check the cumulative method comparison table. There is no requirement to start with a new search when you already have a PDF.

## Part A — Start the Agent

Use the **existing** `literature_research_agent_starter/` folder and environment. If `07_research_agent.py` or `research_agent/` is missing, follow the additional-files instructions in Section 5, Part C.

```bash
cd ~/Desktop/literature_research_agent_starter
source .venv/bin/activate
python 07_research_agent.py
```

The terminal displays:

```text
Literature Research Agent — Section 7
Search papers, download open PDFs, analyse papers, or update the method table.
You can add a PDF to papers/ and ask to analyse only that file.
Type 'exit' or 'quit' to stop; 'help' for examples.

You:
```

**Type the natural-language request after `You:`** (not as a new Linux command). The Agent can choose Python tools and use their results to decide which tool to call next.

Type `help` to see sample requests, or `exit` / `quit` to stop. Restarting the program does **not** delete your local research files.

### Optional terminal commands

To inspect existing files **without a Gemini API request**:

```bash
python 07_research_agent.py --status
```

To send just one request and exit:

```bash
python 07_research_agent.py --once "Show my research library status"
```

Interactive requests and `--once` use the existing `GEMINI_API_KEY` from Section 2; `--status` does not.

## Part B — Choose Where to Start

The Agent can start with a search, existing metadata, or a PDF you added manually. Try these instructions at the `You:` prompt:

| Starting point | Example natural-language request |
| --- | --- |
| **Search only** | `Find 5 papers about AI facial animation since 2023.` |
| **Download papers** | `Download available PDFs from my latest search.` |
| **New local PDFs** | `Analyse all unprocessed PDFs in papers/.` |
| **One new PDF** | `Analyse the only new PDF I added to papers/.` |
| **Check results** | `Show my research library status and method comparison table.` |
| **Check failures** | `Show failed PDF downloads and their manual links.` |

For a complete workflow or a specific manual PDF, follow the two examples below.

### Example 1 — Full workflow

At `You:`:

```text
Find 2 papers about speech-driven facial animation since 2022,
download available PDFs and add them to the method comparison table.
```

A successful run may include these tool names:

```text
[TOOL] search_papers
[TOOL] download_open_pdfs
[DOWNLOAD 1/2] ...
[TOOL] analyse_latest_downloads
[RAG] Analysing ...
[EXPORT] outputs/.../literature_review.csv
[TOOL] show_method_table
```
![Example](images/15.png)

Your results will vary. Check how many papers were **found**, how many PDFs were **downloaded**, and how many were **successfully analysed**. Finding two papers does not guarantee two full-text analyses.

This workflow processes the **latest search/download batch**. If you ask for “two more”, check `new_unique_papers`: some search results may already be in your library.

### Example 2 — Manually add a PDF and analyse only that paper

1. Place a text-based PDF you can access and are allowed to use directly in `papers/`.
2. Type its **exact filename**:

```text
I added TOG2024Pan.pdf to papers/.
Analyse only this PDF and add it to the method comparison table.
```
![Example](images/16.png)

If several PDFs are unprocessed, the Agent may ask for a filename instead of choosing one.

**Resume later:** You can restart the Agent and ask it to analyse unprocessed PDFs. Python uses each file's **SHA-256 hash** to skip unchanged PDFs it has already analysed.

## Part C — Inspect the Results

```text
literature_research_agent_starter/
├── papers.csv                         # Cumulative metadata (Section 7)
├── pdf_manifest.csv                   # Cumulative download report
├── papers/
│   ├── TOG2024Pan.pdf                 # Manually added PDF
│   └── paper_012_example.pdf          # Example downloaded PDF
├── outputs/
│   ├── TOG2024Pan/
│   │   ├── literature_review.csv      # Individual 13-column review row
│   │   ├── evidence.json              # Extracted evidence and page references
│   │   └── paper.bib                  # If verified metadata is available
│   └── method_comparison.csv          # Cumulative review of analysed PDFs
└── state/
    ├── library.json                   # Saved analysis status
    └── searches/                      # Per-search plans and logs
```

Open **`outputs/method_comparison.csv`**. It contains the 13 Section 5 fields plus `PDF SHA256` and `PDF Filename` to identify each file. New analyses add rows; existing rows and manual edits are preserved.

To check an answer, open the paper's `outputs/<pdf_name>/evidence.json` and compare it with the original PDF.

**Current limitation:** The Agent does **not** have a dedicated tool to import the contents of an old `literature_review.csv` into `method_comparison.csv` without re-running RAG. If an older analysis was created before Section 7 started tracking it, the Agent may analyse its PDF again in order to add its row.

## Part D — Your Tasks

**Required:**

1. Start the Agent. Choose **one PDF already in `papers/`**, ask it to analyse only that file, and check whether its method-table row is added or already exists.
2. Ask the Agent to find **two papers** on a topic, download available PDFs, and update the method comparison table. Check how many were found, downloaded and analysed.
3. Open `outputs/method_comparison.csv` and the corresponding `evidence.json`. Verify **two extracted fields** against the original PDF.
4. Stop and restart the program; ask for the library status and confirm your existing table is still available.

**Optional:** Add one new PDF manually and verify that it adds just one method-table row without changing manually corrected cells in older rows.

## Part E — Troubleshooting

| Problem | What to check |
| --- | --- |
| `07_research_agent.py` or `research_agent/` missing | Copy the additional workshop files into the **existing** starter directory (Section 5, Part C). |
| `GEMINI_API_KEY` missing | Follow Section 2. Never publish your API key. |
| `Cannot send a request, as the client has been closed` | Update **both** `07_research_agent.py` and `research_agent/agent.py` from the current [starter repository](https://github.com/SiaDu/MLMPworkshop/tree/main/workshop03_Building_an_AI_Agent/literature_research_agent_starter); restart. |
| `No such PDF in papers/` | Check the exact spelling and extension; ask the Agent to list local PDFs. |
| `NEED_FILENAME` | More than one PDF is awaiting analysis. Supply the exact filename. |
| `ALREADY_ANALYSED` | The PDF is already tracked; the existing table row should be preserved. |
| Not all searched papers appear in the table | Some PDFs may not be available, or analysis may have failed. Check `pdf_manifest.csv` and the terminal log. |
| Gemini `429` / `503` or incomplete run | Check quota and API availability. Local results can be reused when you retry, but review the state before repeating a large task. |
| Method/table contents appear incorrect | Verify `evidence.json` and the original PDF. The LLM may misinterpret papers; a valid evidence ID does not guarantee factual support. |

**Academic check:** Do not cite the generated method table without verifying the original papers. Unavailable PDFs are not grounds for inventing methods, datasets, metrics or references.
