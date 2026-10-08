# Workshop 03 — Building an AI Agent

**Theme:** From LLM APIs to an AI Literature Research Agent  
**Duration:** **2 hours (120 minutes)**  
**Core demo:** AI Literature Research Agent for the AI for Media survey assignment

## Overview

In this workshop, students will build a small **AI Literature Research Agent** to support their upcoming survey assignment. The agent will use an LLM to formulate search queries, select a paper-search tool, retrieve **real academic metadata**, and export a traceable reading list.

The priority is a **working, understandable agent**, not learning every agent framework in one session. RAG gets a short guided exercise; LangGraph, MCP, and multi-agent systems are introduced through demonstrations or conceptual examples. Students can explore them in the optional challenges.

The agent **does not write the survey**. Students remain responsible for reading papers, evaluating the literature, checking references, and forming their own arguments.

## Learning Objectives

By the end of the workshop, students should be able to:

- Explain the difference between an LLM API call, a fixed workflow, and an AI agent.
- Run an LLM API call and produce structured JSON output.
- Explain and observe **function calling** and the **agent loop**.
- Use OpenAlex as an academic search tool to retrieve real paper metadata.
- Export a small, deduplicated, source-traceable paper list for their survey.
- Experience evidence retrieval from a provided paper excerpt (RAG).
- Recognise when LangGraph, MCP, multi-agent systems, and browser automation are useful.

## Teaching Levels

- **[Required Hands-on]** Every student runs and modifies the exercise.
- **[Guided Hands-on]** Provided starter code; a short, focused exercise.
- **[Live Demo]** Instructor runs a prepared example; no student setup required.
- **[Concept Overview]** Brief explanation only.
- **[Advanced Challenge]** Optional work after core tasks or after the workshop.

## Workshop Outline — 2 Hours

| Time | Topic | Level |
| --- | --- | --- |
| 0:00–0:10 (10 min) | 1. What Is an AI Agent? | Concept overview |
| 0:10–0:30 (20 min) | 2. LLM API + Structured Outputs | **Required Hands-on** |
| 0:30–1:05 (35 min) | 3. Function Calling + OpenAlex Paper Search | **Required Hands-on** |
| 1:05–1:30 (25 min) | 4. Build & Test the Literature Research Agent | **Required Hands-on** |
| 1:30–1:45 (15 min) | 5. RAG: Retrieving Evidence from Papers | **Guided Hands-on** |
| 1:45–1:55 (10 min) | 6. LangGraph: Stateful Agent Workflows | **Live Demo** |
| 1:55–2:00 (5 min) | 7. MCP + Multi-Agent Systems | **Concept Overview** |
| | **Total: 120 min** | |

### 1. What Is an AI Agent? — Concept Overview (10 min)

- **LLM vs. AI Agent (2 min):** A model response vs. an application that uses an LLM to select actions and tools.
- **Workflow vs. Agent (3 min):** Predetermined steps vs. model-directed choices; workflows can execute code and can include agents.
- **Anatomy of an Agent (2 min):** Model, instructions, and tools, using OpenAlex paper search as the example.
- **Agent Loop (3 min):** Decide → request a tool → execute Python/API tool → observe the result → repeat or finish.

**Key distinction:** The LLM chooses or requests actions within its permitted scope; application code performs tool execution and enforces boundaries. **Agentic workflows** combine program-defined steps with agent-directed decisions.

### 2. LLM API + Structured Outputs — Required Hands-on (20 min)

- Call a free-tier LLM API from Python
- Turn a survey topic into research keywords
- Request and validate structured JSON output
- Basic API-key safety, token usage, and rate limits

**Starter code and beginner instructions:** [Section 2 — LLM API + Structured Outputs](literature_research_agent_starter/README.md). Includes `~/.bashrc` setup, the `uv` project, two commented Python scripts, and a prepared OpenAlex tool for Section 3.

### 3. Function Calling + OpenAlex Paper Search — Required Hands-on (35 min)

- Create or use a `search_papers(query)` Python tool backed by the OpenAlex API
- Let the model choose when to invoke that tool
- Inspect the tool request, Python execution, and returned result
- Understand the **agent loop**: request → tool call → observation → response
- Collect titles, authors, years, identifiers, and source URLs

**Important distinction:** Function calling is how the model requests an action; an API request is one way the Python tool performs that action. Web scraping and browser automation are different implementations of possible tools, not requirements for OpenAlex paper search.

### 4. Build & Test — AI Literature Research Agent — Required Hands-on (25 min)

**Scenario:** Each student enters a research topic related to their own AI for Media survey.

**Minimum workflow:**

1. Generate one or more relevant search queries.
2. Call the OpenAlex paper search tool.
3. Deduplicate and preserve metadata/source links.
4. Export a short list for manual reading and checking.

**Minimum output:** `papers.csv` with approximately 5–10 real papers, paper titles, years, identifiers/URLs where available, and a basic relevance note. The provided starter project can also export `references.bib`; students must check the bibliography before citing it.

**Check for success:** At least one real tool call is visible in the run log, records correspond to source links, and the exported file can be opened.

### 5. RAG — Guided Hands-on (15 min)

