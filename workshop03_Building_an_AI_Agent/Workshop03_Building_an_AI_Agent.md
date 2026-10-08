# Workshop 03 — Building an AI Agent

**Theme:** From LLM APIs to an AI Literature Research Agent

## Overview

In this workshop, we will build an **AI Literature Research Agent** that students can use to support the literature search and preparation for their **AI for Media survey assignment**.

Rather than asking an LLM to invent a reading list or write a survey, the agent will search real academic databases, organise verified paper metadata, retrieve evidence from selected papers, and prepare a research comparison matrix.

The workshop focuses on **practical, AI-assisted development**, not training models or implementing low-level algorithms from scratch. Students may use an AI coding assistant, but should understand which decisions are made by the LLM and which operations are carried out by Python tools.

## Learning Objectives

By the end of the workshop, students should be able to:

- Distinguish an LLM API call, a fixed workflow, and an AI agent.
- Explain how function calling and the agent loop enable an LLM to select and use tools.
- Search real papers using an academic search API and validate basic bibliographic information.
- Extract structured data, deduplicate records, and export usable research outputs.
- Use retrieval-augmented generation (RAG) to answer questions from provided paper content with evidence.
- Understand how LangGraph, MCP, and multi-agent systems extend an agent.
- Identify hallucinations, missing evidence, usage limits, and situations requiring human verification.

## Teaching Levels

- **[Required Hands-on]** Every student runs and modifies the exercise.
- **[Guided Hands-on]** Starter code is provided; students explore or modify a small feature.
- **[Live Demo]** The instructor demonstrates the concept. No student setup required.
- **[Advanced Challenge]** Optional extension for students who finish early or want to explore further.

## Workshop Outline (Proposed: 3 Hours)

| Section | Topic | Level | Approx. time |
| --- | --- | --- | --- |
| 1 | Introduction: What Is an AI Agent? | Concept introduction | 10 min |
| 2 | LLM APIs | **Required Hands-on** | 15 min |
| 3 | Structured Outputs | **Required Hands-on** | 15 min |
| 4 | Function Calling and the Agent Loop | **Required Hands-on** | 30 min |
| 5 | Academic Paper Search with OpenAlex | **Required Hands-on** | 20 min |
| 6 | Retrieval-Augmented Generation (RAG) | **Guided Hands-on** | 20 min |
| 7 | Agent Workflows with LangGraph | **Guided Hands-on** | 25 min |
| 8 | Model Context Protocol (MCP) | **Live Demo** | 10 min |
| 9 | Multi-Agent Systems | **Live Demo** | 10 min |
| 10 | Mini Project Integration and Testing | **Required Hands-on** | 25 min |
| | **Total** | | **180 min** |

### 1. What Is an AI Agent? — Concept Introduction

- Chatbot vs. LLM API vs. workflow vs. agent
- Models, instructions, tools, state, and agent loops
- The distinction between model decisions and deterministic Python operations
- Example use case: supporting literature discovery for a survey

### 2. LLM APIs — Required Hands-on

- Calling a model from a Python application
- Prompts, responses, API keys, tokens, and free-tier limits
- Turning a survey topic into relevant academic search keywords

### 3. Structured Outputs — Required Hands-on

- Structured JSON outputs and schema validation
- Organising search queries and paper metadata into consistent fields
- Why a validated schema is more reliable than free-form text for automation

### 4. Function Calling and the Agent Loop — Required Hands-on

- Exposing a Python function as an LLM-accessible tool
- How the model requests a tool call and Python executes it
- Repeating the cycle: observe → decide → call tool → inspect result → finish or continue
- Distinguishing **function calling** from the underlying **API request**, **web scraping**, and **browser automation**
- Simple safeguards: maximum steps, input validation, and error handling

### 5. Academic Paper Search with OpenAlex — Required Hands-on

- Searching real papers by topic using the OpenAlex API
- Gathering title, authors, year, venue, DOI/identifiers, and source links
- Deduplicating records and filtering by research relevance
- Cross-checking identifiers and bibliographic metadata, optionally with Crossref
- Recognising that metadata search does **not** mean access to full paper content

**Core learning point:** The OpenAlex request is an API operation. It becomes an agent tool when the LLM can decide when and how to call the search function.

### 6. Retrieval-Augmented Generation (RAG) — Guided Hands-on

- The difference between *discovering papers* and *retrieving evidence from paper content*
- A small collection of provided, lawfully accessible paper PDFs or text
- Retrieval basics: chunks, lexical/semantic search, embeddings (concept only)
- Answering questions about methods, contributions, or limitations with traceable source evidence
- Marking missing or unsupported claims instead of inventing findings

### 7. Agent Workflows with LangGraph — Guided Hands-on

- Nodes, edges, shared state, and conditional routing
- Example workflow: search → deduplicate → check coverage → review → export
- A simple branch: insufficient relevant results → refine query and search again
- Brief introduction to checkpointing, task resumption, and human-in-the-loop review

### 8. Model Context Protocol (MCP) — Live Demo

- MCP as a standard for connecting tools and data sources to AI applications
- Client, server, tools, and resources
- Demonstration of an existing local or research-related MCP tool
- MCP vs. direct Python function calling

### 9. Multi-Agent Systems — Live Demo

- Single-agent vs. multi-agent designs
- Example: **Research Agent** finds papers; **Verification Agent** checks metadata and supporting evidence
- Delegation, agent-as-tool, and handoff concepts
- When multiple agents increase complexity without improving results

### 10. Mini Project — AI Literature Research Agent (Required Hands-on)

**Scenario:** Each student enters a topic relevant to their AI for Media survey assignment.

**Core workflow:**

1. Interpret the research topic and generate search queries.
2. Use a tool to retrieve **real** papers from an academic API.
3. Filter and deduplicate the results.
4. Verify basic metadata and preserve sources.
5. Export a reading list and structured research matrix.

**Expected core outputs:**
- `papers.csv` — a list of approximately 10 real, traceable papers, with titles, years, authors, identifiers/URLs, and relevance notes.
- `references.bib` — BibTeX references based on verified metadata.
- A short run log or README explaining the agent's tools and decisions.

**Guided extensions:** Investigate approximately five selected papers using supplied full text or verifiable excerpts; record methods, datasets, contributions, and limitations **only when supported by evidence**. Run the provided LangGraph branch and a small RAG exercise.

**Academic integrity:** This agent supports discovery and organisation, not automatic authorship of the survey. Students must read and critically assess their selected papers and confirm citations before using them.

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

Each student should have a working **AI Literature Research Agent** that searches actual academic metadata, uses model-selected tools, generates structured outputs, and creates a verifiable paper list to support their survey work.

Students should also be able to explain the different purposes of **API calling, function calling, RAG, MCP, LangGraph, multi-agent systems, and browser automation** without assuming that every project needs all of them.
