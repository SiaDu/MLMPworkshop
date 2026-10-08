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

// A tiny deterministic JSON validation demonstration.
// The real Pydantic validation happens in 02_structured_output.py.
const JSON_SAMPLES = {
  correct: '{"topic":"AI facial animation","search_queries":["speech-driven facial animation","neural facial motion synthesis","controllable facial performance generation"],"start_year":2022}',
  wrong_type: '{"topic":"AI facial animation","search_queries":"speech-driven facial animation","start_year":2022}',
  wrong_count: '{"topic":"AI facial animation","search_queries":["speech-driven facial animation"],"start_year":2022}'
};

function validateExample() {
  const selected = document.querySelector("#s2-validation-sample").value;
  const text = JSON_SAMPLES[selected];
  const code = document.querySelector("#s2-validation-json");
  const msg = document.querySelector("#s2-validation-result");
  code.textContent = JSON.stringify(JSON.parse(text), null, 2);
  msg.textContent = "Select “Validate example” to check the schema and the additional business rules.";
  msg.style.borderColor = "";
  msg.style.color = "";

  document.querySelector("#s2-validate").onclick = () => {
    const data = JSON.parse(text);
    const schemaPass = typeof data.topic === "string"
      && Array.isArray(data.search_queries)
      && data.search_queries.every(q => typeof q === "string")
      && Number.isInteger(data.start_year);
    const countPass = schemaPass && data.search_queries.length === 3;
    if (!schemaPass) {
      msg.textContent = "✕ Schema check failed: search_queries must be a list of strings, not a single string.";
      msg.style.borderColor = "#c47780";
    } else if (!countPass) {
      msg.textContent = "✕ Schema shape passes, but the extra rule fails: exactly 3 search queries are required.";
      msg.style.borderColor = "#c4a46b";
    } else {
      msg.textContent = "✓ Schema and count checks pass. This still does not verify whether the queries are relevant.";
      msg.style.borderColor = "#66ad9f";
    }
  };
}

document.querySelector("#s2-validation-sample").addEventListener("change", validateExample);
validateExample();
