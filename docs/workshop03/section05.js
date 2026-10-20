"use strict";

// SECTION 05 — Lightweight classroom RAG simulation, not a live Gemini request.
// Uses short excerpts from Pan et al. (2024); demo IDs are NOT real PDF chunks.
// Real 05_rag.py retrieves for nine fields and generates structured output once.
(() => {
  const lab = document.getElementById("s5-lab");
  if (!lab) return;

  const examples = {
    dataset: {
      question: "Which dataset is used?",
      chunk: "D01",
      page: 4,
      evidence: "Our audition dataset is comprised of 111 audition videos ... with a total length of 379 minutes.",
      answer: "Audition dataset (111 videos; 379 minutes)"
    },
    metrics: {
      question: "How is the method evaluated?",
      chunk: "D02",
      page: 8,
      evidence: "We evaluated each model’s predictions ... using accuracy, Jaccard similarity (IOU), gaze-on/off transition accuracy, and aversion instance ratio.",
      answer: "Accuracy, IoU, gaze-on/off transition accuracy, aversion instance ratio"
    },
    limitations: {
      question: "What do the authors identify as limitations?",
      chunk: "D03",
      page: 10,
      evidence: "We do not exploit any emotional or cognitive information in the input speech audio or transcript.",
      answer: "Does not automatically use emotional or cognitive cues from the audio or transcript"
    }
  };

  const fields = Object.keys(examples);
  let active = "dataset";
  let retrieved = false;
  const answers = new Set();

  const questionTitle = lab.querySelector("#s5-selected-question");
  const retrieveButton = lab.querySelector("#s5-retrieve");
  const generateButton = lab.querySelector("#s5-generate");
  const evidenceBox = lab.querySelector("#s5-evidence-result");
  const evidenceText = lab.querySelector("#s5-evidence-text");
  const evidenceSource = lab.querySelector("#s5-evidence-source");
  const answerCount = lab.querySelector("#s5-count");
  const resetButton = lab.querySelector("#s5-reset");

  function render() {
    const item = examples[active];
    questionTitle.textContent = item.question;

    lab.querySelectorAll("[data-s5-field]").forEach((button) => {
      const selected = button.dataset.s5Field === active;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });

    lab.querySelectorAll("[data-s5-chunk]").forEach((chunk) => {
      chunk.classList.toggle("retrieved", retrieved && chunk.dataset.s5Chunk === active);
    });

    retrieveButton.disabled = retrieved;
    retrieveButton.textContent = retrieved
      ? "✓ Relevant chunk found"
      : "1 · Retrieve evidence →";

    generateButton.disabled = !retrieved || answers.has(active);
    generateButton.textContent = answers.has(active)
      ? "✓ Added to table"
      : "2 · Generate answer →";

    evidenceBox.classList.toggle("has-evidence", retrieved);
    evidenceText.textContent = retrieved
      ? "“" + item.evidence + "”"
      : "Select a question, then retrieve its supporting chunk.";
    evidenceSource.textContent = retrieved
      ? "Example source: " + item.chunk + " · PDF page " + item.page
      : "Waiting for retrieval";

    fields.forEach((field) => {
      const row = lab.querySelector('[data-s5-row="' + field + '"]');
      row.classList.toggle("s5-row-active", field === active);
      row.classList.toggle("s5-row-filled", answers.has(field));
      lab.querySelector("#s5-answer-" + field).textContent =
        answers.has(field) ? examples[field].answer : "—";
    });
    answerCount.textContent = answers.size + " / 3 example fields filled";
  }

  lab.querySelectorAll("[data-s5-field]").forEach((button) => {
    button.addEventListener("click", () => {
      active = button.dataset.s5Field;
      retrieved = false;
      render();
    });
  });

  retrieveButton.addEventListener("click", () => {
    retrieved = true;
    render();
  });

  generateButton.addEventListener("click", () => {
    if (!retrieved) return;
    answers.add(active);
    render();
  });

  resetButton.addEventListener("click", () => {
    answers.clear();
    active = "dataset";
    retrieved = false;
    render();
  });

  render();
})();
