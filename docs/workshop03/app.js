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
  image: {
    label: "Storyboard Image Agent",
    goal: "Make a storyboard frame easier to read.",
    caption: "Inspect a scene, select image-editing tools and examine the result.",
    conditions: [
      { value: "dark", label: "The frame is too dark" },
      { value: "offcentre", label: "The subject is off-centre" }
    ],
    tools: [
      { name: "inspect_frame", desc: "Measure scene characteristics", icon: "◉", via: "Image analysis code" },
      { name: "adjust_brightness", desc: "Change image brightness", icon: "☼", via: "Image-processing code" },
      { name: "adjust_contrast", desc: "Change image contrast", icon: "◐", via: "Image-processing code" },
      { name: "crop_to_subject", desc: "Adjust composition", icon: "⌗", via: "Image-processing code" },
      { name: "export_image", desc: "Save the edited frame", icon: "⇩", via: "Local Python" }
    ]
  }
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
let currentCase = "text";
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
  const work = $("#workflow-steps");
  const agent = $("#agent-steps");
  clear(work); clear(agent);
  const source = EXAMPLES[currentCase];
  $("#scenario-goal").textContent = source.goal;
  $("#scenario-caption").textContent = source.caption;
  const picker = $("#scenario-condition");
  clear(picker);
  source.conditions.forEach((entry) => {
    const o = node("option", "", entry.label);
    o.value = entry.value;
    picker.append(o);
  });
  picker.value = condition;

  const wfOut = $("#workflow-output"), agOut = $("#agent-output");
  if (currentCase === "text") {
    addStep(work, 1, 'Run a fixed query: "facial animation"', "Always uses search_papers()");
    addStep(work, 2, "Filter by publication year", "Code-defined selection criteria");
    addStep(work, 3, "Export whatever remains", "No dynamic query revision");
    if (condition === "sparse") {
      outcome(wfOut, "2 / 5 papers", "The fixed sequence finishes with too few results.", "warn");
      addStep(agent, 1, "Choose search_papers()", "Model selects from 5 available tools");
      addStep(agent, 2, "Evaluate: only 2 relevant papers", "Results do not meet the goal");
      addStep(agent, 3, "Search again with refined keywords", "Model chooses search_papers() a second time");
      addStep(agent, 4, "Check and export 5 papers", "Verify metadata and finish");
      outcome(agOut, "5 / 5 papers", "The illustrated agent adapts the query and reaches the goal.", "good");
    } else {
      outcome(wfOut, "5 / 5 papers", "The fixed process works well when one search is enough.", "good");
      addStep(agent, 1, "Choose search_papers()", "Model selects from 5 available tools");
      addStep(agent, 2, "Evaluate: 5 relevant papers found", "No need to search again");
      addStep(agent, 3, "Verify records and export", "Model finishes after the checks");
      outcome(agOut, "5 / 5 papers", "The illustrated agent skips unnecessary extra searching.", "good");
    }
    $("#comparison-visual").hidden = true;
    $("#compare-takeaway").textContent = condition === "sparse"
      ? "The workflow follows its fixed sequence. The agent may adapt when the first search is insufficient."
      : "Both can succeed. An agent is useful when the correct next step cannot be fully predetermined.";
  } else {
    addStep(work, 1, "Increase brightness", "Always applies the same multiplier");
    addStep(work, 2, "Apply a centred crop", "No inspection of subject position");
    addStep(work, 3, "Export the frame", "Fixed image-processing sequence");
    addStep(agent, 1, "Choose inspect_frame()", "Model requests an image-analysis tool");
    if (condition === "dark") {
      addStep(agent, 2, "Observe: insufficient brightness", "Composition is already acceptable");
      addStep(agent, 3, "Choose adjust_brightness()", "Target the observed issue only");
      addStep(agent, 4, "Inspect and export", "Check the adjusted image");
      outcome(wfOut, "Usable, but unnecessarily cropped", "Fixed edits may introduce unnecessary changes.", "warn");
      outcome(agOut, "Brightness adjusted", "The illustrated agent targets the detected problem.", "good");
    } else {
      addStep(agent, 2, "Observe: subject near frame edge", "Brightness is already acceptable");
      addStep(agent, 3, "Choose crop_to_subject()", "Adjust composition instead of brightness");
      addStep(agent, 4, "Inspect and export", "Check the subject framing");
      outcome(wfOut, "Brighter, but still poorly framed", "The prescribed brightness step does not address the main issue.", "warn");
      outcome(agOut, "Composition improved", "The illustrated agent targets the detected problem.", "good");
    }
    $("#comparison-visual").hidden = false;
    updateScene();
    $("#compare-takeaway").textContent = "Both workflows and agents use image tools. Here the agent selects an edit based on inspection.";
  }
}

