"use strict";

// Section 7: local interactive teaching simulations only.
// No Gemini calls, HTTP requests, filesystem writes, or PDF analysis occur here.
(() => {
  const section = document.getElementById("s7");
  if (!section) return;

  const cases = [
    {
      label: "Full Research",
      request: "Find 2 papers about speech-driven facial animation since 2022, download available PDFs and add them to the method comparison table.",
      steps: [
        { name: "search_papers()", action: "Search OpenAlex for real bibliographic metadata.", reason: "The student needs paper records, so start with a metadata search." },
        { name: "download_open_pdfs()", action: "Attempt to obtain permitted full-text PDFs.", reason: "Search metadata is not full text. Some PDFs may be unavailable." },
        { name: "analyse_latest_downloads()", action: "Run RAG on available PDFs from this download batch.", reason: "Analyse this batch, not unrelated PDFs from earlier sessions." },
        { name: "show_method_table()", action: "Read the cumulative method comparison table.", reason: "Report the actual table rows. Found papers and analysed PDFs may have different counts." }
      ],
      takeaway: "Search → Download → Analyse → Check. The LLM can choose another tool after seeing each result."
    },
    {
      label: "One Manual PDF",
      request: "I added TOG2024Pan.pdf to papers/. Analyse only this PDF and add it to the table.",
      steps: [
        { name: "analyse_pdf()", action: "Read the named local PDF and run the Section 5 RAG pipeline.", reason: "The user already has a file, so search and download are unnecessary." },
        { name: "show_method_table()", action: "Check whether the new row was added or was already present.", reason: "The Agent should report an observed file/table result, not assume success." }
      ],
      takeaway: "Start at RAG. Search and Web Scraping can be skipped."
    },
    {
      label: "Pending PDFs",
      request: "Analyse all unprocessed PDFs in my papers folder and update the method table.",
      steps: [
        { name: "analyse_unprocessed_pdfs()", action: "Scan papers/, skip previously analysed files and run RAG on pending PDFs.", reason: "Saved file hashes help Python avoid repeating completed work." },
        { name: "show_method_table()", action: "Check the updated cumulative table.", reason: "Existing rows are preserved; only newly completed analyses add rows." }
      ],
      takeaway: "The Agent can continue earlier work without starting a new search."
    },
    {
      label: "Download Failures",
      request: "Show the papers that failed to download and their manual links.",
      steps: [
        { name: "show_download_failures()", action: "Read failed entries and manual URLs from pdf_manifest.csv.", reason: "The user asked for a report, not another download attempt." }
      ],
      takeaway: "Some requests only need one read-only tool. No Gemini-generated paper details are required."
    }
  ];

  const tabs = [...section.querySelectorAll("[data-s7-case]")];
  const requestText = section.querySelector("#s7-case-prompt");
  const path = section.querySelector("#s7-tool-path");
  const counter = section.querySelector("#s7-route-count");
  const why = section.querySelector("#s7-route-why");
  const takeaway = section.querySelector("#s7-route-takeaway");
  const prev = section.querySelector("#s7-route-prev");
  const next = section.querySelector("#s7-route-next");
  const reset = section.querySelector("#s7-route-reset");
  let selected = 0;
  let stage = 0;

  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function renderRoute() {
    const scenario = cases[selected];
    tabs.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === selected));
    });
    requestText.textContent = scenario.request;
    counter.textContent = "TOOL " + (stage + 1) + " / " + scenario.steps.length;
    prev.disabled = stage === 0;
    next.disabled = stage === scenario.steps.length - 1;
    next.textContent = next.disabled ? "Final tool reached ✓" : "Next tool →";

    path.replaceChildren();
    scenario.steps.forEach((step, index) => {
      if (index > 0) {
        path.append(make("div", "s7-tool-arrow", "↓"));
      }
      const card = make("div", "s7-tool-step" + (index === stage ? " s7-tool-active" : "") +
        (index > stage ? " s7-tool-future" : ""));
      const no = make("span", "s7-tool-n", String(index + 1).padStart(2, "0"));
      const body = make("div", "s7-tool-detail");
      body.append(make("strong", "", step.name), make("small", "", step.action));
      card.append(no, body);
      path.append(card);
    });

    why.textContent = scenario.steps[stage].reason;
    takeaway.textContent = scenario.takeaway;
  }

  function selectCase(index) {
    selected = index;
    stage = 0;
    renderRoute();
  }

  tabs.forEach((button, index) => {
    button.addEventListener("click", () => selectCase(index));
  });
  prev.addEventListener("click", () => {
    if (stage > 0) { stage -= 1; renderRoute(); }
  });
  next.addEventListener("click", () => {
    if (stage < cases[selected].steps.length - 1) { stage += 1; renderRoute(); }
  });
  reset.addEventListener("click", () => selectCase(selected));

  // Local state-management demonstration. Values below are explicitly simulated.
  const add = section.querySelector("#s7-state-add");
  const analyse = section.querySelector("#s7-state-analyse");
  const replay = section.querySelector("#s7-state-replay");
  const restart = section.querySelector("#s7-state-reset");
  const pdfCount = section.querySelector("#s7-state-pdfs");
  const pendingCount = section.querySelector("#s7-state-pending");
  const rowCount = section.querySelector("#s7-state-rows");
  const status = section.querySelector("#s7-state-message");
  const newFile = section.querySelector("#s7-state-new-file");
  const newRow = section.querySelector("#s7-state-new-row");
  const activity = section.querySelector("#s7-state-activity");
  let state = 0; // 0: original; 1: new pending PDF; 2: analysed; 3: re-run skipped.

  function renderState() {
    const added = state >= 1;
    const done = state >= 2;
    pdfCount.textContent = String(added ? 4 : 3);
    pendingCount.textContent = String(state === 1 ? 1 : 0);
    rowCount.textContent = String(done ? 4 : 3);
    newFile.hidden = !added;
    newRow.hidden = !done;
    add.disabled = added;
    analyse.disabled = state !== 1;
    replay.disabled = !done;
    activity.classList.toggle("s7-has-pending", state === 1);
    activity.classList.toggle("s7-completed", done);

    const messages = [
      "Start: 3 local PDFs have already been analysed. The comparison table has 3 rows.",
      "PDF added: TOG2024Pan.pdf is in papers/, but no new table row exists yet. One PDF is pending.",
      "ANALYSED: RAG completed for TOG2024Pan.pdf. Python recorded its SHA-256 and appended one row; all 3 existing rows remain unchanged.",
      "ALREADY_ANALYSED: the PDF hash is unchanged. The Agent skips RAG and keeps the same 4 table rows."
    ];
    status.textContent = messages[state];
  }
  add.addEventListener("click", () => { state = 1; renderState(); });
  analyse.addEventListener("click", () => { state = 2; renderState(); });
  replay.addEventListener("click", () => { state = 3; renderState(); });
  restart.addEventListener("click", () => { state = 0; renderState(); });

  renderRoute();
  renderState();
})();
