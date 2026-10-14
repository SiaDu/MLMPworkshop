"use strict";

// Section 3: illustrative function-calling trace.
// This website never makes a live Gemini/OpenAlex request. Students use the
// supplied Python scripts to see real tool calls and real paper metadata.

const S3_TRACE = [
  {
    label: "User instruction",
    title: "One user instruction",
    subtitle: "The Python program sends the instruction to Gemini and tells it which tool is available.",
    payload: 'Find 5 academic papers about\nAI facial animation.',
    insightTitle: "Who made the request?",
    insight: "The user asks for five papers about AI facial animation. Gemini can choose the search_papers() function. No search has happened yet."
  },
  {
    label: "Gemini chooses",
    title: "Gemini chooses a tool",
    subtitle: "Gemini chooses a tool and its inputs, such as the search keywords and paper count.",
    payload: '{\n  "name": "search_papers",\n  "args": {\n    "query": "facial animation",\n    "limit": 5\n  }\n}',
    insightTitle: "The model did NOT search OpenAlex",
    insight: "Gemini has chosen the tool, but Python has not run it yet. The keyword example may be different in a real run."
  },
  {
    label: "Python executes",
    title: "Python runs the function",
    subtitle: "The SDK runs the Python function with the inputs chosen by Gemini.",
    payload: '[GEMINI → PYTHON] Requested tool:\nsearch_papers\n\n[ARGS] query=\'facial animation\', limit=5\n\n[PYTHON] Calling OpenAlex...',
    insightTitle: "SDK dispatches; Python executes",
    insight: "The SDK runs search_papers(). Python then calls the OpenAlex API to find paper records."
  },
  {
    label: "Tool response",
    title: "OpenAlex returns papers",
    subtitle: "OpenAlex returns a list of paper records. The SDK sends the tool result back to Gemini.",
    payload: '[TOOL RESULT] Retrieved N records.\n\n[\n  {\n    "title": "<title from OpenAlex>",\n    "year": 2024,\n    "doi": "<DOI or null>"\n  },\n  ...\n]',
    insightTitle: "The paper information comes from OpenAlex",
    insight: "Titles, years and DOIs come from OpenAlex, not Gemini's memory. These are example records, not a live search."
  },
  {
    label: "Gemini answers",
    title: "Gemini answers",
    subtitle: "Gemini reads the returned data and prepares a human-readable response.",
    payload: '[GEMINI] Final response:\n\nHere are the papers returned by\nOpenAlex for your topic...\n\n[Paper titles and links go here]',
    insightTitle: "One student input ≠ one model API call",
    insight: "You enter the instruction once. The SDK may call Gemini again to send the tool results and receive the final answer."
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
