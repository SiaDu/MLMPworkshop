"use strict";

const EXAMPLES = {
  text: {
    label: "Literature Research Agent",
    goal: "Find five relevant papers for an AI facial animation survey.",
    caption: "Choose a paper-search source, check results and save a reading list.",
    conditions: [
      { value: "sufficient", label: "Enough papers found" },
      { value: "sparse", label: "Few papers found" }
    ],
    tools: [
      { name: "search_openalex", desc: "Find papers with OpenAlex", icon: "⌕", via: "OpenAlex API" },
      { name: "search_semantic_scholar", desc: "Find papers with Semantic Scholar", icon: "⌕", via: "Semantic Scholar API" },
      { name: "search_arxiv", desc: "Find preprints with arXiv", icon: "⌕", via: "arXiv API" },
      { name: "check_paper_details", desc: "Check title, year and DOI", icon: "✓", via: "Metadata lookup" },
      { name: "export_csv", desc: "Save a paper list", icon: "⇩", via: "Local Python" }
    ]
  },

};

const QUIZ = [
  {
    question: "A script always searches once, filters results and saves CSV. What is it?",
    options: ["A fixed workflow", "An agent, because it uses an API"],
    correct: 0,
    explanation: "Correct: the application determines the sequence. API use alone does not make a system an agent."
  },
  {
    question: "Who executes search_papers() after an LLM requests the tool?",
    options: ["The LLM itself", "Application code / tool executor"],
    correct: 1,
    explanation: "The LLM requests the action; the application validates and executes the real function."
  },
  {
    question: "Must every result check be performed by an LLM?",
    options: ["Yes — the LLM should control everything", "No — code can validate counts and formats"],
    correct: 1,
    explanation: "Use deterministic checks where possible; the LLM can help with qualitative relevance."
  }
];

const $ = (selector) => document.querySelector(selector);
const currentCase = "text";
let condition = "sufficient";
let events = [];
let stepIndex = -1;
const responses = Array(QUIZ.length).fill(null);

function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function clear(el) { el.replaceChildren(); }

function addStep(container, number, label, detail) {
  const box = node("div", "step-item");
  box.append(node("span", "step-num", String(number).padStart(2, "0")));
  const textBox = node("div", "");
  textBox.append(document.createTextNode(label));
  if (detail) textBox.append(node("small", "", detail));
  box.append(textBox);
  container.append(box);
}

function outcome(container, title, description, tone) {
  container.className = "comparison-outcome " + (tone || "");
  clear(container);
  container.append(node("strong", "", title), node("span", "", description));
}

function comparisonState() {
  const workflow = $("#workflow-steps");
  const agent = $("#agent-steps");
  clear(workflow);
  clear(agent);

  const example = EXAMPLES.text;
  $("#scenario-goal").textContent = example.goal;
  $("#scenario-caption").textContent = example.caption;

  const picker = $("#scenario-condition");
  clear(picker);
  example.conditions.forEach(({value, label}) => {
    const option = node("option", "", label);
    option.value = value;
    picker.append(option);
  });
  picker.value = condition;

  addStep(workflow, 1, 'Run fixed query: "facial animation"', "Uses a predefined OpenAlex search");
  addStep(workflow, 2, "Filter by publication year", "A code-defined selection criterion");
  addStep(workflow, 3, "Export available records", "No adaptive search decision");

  addStep(agent, 1, "Choose OpenAlex", "LLM picks a paper-search source from the tool menu");
  if (condition === "sparse") {
    outcome($("#workflow-output"), "2 / 5 papers found", "This example follows one predefined search.", "warn");
    addStep(agent, 2, "Only two papers found", "The result does not meet the goal");
    addStep(agent, 3, "Choose Semantic Scholar", "The LLM can switch to another paper-search source");
    addStep(agent, 4, "Check paper details, then export", "The example agent reaches five papers");
    outcome($("#agent-output"), "5 / 5 papers found", "The example agent switches to another search source.", "good");
    $("#compare-takeaway").textContent =
      "A workflow follows developer-written rules. An agent can choose another search source based on the results.";
  } else {
    outcome($("#workflow-output"), "5 / 5 papers found", "The first search is enough.", "good");
    addStep(agent, 2, "Five papers found", "No extra search is needed");
    addStep(agent, 3, "Check paper details, then export", "The goal is met after one search");
    outcome($("#agent-output"), "5 / 5 papers found", "The example agent stops after the first search.", "good");
    $("#compare-takeaway").textContent =
      "Both find five papers when the first search returns enough results. When only two are found, the agent can choose new search keywords.";
  }
}

