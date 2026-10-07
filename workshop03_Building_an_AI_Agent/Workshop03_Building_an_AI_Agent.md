# Workshop 03 — Building an AI Agent

**Theme:** From LLM APIs to Agentic Media Workflows

## Overview

In this workshop, we will explore how to build AI agents that go beyond generating text. Students will learn how agents use language models, external tools, retrieved information, and multi-step workflows to complete practical tasks.

We will explore several **potential AI for Media demo projects** before selecting the final mini project. All options use the same core agent concepts but apply them to film, animation, or media production. The recommended starting point is an **AI Virtual Director** that turns a short script into a checked, structured shot plan.

The emphasis is on **practical applications and AI-assisted development**, rather than training models or implementing algorithms from scratch.

## Learning Objectives

By the end of this workshop, students should be able to:

- Explain the difference between an LLM API call, a fixed workflow, and an AI agent.
- Understand how function calling, tools, and the agent loop work together.
- Use structured outputs to organise AI-generated information.
- Explain the roles of RAG, MCP, LangGraph, and multi-agent systems.
- Build and evaluate a simple tool-using agent for a media production task.
- Recognise when human approval, validation, and persistent state are needed.

## Workshop Outline

### 1. Introduction to AI Agents
- What is an AI agent?
- Chatbots vs. workflows vs. agents
- Core components: models, instructions, tools, state, and the agent loop
- Agent applications in media production

### 2. LLM APIs and Structured Outputs
- Connecting an application to an LLM through an API
- API keys, tokens, and usage costs
- Prompts, model responses, and structured data
- Extracting production requirements into a consistent format

### 3. Function Calling and the Agent Loop
- Python functions as agent tools
- How an LLM selects tools and receives results
- Observe → Decide → Act → Observe
- Tool use, stopping conditions, and error handling

### 4. Retrieval-Augmented Generation (RAG)
- Why agents need information beyond their model knowledge
- Document retrieval, embeddings, and semantic search
- Using production briefs, style guides, and licensing documents
- Grounding answers in retrieved sources

### 5. Model Context Protocol (MCP)
- What MCP is and what problem it solves
- MCP clients, servers, and tools
- Connecting agents to external applications and data sources
- MCP vs. direct function calling

### 6. Agent Workflows with LangGraph
- Workflows vs. autonomous decisions
- Nodes, edges, shared state, and conditional routing
- Checkpoints, resuming tasks, and human-in-the-loop approval
- Organising a multi-step media research workflow

### 7. Introduction to Multi-Agent Systems
- Single-agent vs. multi-agent architectures
- Specialist agents and task delegation
- Coordination, handoffs, and agent-as-tool patterns
- When multiple agents are useful—and when they add unnecessary complexity

### 8. Potential Mini Projects (To Be Confirmed)

The final demo has **not yet been selected**. Possible projects include:

#### Option A — AI Virtual Director: Script to Shot Plan (Recommended)

**Scenario:** A film or animation director provides a short script, character notes, and constraints (e.g., 45 seconds, maximum five shots).

**Agent goal:** Interpret the script, retrieve character/production context, draft a shot list, check continuity and constraints, revise when needed, and produce a structured shot plan.

**Potential output:** Shot number, shot type, camera framing, character action, duration, narrative purpose, and review notes.

**Relevant concepts:** LLM API, structured outputs, tool calling, RAG, LangGraph revision loop, optional Director and Continuity agents.

**Optional extension:** Turn an approved shot plan into a simple Blender previsualisation with deterministic scripts.

#### Option B — AI Video Editing Assistant

**Scenario:** An editor has footage descriptions, transcripts, timecodes, and a target narrative or duration.

**Agent goal:** Retrieve relevant clips, propose an edit decision list, check duration and continuity, and explain editing choices.

**Potential output:** Structured clip selections, in/out timecodes, ordering, and an edit decision list (EDL-style plan).

**Relevant concepts:** Tool calling, retrieval, structured outputs, stateful workflow, optional automated editing tools.

#### Option C — AI Continuity Detective

