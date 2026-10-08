# Section 2 — LLM API + Structured Outputs

**Workshop 03 · Required hands-on · 20 minutes**

## What you will build

Turn your **AI for Media survey topic** into a structured research `SearchPlan`.

- **Script 01:** Ask the Gemini API for three research queries (ordinary text).
- **Script 02:** Ask for structured JSON, validate it with Pydantic and save `search_plan.json`.
- **`tools.py`:** An instructor-prepared OpenAlex paper-search tool for **Section 3**. You do **not** need to write or edit it in Section 2.

**You are not expected to type all the Python code from scratch.** Read the comments, run the provided examples and change the specified values.

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

## Part B — Install project dependencies

From the **root of the cloned MLMPworkshop repository**, run:

```bash
# Enter the pre-prepared starter project folder.
cd workshop03_Building_an_AI_Agent/literature_research_agent_starter

# Download/install the packages listed in pyproject.toml.
# uv also creates a project-local .venv if it does not exist.
uv sync

# Activate this project's virtual environment.
source .venv/bin/activate

# Check that Python is coming from this project's .venv.
which python
python --version
```

**You do not need `sudo`.** If `uv sync` reports that no suitable Python is available, ask the instructor before changing system Python. A possible user-local installation is `uv python install 3.11`, followed by `uv sync --python 3.11`.

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

Read the comments in `01_first_api_call.py`.

**Your task:** Change `TOPIC = "AI facial animation"` to your survey topic, then run the file again.

Notice the answer is natural language. A Python program cannot safely assume that every reply will use the same bullet points or wording.

## Part D — Structured Outputs

```bash
# Request structured JSON using a Pydantic schema.
python 02_structured_output.py
```

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
