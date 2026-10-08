"use strict";

// Section 2 is a locally rendered comparison and classroom helper.
// It never sends an API request or receives the student's API key.

const PREVIEW = {
  natural: {
    text: "Here are three academic search suggestions for AI facial animation:\n\n1. Speech-driven facial animation\n2. Neural facial motion synthesis\n3. Controllable facial performance generation",
    title: "Human-readable, but format may vary",
    explanation: "A model could answer with bullets, paragraphs or numbered lists. Your Python code cannot safely assume the same format every time.",
    example: "response.text"
  },
  json: {
    text: JSON.stringify({
      topic: "AI facial animation",
      search_queries: [
        "speech-driven facial animation",
        "neural facial motion synthesis",
        "controllable facial performance generation"
      ],
      start_year: 2022
    }, null, 2),
    title: "Structured fields are easier to use",
    explanation: "The response follows a specified JSON Schema. Pydantic checks its shape and Python can access individual fields. The research content still needs evaluation.",
    example: "plan.search_queries[0]"
  }
};

function showPreview(which) {
  const current = PREVIEW[which];
  document.querySelector("#s2-example-response").textContent = current.text;
  document.querySelector("#s2-example-title").textContent = current.title;
  document.querySelector("#s2-example-detail").textContent = current.explanation;
  document.querySelector("#s2-example-field").textContent = current.example;
  document.querySelectorAll("[data-s2-preview]").forEach((button) => {
    const selected = button.dataset.s2Preview === which;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}

document.querySelectorAll("[data-s2-preview]").forEach(button => {
  button.addEventListener("click", () => showPreview(button.dataset.s2Preview));
});
showPreview("natural");

// Copy the exact visible code, including comments, so students can paste
// it directly into VS Code or the terminal.
document.querySelectorAll("[data-s2-copy]").forEach(button => {
  button.addEventListener("click", async () => {
    const code = button.closest(".s2-code")?.querySelector("code")?.textContent;
    if (!code) return;

    // Fallback works in less-permissive browsers or local file previews.
    const copyViaSelection = (value) => {
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.focus();
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    };

    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        copied = true;
      } else {
        copied = copyViaSelection(code);
      }
    } catch {
      copied = copyViaSelection(code);
    }

    const old = button.textContent;
    button.textContent = copied ? "Copied ✓" : "Select & copy";
    if (!copied) {
      const selection = window.getSelection();
      const codeElement = button.closest(".s2-code")?.querySelector("code");
      if (selection && codeElement) {
        selection.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(codeElement);
        selection.addRange(range);
      }
    }
    window.setTimeout(() => { button.textContent = old; }, 1800);
  });
});

// Classroom examples: schema and rule checks run in JavaScript.
// Content relevance is deliberately an instructor-defined judgment for each
// example. It is NOT calculated by Pydantic or the browser.
const JSON_SAMPLES = {
  correct: {
    value: {
      topic: "AI facial animation",
      search_queries: [
        "speech-driven facial animation",
        "neural facial motion synthesis",
        "controllable facial performance generation"
      ],
      start_year: 2022
    },
    relevant: true,
    explanation: "All three searches relate to AI facial animation. The relevance verdict here is a teaching example, not an automated research evaluation."
  },
  wrong_type: {
    value: {
      topic: "AI facial animation",
      search_queries: "speech-driven facial animation",
      start_year: 2022
    },
    relevant: null
  },
  wrong_count: {
    value: {
      topic: "AI facial animation",
      search_queries: ["speech-driven facial animation"],
      start_year: 2022
    },
    relevant: null
  },
  irrelevant: {
    value: {
      topic: "AI facial animation",
      search_queries: [
        "pizza recipes",
        "football results",
        "weather forecast"
      ],
      start_year: 2022
    },
    relevant: false,
    explanation: "All the fields and the three-query rule pass, but the keywords have nothing to do with AI facial animation. The relevance verdict is predefined for this teaching example."
  }
};

function setValidationStatus(id, label, outcome) {
  const element = document.querySelector(id);
  element.textContent = label;
  element.className = "s2-status s2-status-" + outcome;
}

function validateExample() {
  const example = JSON_SAMPLES[document.querySelector("#s2-validation-sample").value];
  document.querySelector("#s2-validation-json").textContent =
    JSON.stringify(example.value, null, 2);

  const explanation = document.querySelector("#s2-validation-result");
  explanation.textContent = "Select ‘Run validation checks’ to see which checks pass.";
  explanation.style.borderColor = "";
  ["#s2-schema-status", "#s2-rule-status", "#s2-content-status"].forEach((id) => {
    setValidationStatus(id, "NOT RUN", "pending");
  });

  document.querySelector("#s2-validate").onclick = () => {
    const data = example.value;

    // 1. Schema Validation: structural fields and their data types.
    const schemaPass = typeof data.topic === "string"
      && Array.isArray(data.search_queries)
      && data.search_queries.every((query) => typeof query === "string")
      && Number.isInteger(data.start_year);

    setValidationStatus(
      "#s2-schema-status",
      schemaPass ? "✓ PASS" : "✕ FAIL",
      schemaPass ? "pass" : "fail"
    );

    if (!schemaPass) {
      setValidationStatus("#s2-rule-status", "— NOT CHECKED", "skipped");
      setValidationStatus("#s2-content-status", "— NOT CHECKED", "skipped");
      explanation.textContent = "Schema Validation failed: search_queries should be a list of strings, but the model returned a single string. Later checks are skipped.";
      return;
    }

    // 2. Additional Rule Validation: exactly three queries.
    const rulePass = data.search_queries.length === 3;
    setValidationStatus(
      "#s2-rule-status",
      rulePass ? "✓ PASS" : "✕ FAIL",
      rulePass ? "pass" : "fail"
    );

    if (!rulePass) {
      setValidationStatus("#s2-content-status", "— NOT CHECKED", "skipped");
      explanation.textContent = "Schema Validation passed, but Rule Validation failed: we require exactly three search queries. Content is not checked yet.";
      return;
    }

    // 3. Content Validation is an annotated example, not automated judging.
    setValidationStatus(
      "#s2-content-status",
      example.relevant ? "✓ PASS (EXAMPLE)" : "✕ FAIL (EXAMPLE)",
      example.relevant ? "pass" : "fail"
    );
    explanation.textContent = example.explanation;
  };
}

document.querySelector("#s2-validation-sample").addEventListener("change", validateExample);
validateExample();
