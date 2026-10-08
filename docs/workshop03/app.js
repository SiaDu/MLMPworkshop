"use strict";

const EXAMPLES = {
  text: {
    label: "Literature Research Agent",
    goal: "Find five relevant papers for an AI facial animation survey.",
    caption: "Search real academic metadata, inspect findings and export a reading list.",
    conditions: [
      { value: "sparse", label: "Few papers found" },
      { value: "sufficient", label: "Enough papers found" }
    ],
    tools: [
      { name: "search_papers", desc: "Query OpenAlex by keyword", icon: "⌕", via: "OpenAlex API" },
      { name: "get_paper_details", desc: "Fetch a specific record", icon: "▤", via: "OpenAlex API" },
      { name: "verify_doi", desc: "Cross-check identifiers", icon: "✓", via: "Metadata service" },
      { name: "export_csv", desc: "Write a paper table", icon: "⇩", via: "Local Python" },
      { name: "list_local_files", desc: "Inspect the working directory", icon: "▣", via: "Local Python" }
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
let condition = "sparse";
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

  addStep(workflow, 1, 'Run fixed query: "facial animation"', "Always calls search_papers()");
  addStep(workflow, 2, "Filter by publication year", "A code-defined selection criterion");
  addStep(workflow, 3, "Export available records", "No adaptive search decision");

  addStep(agent, 1, "Choose search_papers()", "LLM selects from five available tools");
  if (condition === "sparse") {
    outcome($("#workflow-output"), "2 / 5 relevant papers", "The fixed sequence ends with an incomplete list.", "warn");
    addStep(agent, 2, "Observe only two relevant records", "The result does not meet the goal");
    addStep(agent, 3, "Select search_papers() again", "LLM revises its search keywords");
    addStep(agent, 4, "Verify records, then export", "The example agent can reach five records");
    outcome($("#agent-output"), "5 / 5 relevant papers", "The illustrative agent adapts its query after feedback.", "good");
    $("#compare-takeaway").textContent =
      "Fixed workflow: predetermined operations. Agent: a model may select new actions based on the results.";
  } else {
    outcome($("#workflow-output"), "5 / 5 relevant papers", "The fixed workflow works when a single search is sufficient.", "good");
    addStep(agent, 2, "Observe five relevant records", "No extra search is necessary");
    addStep(agent, 3, "Verify records, then export", "LLM finishes without repeating the search");
    outcome($("#agent-output"), "5 / 5 relevant papers", "The illustrative agent skips unnecessary extra searches.", "good");
    $("#compare-takeaway").textContent =
      "Both approaches can succeed. Agent decisions are especially useful when the next step depends on uncertain results.";
  }
}

function action(tool, args, why, result, detail) {
  return [
    { phase: "choose", title: "LLM selects " + tool + "()", text: why, tool, data: { selected_tool: tool, note: "Simulated model choice" } },
    { phase: "request", title: "Tool request prepared", text: "The model proposes a tool name and structured arguments.", tool, data: { name: tool, arguments: args } },
    { phase: "execute", title: "Application executes the tool", text: "In a real system, Python would validate this request and run the selected function. This page replays a sample.", tool, data: { approved_tool: tool, implementation: EXAMPLES[currentCase].tools.find(t => t.name === tool).via, status: "simulated execution" } },
    { phase: "observe", title: "Tool result returned", text: detail, tool, data: result }
  ];
}

function buildTrace() {
  const result = [];
  result.push(...action("search_papers", { query: "facial animation", limit: 5 },
    "The task requires academic research, so the illustrative LLM selects search_papers() from the entire tool menu.",
    condition === "sparse"
      ? { relevant_found: 2, sample_titles: ["Illustrative paper A", "Illustrative paper B"] }
      : { relevant_found: 5, metadata_verified: false },
    condition === "sparse"
      ? "Only two results meet the example relevance criteria. The goal is not yet met."
      : "Five relevant records are available. Another keyword search is unnecessary."));

  if (condition === "sparse") {
    result.push(...action("search_papers", { query: "speech-driven 3D facial animation", limit: 5 },
      "The example LLM observes insufficient results and independently selects search_papers() again with refined keywords.",
      { newly_relevant: 3, total_relevant: 5 },
      "The illustrative search returns three additional relevant records."));
  }

  result.push(...action("verify_doi", { paper_count: 5 },
    "The example LLM requests a metadata-checking tool before completing the task.",
    { checked: 5, valid_records: 5, note: "Illustrative metadata verification" },
    "The sample metadata check succeeds. The article contents have not been verified."));

  result.push(...action("export_csv", { filename: "papers.csv", rows: 5 },
    "The goal is met, so the illustrative LLM selects export_csv().",
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
  EXAMPLES[currentCase].tools.forEach((tool) => {
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
    body.append(node("div", "trace-kicker", "START HERE"), node("div", "trace-title", "Which tool will the LLM choose?"), node("div", "trace-copy", "Look at the entire tool menu on the left. Select Next step to reveal the first illustrative model decision."));
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
  const visited=new Set();
  const sections=["intro","comparison","anatomy","loop","quiz"];
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) {
        visited.add(entry.target.id);
        const percent=Math.round(visited.size/sections.length*100);
        $("#progress-number").textContent=percent+"%";
        $("#progress-bar").style.width=percent+"%";
        document.querySelectorAll(".nav-item").forEach(a=>a.classList.toggle("active", a.getAttribute("href")==="#"+entry.target.id));
      }
    });
  },{rootMargin:"-20% 0px -62% 0px",threshold:0});
  sections.forEach(id=>observer.observe(document.getElementById(id)));
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
