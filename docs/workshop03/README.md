# Workshop 03 — Interactive Classroom Website

The website is the **student-facing slide deck and practical instructions**. Students should be able to learn and complete Section 2 **without opening this README**.

## Layout

The website is **one continuous page**, with a persistent left sidebar listing all seven course sections.

- **Section 01 — What Is an AI Agent?** LLM vs Agent, Workflow vs Agent, model/instructions/tools, step-by-step agent tool loop and quiz.
- **Section 02 — LLM API + Structured Outputs.** A two-way API flow diagram, compact example code, reserved starter ZIP download position (Coming Soon), interactive natural-language vs JSON comparison, and validation examples. The complete annotated scripts, Linux API-key setup and `uv` commands live in the starter project's README.
- **Sections 03–07.** Navigation and brief concept previews, ready for later lesson development.

The sidebar deliberately has **no progress bar or teaching-duration labels**.

## Student workflow

1. Open the website at the classroom's GitHub Pages URL.
2. Learn the concepts from the slides. The Section 2 ZIP download is intentionally disabled until the full project is complete.
3. Once the ZIP is released, extract it, open its README and follow the instructions. No full-repository clone or separate repository is necessary.
4. The starter project's `README.md` is the detailed student guide with all commands, complete commented scripts and troubleshooting.

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