function action(tool, args, why, result, detail) {
  return [
    { phase: "choose", title: "Gemini chooses " + tool + "()", text: why, tool, data: { selected_tool: tool, note: "Simulated model choice" } },
    { phase: "request", title: "Tool request prepared", text: "Gemini chooses a tool and provides its inputs.", tool, data: { name: tool, arguments: args } },
    { phase: "execute", title: "Python runs the tool", text: "Python would check the inputs and run the selected function. This page is a simulation.", tool, data: { approved_tool: tool, implementation: EXAMPLES[currentCase].tools.find(t => t.name === tool).via, status: "simulated execution" } },
    { phase: "observe", title: "Tool returns results", text: detail, tool, data: result }
  ];
}

function buildTrace() {
  const result = [];
  result.push(...action("search_openalex", { query: "facial animation", limit: 5 },
    "The task requires academic research, so the example LLM chooses OpenAlex from three search sources.",
    condition === "sparse"
      ? { relevant_found: 2, sample_titles: ["Illustrative paper A", "Illustrative paper B"] }
      : { relevant_found: 5, metadata_verified: false },
    condition === "sparse"
      ? "Only two results meet the example relevance criteria. The goal is not yet met."
      : "Five paper records are available. Another search is unnecessary."));

  if (condition === "sparse") {
    result.push(...action("search_semantic_scholar", { query: "speech-driven 3D facial animation", limit: 5 },
      "Only two papers were found, so Gemini tries another source with new search keywords.",
      { newly_relevant: 3, total_relevant: 5 },
      "The illustrative Semantic Scholar search returns three additional papers."));
  }

  result.push(...action("check_paper_details", { paper_count: 5 },
    "The example LLM chooses a tool to check the paper details.",
    { checked: 5, valid_records: 5, note: "Illustrative metadata verification" },
    "The paper details have been checked. The papers have not been read."));

  result.push(...action("export_csv", { filename: "papers.csv", rows: 5 },
    "The goal is met, so the example LLM chooses export_csv().",
    { filename: "papers.csv", rows: 5, mode: "simulation only" },
    "The teaching trace reports an export. This page does not write an actual CSV."));

  result.push({
    phase: "finish",
    title: "Agent finishes",
    text: "The example agent has five paper records. A real student must still check sources and read the papers.",
    tool: null,
    data: { final_status: "done", output: "5 illustrative research records" }
  });
  return result;
}

function paintTools(selected) {
  const list = $("#tool-list");
  clear(list);
  EXAMPLES[currentCase].tools.forEach((tool, index) => {
    if (index === 0 || index === 3) {
      list.append(node("div", "tool-group-label", index === 0 ? "PAPER SEARCH — CHOOSE A SOURCE" : "OTHER ACTIONS"));
    }
    const item = node("div", "tool-item" + (selected === tool.name ? " selected" : ""));
    const icon = node("span", "tool-icon", tool.icon);
    icon.setAttribute("aria-hidden", "true");
    const detail = node("div");
    detail.append(node("strong", "", tool.name + "()"), node("small", "", tool.desc));
    item.append(icon, detail);
    list.append(item);
  });
  $("#tool-count").textContent = EXAMPLES[currentCase].tools.length + " TOOLS";
}