**Scenario:** A production team has a script, character bible, scene notes, and draft shot plans containing deliberate inconsistencies.

**Agent goal:** Cross-reference source documents, detect continuity or production-rule problems, and produce evidence-based review notes.

**Potential output:** An issue report listing inconsistencies, supporting source references, severity, and suggested corrections.

**Relevant concepts:** RAG, grounded evidence, validation, conditional branches, optional specialist review agents.

#### Option D — AI Media Asset Research Assistant

**Scenario:** A team is choosing 3D models, textures, and sound assets for an animation project.

**Agent goal:** Search a sample catalogue, review specifications and licensing information, compare options, and identify missing information.

**Potential output:** A structured asset comparison sheet, with technical constraints, licensing status, cost, and sources.

**Relevant concepts:** Function calling, retrieval, structured outputs, browser/MCP extensions, automated reporting.

**Proposed common teaching approach:** Compare a single LLM response against a tool-using agent workflow, then evaluate correctness, traceability, number of tool calls, and limitations. Students work with provided starter files rather than implementing every system from scratch.

### 9. Further Possibilities
- Browser automation and computer-use agents
- Persistent memory and long-running tasks
- External integrations through MCP
- Multi-agent research and review workflows
- Reliability, safety, and human oversight

## Free API and Model Options (For Classroom Use)

**Teaching principle:** Students should not be required to purchase API credits. The main exercises should work within a provider's free tier or a local/offline fallback. Free-tier availability, model access, and rate limits may change, so check the official links again before teaching.

| Option | Free access | Suitable for | Notes |
| --- | --- | --- | --- |
| **Google Gemini API (Google AI Studio)** — **preferred** | Free tier for eligible models and accounts | LLM API calls, function calling, structured outputs, multimodal media tasks | Suggested classroom model: `gemini-3.5-flash-lite`. Check current free-tier eligibility and rate limits for the model and account. |
| **GroqCloud API** — **backup** | Free plan with rate limits | Fast text-based tool calling and structured extraction | `openai/gpt-oss-20b` is one possible model; verify which models support the specific structured-output mode being used. |
| **OpenRouter** | Free models with low request limits | Alternative API endpoint and model comparison | Free-model availability and capabilities vary; not all free models support the same tool/JSON features. |
| **Hugging Face Inference Providers** | Small monthly free inference credit allowance | Optional model exploration | Credit allowance is limited and may not cover repeated agent loops. |
| **Ollama (local)** | No per-request API charge | Offline/local experiments | No cloud credit requirement, but performance depends on the computer and model. |

**Official links:**
- [Gemini API pricing and free tier](https://ai.google.dev/gemini-api/docs/pricing) · [Google AI Studio API keys](https://aistudio.google.com/apikey) · [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling)
- [GroqCloud free-tier rate limits](https://console.groq.com/docs/rate-limits) · [Groq tool use](https://console.groq.com/docs/tool-use/overview) · [Groq structured outputs](https://console.groq.com/docs/structured-outputs)
- [OpenRouter pricing and free limits](https://openrouter.ai/pricing)
- [Hugging Face Inference Providers pricing](https://huggingface.co/docs/inference-providers/pricing)
- [Ollama](https://ollama.com/)

**Cost-aware workshop design:**
- Use one recommended provider for the class, with one documented backup.
- Keep example scripts, reference documents, and tool-call loops small.
- Use local retrieval (e.g., keyword search or TF-IDF) for the RAG example; a paid embedding API is not necessary.
- Use local tools and a local MCP server where possible; LangGraph and multi-agent orchestration do not inherently require paid cloud services.
- Provide sample/model-mocked outputs if API sign-up, access, or quotas fail.
- Keep API keys out of source code and Git commits. Use fictional or non-sensitive class data for free-tier API tests.

## Expected Outcome

Students will develop a small, tool-using AI agent and explain how its model, tools, retrieved information, and workflow interact.

**Key takeaway:** An agent is not simply an LLM with a prompt. It is a system that can use tools and make bounded decisions within a designed workflow.
