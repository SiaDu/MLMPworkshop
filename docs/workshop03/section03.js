"use strict";

// Section 3: illustrative function-calling trace.
// This website never makes a live Gemini/OpenAlex request. Students use the
// supplied Python scripts to see real tool calls and real paper metadata.

const S3_TRACE = [
  {
    label: "User request",
    title: "One user instruction",
    subtitle: "The student enters the request once. Their Python program sends it to Gemini with a tool definition.",
    payload: 'Find 5 academic papers about\nAI facial animation.',
    insightTitle: "Who made the request?",
    insight: "The student asked for papers. The Python script exposes the local search_papers() function as a tool to Gemini. No paper search has happened yet."
  },
  {
    label: "Gemini chooses",
    title: "A tool-call request",
    subtitle: "Gemini may decide to use the available tool, choosing a function name and arguments.",
    payload: '{\n  "name": "search_papers",\n  "args": {\n    "query": "facial animation",\n    "limit": 5\n  }\n}',
    insightTitle: "The model did NOT search OpenAlex",
    insight: "This is only a requested function call. The query and arguments are illustrative: an actual model may choose different keywords or may not call the tool."
  },
  {
    label: "Python executes",
    title: "The SDK calls local Python",
    subtitle: "The automatic function-calling mechanism dispatches the request to the function running on the student's computer.",
    payload: '[GEMINI → PYTHON] Requested tool:\nsearch_papers\n\n[ARGS] query=\'facial animation\', limit=5\n\n[PYTHON] Calling OpenAlex...',
    insightTitle: "SDK dispatches; Python executes",
    insight: "The Gemini SDK can call the supplied Python function. That function uses requests.get() to contact api.openalex.org/works and receives bibliographic metadata."
  },
  {
    label: "Tool response",
    title: "Real metadata comes back",
    subtitle: "OpenAlex returns a list of paper records. The SDK sends the tool result back to Gemini.",
    payload: '[TOOL RESULT] Retrieved N records.\n\n[\n  {\n    "title": "<title from OpenAlex>",\n    "year": 2024,\n    "doi": "<DOI or null>"\n  },\n  ...\n]',
    insightTitle: "Retrieved records, not generated citations",
    insight: "Paper titles, years and DOIs come from OpenAlex, not the LLM's memory. N and the record contents will vary; the trace intentionally uses placeholders."
  },
  {
    label: "Gemini answers",
    title: "One answer for the student",
    subtitle: "Gemini reads the returned data and prepares a human-readable response.",
    payload: '[GEMINI] Final response:\n\nHere are the papers returned by\nOpenAlex for your topic...\n\n[Paper titles and links go here]',
    insightTitle: "One student input ≠ one model API call",
    insight: "The student only entered the request once. The SDK may contact Gemini again internally after executing the tool, providing the function-call history and returned results."
  }
];

let s3CurrentStep = 0;

function s3Render() {
  const event = S3_TRACE[s3CurrentStep];

  document.querySelector("#s3-trace-count").textContent =
    String(s3CurrentStep + 1) + " / " + S3_TRACE.length;
  document.querySelector("#s3-trace-stage").textContent = event.label.toUpperCase();
  document.querySelector("#s3-trace-title").textContent = event.title;
  document.querySelector("#s3-trace-desc").textContent = event.subtitle;
  document.querySelector("#s3-trace-code").textContent = event.payload;
  document.querySelector("#s3-trace-insight-title").textContent = event.insightTitle;
  document.querySelector("#s3-trace-insight-text").textContent = event.insight;

  document.querySelectorAll("#s3-trace-track .s3-trace-stage").forEach((part, index) => {
    part.classList.toggle("active", index === s3CurrentStep);
    part.classList.toggle("complete", index < s3CurrentStep);
    part.setAttribute("aria-current", index === s3CurrentStep ? "step" : "false");
  });

  document.querySelector("#s3-prev").disabled = s3CurrentStep === 0;
  document.querySelector("#s3-next").textContent =
    s3CurrentStep === S3_TRACE.length - 1 ? "Restart ↻" : "Next step →";
}

document.querySelector("#s3-prev").addEventListener("click", () => {
  s3CurrentStep = Math.max(0, s3CurrentStep - 1);
  s3Render();
});
document.querySelector("#s3-next").addEventListener("click", () => {
  s3CurrentStep = (s3CurrentStep + 1) % S3_TRACE.length;
  s3Render();
});
document.querySelector("#s3-reset").addEventListener("click", () => {
  s3CurrentStep = 0;
  s3Render();
});

s3Render();
