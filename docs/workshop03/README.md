# Workshop 03 — Interactive Agent Playground

This is the **Section 1 (10 minutes)** teaching page for *What Is an AI Agent?*.

## Live content

- **From LLM to Agent** — a comparison of text-only responses and agents with tools.
- **Workflow vs Agent** — two switchable scenarios:
  - Text: literature search with scarce or sufficient results.
  - Image: storyboard frame that is underexposed or poorly framed.
- **Inside an Agent** — Model, Instructions, Tools.
- **The Agent Loop** — step-by-step inspection of five available tools, the illustrative model selection, the structured tool request, simulated execution, tool result, and repeated model choice.
- **Quick Check** — three scored questions.

**Important:** All agent decisions, paper records and tool results on this page are **simulated teaching traces**, not real LLM calls. No API keys or paid services are necessary to view this lesson. Real LLM function calling and OpenAlex search are covered in the coding sections of the workshop.

## Deploy on GitHub Pages

The site is ready to be served as a static website. In the repository:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch **main**, folder **/docs**, then **Save**.
4. When GitHub reports the publication, open:
   - Landing page: https://siadu.github.io/MLMPworkshop/
   - Section 1: https://siadu.github.io/MLMPworkshop/workshop03/

Publication requires GitHub Pages to be enabled in repository settings; committing the files alone does **not** prove that the public URL is live.

## Local preview

From the cloned repository root:

```bash
python -m http.server 8000 --directory docs
```

Then open http://localhost:8000/workshop03/ .

## File structure

```text
docs/
├── index.html
└── workshop03/
    ├── index.html
    ├── styles.css
    ├── app.js
    └── README.md
```

The illustration is inline SVG, so the teaching page has no external image dependency. The JavaScript does not contact LLM providers or academic APIs.

## Future sections

The real API coding exercises should remain in the Python workshop materials. A future enhancement could let students load a genuine `trace.json` exported from the Python agent and replay its tool calls in this interface.
