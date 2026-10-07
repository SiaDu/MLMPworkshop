# Workshop 03 — Building an AI Agent

**Theme:** From LLM APIs to Agentic Media Workflows

## Overview

In this workshop, we will explore how to build AI agents that go beyond generating text. Students will learn how agents use language models, external tools, retrieved information, and multi-step workflows to complete practical tasks.

We will use an **AI Media Asset Research Assistant** as a running example: an agent that helps a media production team research assets, check requirements, compare options, and organise findings into a structured asset sheet.

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

### 8. Mini Project — AI Media Asset Research Assistant

**Scenario:** A production team needs to identify suitable 3D models, textures, and sound assets for a short animation while considering budget, technical requirements, and licensing.

**Proposed capabilities:**
- Interpret a media production brief.
- Search a sample asset catalogue using tools.
- Retrieve relevant production or licensing guidelines.
- Compare candidate assets and identify missing information.
- Organise recommendations into a structured asset comparison sheet.

### 9. Further Possibilities
- Browser automation and computer-use agents
- Persistent memory and long-running tasks
- External integrations through MCP
- Multi-agent research and review workflows
- Reliability, safety, and human oversight

## Expected Outcome

Students will develop a small, tool-using AI agent and explain how its model, tools, retrieved information, and workflow interact.

**Key takeaway:** An agent is not simply an LLM with a prompt. It is a system that can use tools and make bounded decisions within a designed workflow.