function updateScene() {
  const variants = {
    dark: {
      original: {filter:"brightness(.47) contrast(1.06)", transform:"none", desc:"Underexposed input frame"},
      workflow: {filter:"brightness(1.15) contrast(1.04)", transform:"scale(1.17)", desc:"Fixed brightness + central crop"},
      agent: {filter:"brightness(1.26) contrast(1.04)", transform:"none", desc:"Brightness selected after inspection"}
    },
    offcentre: {
      original: {filter:"brightness(1)", transform:"translateX(-16%) scale(1.04)", desc:"Robot is close to the left edge"},
      workflow: {filter:"brightness(1.48)", transform:"translateX(-16%) scale(1.19)", desc:"Unneeded brightening; centre crop"},
      agent: {filter:"brightness(1)", transform:"translateX(8%) scale(1.12)", desc:"Framing adjusted around the robot"}
    }
  };
  const scene = variants[condition] || variants.dark;
  document.querySelectorAll(".art-holder").forEach((holder) => {
    clear(holder);
    const variant = holder.dataset.variant;
    const art = $("#scene-template").content.firstElementChild.cloneNode(true);
    art.style.filter = scene[variant].filter;
    art.style.transform = scene[variant].transform;
    holder.append(art);
  });
  $("#image-original-caption").textContent = scene.original.desc;
  $("#image-workflow-caption").textContent = scene.workflow.desc;
  $("#image-agent-caption").textContent = scene.agent.desc;
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
  if (currentCase === "text") {
    result.push(...action("search_papers", { query: "facial animation", limit: 5 },
      "The user needs papers, so search_papers() is the most useful first tool.",
      condition === "sparse" ? { relevant_found: 2, sample_titles: ["Example result A", "Example result B"] } : { relevant_found: 5, verified: false },
      condition === "sparse" ? "Only two results meet the example relevance criteria. The goal is not yet met." : "Five relevant records are available. An extra keyword search is not necessary."));
    if (condition === "sparse") {
      result.push(...action("search_papers", { query: "speech-driven 3D facial animation", limit: 5 },
        "After observing too few papers, the model selects the search tool again with revised keywords.",
        { newly_relevant: 3, total_relevant: 5 }, "Three additional relevant records are found in the illustrative dataset."));
    }
    result.push(...action("verify_doi", { paper_count: 5 },
      "Before finishing, the model requests the metadata-checking tool.",
      { checked: 5, valid_records: 5, note: "Illustrative metadata check" }, "Basic identifiers are consistent in this sample. Full-paper claims have not been checked."));
    result.push(...action("export_csv", { filename: "papers.csv", rows: 5 },
      "The goal has been reached; the agent requests export_csv() to save the reading list.",
      { filename: "papers.csv", rows: 5, mode: "simulation only" }, "The sample export succeeds in this teaching trace; this page does not write a local CSV."));
    result.push({ phase: "finish", title: "Agent finishes", text: "The agent has an example set of five paper records. A real student must still verify sources and read the papers.", tool: null, data: { final_status: "done", output: "5 illustrative paper records" } });
  } else {
    result.push(...action("inspect_frame", { image_id: "storyboard_03" },
      "Before editing, the model selects an inspection tool to find the issue.",
      condition === "dark" ? { brightness: "low", subject_position: "acceptable" } : { brightness: "acceptable", subject_position: "left edge" },
      condition === "dark" ? "The sample inspection says the frame is too dark, not badly framed." : "The sample inspection says the subject is off-centre, not underexposed."));
    if (condition === "dark") {
      result.push(...action("adjust_brightness", { factor: 1.5 },
        "The model chooses brightness adjustment rather than a crop or contrast operation.",
        { applied: "brightness", factor: 1.5 }, "The illustrated output is brighter; composition is preserved."));
    } else {
      result.push(...action("crop_to_subject", { subject: "robot", preserve_aspect: "16:9" },
        "The model chooses composition adjustment rather than unnecessary brightening.",
        { applied: "crop and reframe", subject: "robot" }, "The illustrated output moves the robot away from the frame edge."));
    }
    result.push(...action("inspect_frame", { image_id: "edited_storyboard_03" },
      "The model selects inspect_frame() again to assess the processed frame.",
      { check: "improved for the given goal", note: "Simulated measurement" }, "The sample verification reports an improvement. In practice, independent checks still matter."));
    result.push(...action("export_image", { filename: "storyboard_03_edited.png" },
      "The requested edit appears complete, so the model chooses export_image().",
      { filename: "storyboard_03_edited.png", mode: "simulation only" }, "The teaching trace reports an export; no PNG is written by this site."));
    result.push({ phase: "finish", title: "Agent finishes", text: "The agent completes the illustrative image-editing loop after inspection, editing and checking.", tool: null, data: { final_status: "done", output: "edited storyboard frame (illustration)" } });
  }
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

function setCase(which) {
  currentCase = which;
  condition = EXAMPLES[which].conditions[0].value;
  document.querySelectorAll("[data-case]").forEach(btn=>{
    const selected = btn.dataset.case === which;
    btn.classList.toggle("is-selected", selected);
    btn.setAttribute("aria-pressed", String(selected));
  });
  comparisonState();
  resetTrace();
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

document.querySelectorAll("[data-case]").forEach(btn=>btn.addEventListener("click",()=>setCase(btn.dataset.case)));
$("#scenario-condition").addEventListener("change",(ev)=>{condition=ev.target.value;comparisonState();resetTrace();});
$("#try-other").addEventListener("click",()=>setCase(currentCase==="text"?"image":"text"));
$("#loop-next").addEventListener("click",()=>{if(stepIndex<events.length-1){stepIndex++;renderTrace();}});
$("#loop-back").addEventListener("click",()=>{if(stepIndex>=0){stepIndex--;renderTrace();}});
$("#loop-reset").addEventListener("click",resetTrace);
$("#quiz-retry").addEventListener("click",()=>{responses.fill(null);drawQuiz();});
setCase("text");
setupQuiz();
setupNavigation();