function renderTrace() {
  const ev = stepIndex >= 0 ? events[stepIndex] : null;
  paintTools(ev?.tool || null);
  $("#step-position").textContent = String(stepIndex + 1);
  $("#step-total").textContent = String(events.length);
  $("#loop-task-title").textContent = EXAMPLES[currentCase].label;
  $("#loop-back").disabled = stepIndex < 0;
  $("#loop-next").disabled = stepIndex === events.length - 1;
  $("#loop-next").textContent = stepIndex === events.length - 1 ? "Completed ✓" : "Next step →";
  $("#trace-status").textContent = ev ? (ev.phase === "finish" ? "COMPLETE" : ev.phase.toUpperCase()) : "READY";
  const body = $("#trace-body");
  clear(body);
  if (ev) {
    body.append(node("div", "trace-kicker", ev.phase === "finish" ? "FINAL OUTPUT" : "STEP " + (stepIndex + 1) + " · " + ev.phase.toUpperCase()));
    body.append(node("div", "trace-title", ev.title), node("div", "trace-copy", ev.text));
    $("#trace-json").textContent = JSON.stringify(ev.data, null, 2);
  } else {
    body.append(node("div", "trace-kicker", "START HERE"), node("div", "trace-title", "Which tool will Gemini choose?"), node("div", "trace-copy", "Look at the available tools. Click Next step to see the example choice."));
    $("#trace-json").textContent = "Available tools: " + EXAMPLES[currentCase].tools.map(t=>t.name).join(", ") + "\n\nNo tool selected yet.";
  }
  document.querySelectorAll("[data-phase]").forEach((el) => {
    el.classList.toggle("active", ev?.phase === el.dataset.phase);
  });
}

function resetTrace() {
  events = buildTrace();
  stepIndex = -1;
  renderTrace();
}

function setupQuiz() {
  const target=$("#quiz-grid");
  clear(target);
  QUIZ.forEach((q, i) => {
    const card = node("div", "quiz-card");
    const top=node("div","quiz-top");
    top.append(node("span","quiz-n",String(i+1).padStart(2,"0")), node("h3","",q.question));
    const options=node("div","quiz-options");
    q.options.forEach((answer,j)=>{
      const button=node("button","quiz-option",answer);
      button.type="button";
      button.addEventListener("click",()=>{responses[i]=j;drawQuiz();});
      options.append(button);
    });
    const feedback=node("div","quiz-feedback");
    card.append(top,options,feedback);
    target.append(card);
  });
  drawQuiz();
}

function drawQuiz() {
  document.querySelectorAll(".quiz-card").forEach((card,i)=>{
    const q=QUIZ[i], selected=responses[i], answered=selected!==null;
    card.querySelectorAll(".quiz-option").forEach((button,j)=>{
      button.className="quiz-option"+(selected===j?" chosen":"")+(answered&&selected===j?(j===q.correct?" correct":" wrong"):"");
      button.setAttribute("aria-pressed",String(selected===j));
    });
    const feedback=card.querySelector(".quiz-feedback");
    feedback.className="quiz-feedback"+(answered?(selected===q.correct?" pass":" fail"):"");
    feedback.textContent=answered?(selected===q.correct?"✓ ":"↳ ")+q.explanation:"";
  });
  const count=responses.filter(r=>r!==null).length;
  $("#quiz-score").textContent=count===QUIZ.length
    ? "Result: "+responses.filter((r,i)=>r===QUIZ[i].correct).length+" / "+QUIZ.length+" correct"
    : count+" of "+QUIZ.length+" answered";
}

function setupNavigation() {
  // The sidebar lists all seven major sections; it does not track progress.
  const sections = ["intro", "s2-start", "s3", "s4", "s5", "s6", "s7"];
  const links = [...document.querySelectorAll(".side-nav .nav-item")];

  const updateActiveSection = () => {
    let active = "intro";
    const topBoundary = window.scrollY + 170;

    for (const id of sections) {
      const element = document.getElementById(id);
      if (element && element.getBoundingClientRect().top + window.scrollY <= topBoundary) {
        active = id;
      }
    }

    for (const link of links) {
      const selected = link.getAttribute("href") === "#" + active;
      link.classList.toggle("active", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  };

  window.addEventListener("scroll", updateActiveSection, {passive: true});
  window.addEventListener("hashchange", updateActiveSection);
  updateActiveSection();
}

$("#scenario-condition").addEventListener("change", (event) => {
  condition = event.target.value;
  comparisonState();
  resetTrace();
});
$("#loop-next").addEventListener("click", () => {
  if (stepIndex < events.length - 1) {
    stepIndex++;
    renderTrace();
  }
});
$("#loop-back").addEventListener("click", () => {
  if (stepIndex >= 0) {
    stepIndex--;
    renderTrace();
  }
});
$("#loop-reset").addEventListener("click", resetTrace);
$("#quiz-retry").addEventListener("click", () => {
  responses.fill(null);
  drawQuiz();
});

comparisonState();
resetTrace();
setupQuiz();
setupNavigation();