- Distinguish *paper discovery* (OpenAlex) from *evidence retrieval* (RAG).
- Use a **provided, short, lawfully accessible paper excerpt or pre-extracted text**, not a full PDF-ingestion pipeline.
- Retrieve a relevant passage and generate an evidence-grounded answer with a source reference.
- Explain chunks, lexical/semantic search, and embeddings at a high level.

**Full PDF ingestion and multi-document semantic retrieval are advanced challenges.**

### 6. LangGraph — Live Demo (10 min)

- Show a prepared graph: search → check results → refine query or export.
- Explain nodes, edges, shared state, and conditional routing.
- Mention checkpointing, resumable tasks, and human approval as extensions.

**Students are not required to install or implement LangGraph during this two-hour workshop.**

### 7. MCP + Multi-Agent Systems — Concept Overview (5 min)

- **MCP:** A standard interface for connecting AI applications to external tools/data; contrast with a direct Python function tool.
- **Multi-Agent:** A Research Agent can discover papers while a Verification Agent checks metadata/evidence.
- Explain why these architectures are optional, not prerequisites for building a useful single agent.

## Preparation Before Class (Not Included in 120 Minutes)

To keep the practical work feasible:

- Provide a ready-to-clone starter repository with a tested Python/`uv` environment and dependencies.
- Ask students to set up a free-tier LLM API key in advance; supply a mock mode for access or quota problems.
- Confirm current OpenAlex API-key/access requirements and test the paper-search function.
- Prepare a small, fixed paper-text sample for the RAG exercise and cached search results for fallback.
- Prepare LangGraph screenshots or a runnable instructor demo so students do not need separate setup.

## Advanced Challenges (Optional)

| Challenge | Main concept |
| --- | --- |
| Refine search terms automatically when too few relevant papers are found | Agent loop |
| Retrieve evidence from a full-text PDF and cite the relevant page/section | RAG |
| Add a conditional retry or manual approval branch | LangGraph |
| Connect a research-management or file tool through an existing MCP server | MCP |
| Add a specialist review agent to cross-check claims | Multi-agent |
| Open a public paper page and extract permitted information with Playwright | Browser automation / web scraping |

**Browser automation note:** Academic APIs are the preferred way to search paper metadata. Web scraping extracts data from pages, while browser automation can navigate and interact with a site. Both can be exposed as callable tools, but they are not the same as function calling itself. Browser automation is an optional extension, not a requirement for the core workshop.

## Free APIs and Tools

**Goal:** Students should not need to buy API credits. Use small requests, free plans (where eligible), and prepared offline/mock results when provider access is unavailable. Free-tier eligibility and quotas may change; check the official documentation again before teaching.

### LLM APIs

| Provider | Intended use | Classroom role |
| --- | --- | --- |
| **Google Gemini API (Google AI Studio)** | LLM calls, tool/function calling, structured output | Preferred free-tier option; final model to be confirmed after testing |
| **GroqCloud** | Text-based tool calling and structured extraction | Backup free-plan option |
| **Ollama** | Local model inference, hardware permitting | Optional local/offline alternative |

- [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) · [Google AI Studio API key](https://aistudio.google.com/apikey)
- [GroqCloud rate limits](https://console.groq.com/docs/rate-limits) · [Groq tool use](https://console.groq.com/docs/tool-use/overview)
- [Ollama](https://ollama.com/)

### Academic Search and Metadata APIs

| API | Intended use | Classroom role |
| --- | --- | --- |
| **OpenAlex** | Search and filter academic works | Primary paper-discovery API; check current free-account/API-key requirements |
| **Crossref REST API** | Check DOI and bibliographic metadata | Optional verification API; public access without paid subscription |
| **Semantic Scholar Academic Graph API** | Discover related papers and citation links | Optional extension; rate limits and access policies apply |

- [OpenAlex](https://openalex.org/) · [OpenAlex API documentation](https://help.openalex.org/)
- [Crossref REST API](https://www.crossref.org/documentation/retrieve-metadata/rest-api/)
- [Semantic Scholar API](https://www.semanticscholar.org/product/api)

### Free/Open-Source Components

- **RAG:** Local keyword/TF-IDF search over provided documents; paid embedding services are not required for the guided exercise.
- **LangGraph:** Open-source workflow orchestration, using the selected model API if the workflow needs LLM calls.
- **MCP:** Local/compatible MCP tools for the instructor demonstration.
- **Data export:** Python, CSV, and BibTeX.
- **Optional browser automation:** Playwright; not part of the required setup.

### Classroom Preparation Notes

- Provide starter code and a small sample paper dataset, plus sample PDFs/text for retrieval.
- Use one LLM provider in the main tutorial and document one backup.
- Keep tool loops and API requests bounded to reduce rate-limit failures.
- Never commit API keys to GitHub.
- Use non-sensitive teaching data with free-tier model services.
- Provide mock API responses if registration, quotas, or network access fail.
- Avoid assuming that every metadata record has a DOI, abstract, or freely accessible PDF.

## Expected Outcome

Students leave with a **small working AI Literature Research Agent** that uses an LLM API, function calling, real OpenAlex records, and structured output to generate a reading list for their survey.

They experience RAG with supplied evidence and gain a conceptual understanding of LangGraph, MCP, and multi-agent systems. The more complex integrations are **optional extensions**, not required two-hour deliverables.
