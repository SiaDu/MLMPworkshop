# Workshop 03 — Interactive Classroom Website

The website is the **student-facing slide deck and practical instructions**. Students should be able to learn and complete Section 2 **without opening this README**.

## Layout

The website is **one continuous page**, with a persistent left sidebar listing all seven course sections.

- **Section 01 — What Is an AI Agent?** LLM vs Agent, Workflow vs Agent, model/instructions/tools, step-by-step agent tool loop and quiz.
- **Section 02 — LLM API + Structured Outputs.** How Python calls Gemini, Bash key setup, `uv sync` and activation, complete instructor-provided Python scripts with comments and copy buttons, interactive natural-language vs JSON comparison, Pydantic validation examples.
- **Sections 03–07.** Navigation and brief concept previews, ready for later lesson development.

The sidebar deliberately has **no progress bar or teaching-duration labels**.

## Student workflow

1. Open the website at the classroom's GitHub Pages URL.
2. Read slides and copy commands directly from the website.
3. Clone/sync the course repository and follow the starter scripts in `workshop03_Building_an_AI_Agent/literature_research_agent_starter/`.
4. The starter project's `README.md` is an instructor reference and additional troubleshooting document, **not** a required student handout.

## Files

```text
docs/
├── index.html
└── workshop03/
    ├── index.html       # One-page classroom presentation
    ├── styles.css       # Section 01 + shared design
    ├── app.js           # Section 01 interaction
    ├── section02.css    # Section 02 presentation and code blocks
    ├── section02.js     # JSON switching, sample validation and code copy
    └── README.md        # Instructor/reference information
```

Section 01 agent-loop results and Section 02 preview/validation outputs are **predefined interactive examples**. The page itself never calls an LLM and does not collect or store API keys. The actual Gemini calls are performed locally by the students' Python scripts.

## Local preview

From the cloned repository root:

```bash
python -m http.server 8000 --directory docs
```

Open http://localhost:8000/workshop03/ and refresh after edits. No build tool is needed.

## GitHub Pages

In **Settings → Pages**, select `Deploy from a branch`, then `main` / `/docs`.

Public URL after publishing: https://siadu.github.io/MLMPworkshop/workshop03/

**Branch convention:** Make new website changes on `dev`. Merge to `main` only when the instructor approves a stable version. GitHub Pages continues to serve `main`.
