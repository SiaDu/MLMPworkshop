"use strict";

// Section 4 classroom illustration. NOT a live paper search.
const S4_CASES = {
  enough: [
    ["topic", "User Input", "Topic: AI facial animation. Target: 10 records. Maximum: 3 search rounds."],
    ["plan", "Structured SearchPlan", "Use Section 2's SearchPlan (or ask Gemini to generate one). Keep three queries and start_year."],
    ["search", "Round 1 — Function Calling", "The SDK executes the local search_papers() tool; at most 5 records are requested per round."],
    ["check", "Check and Deduplicate", "Illustrative outcome: 5 unique records pass the year and basic metadata checks."],
    ["decision", "Enough papers? NO", "5 / 10 unique records. Another search round is allowed."],
    ["revise", "Gemini revises the query", "Use the SearchPlan's alternatives to formulate a distinct academic search query."],
    ["search", "Round 2 — Search again", "The SDK calls search_papers() again and OpenAlex returns up to 5 more records."],
    ["check", "Check and Deduplicate", "Illustrative outcome: 10 / 10 unique records after two search rounds."],
    ["decision", "Enough papers? YES", "Target reached before the three-round limit. Stop further tool calls."],
    ["export", "Export papers.csv + search_log.json", "Save returned metadata and a search log. The student still reviews research relevance manually."]
  ],
  few: [
    ["topic", "User Input", "Topic: AI facial animation. Target: 10 records. Maximum: 3 search rounds."],
    ["plan", "Structured SearchPlan", "Reuse a matching SearchPlan from Section 2, including its publication-year filter."],
    ["search", "Round 1 — Function Calling", "Gemini requests search_papers() using the first plan query."],
    ["check", "Check and Deduplicate", "Illustrative outcome: only 4 unique records pass the basic metadata and year checks."],
    ["decision", "Enough papers? NO", "4 / 10 records. The agent has not reached the target; another round is permitted."],
    ["revise", "Gemini revises the query", "Use another direction from the plan and previous search history to formulate fresh keywords."],
    ["search", "Round 2 — Search again", "Python executes the next Gemini tool request and receives more OpenAlex records."],
    ["check", "Check and Deduplicate", "Illustrative outcome: 7 / 10 unique records in total. Duplicate records are not counted twice."],
    ["decision", "Still not enough", "7 / 10 records. There is one remaining search round."],
    ["revise", "Revise keywords once more", "Gemini proposes a different query, using the third SearchPlan suggestion as a seed."],
    ["search", "Round 3 — Last search", "Execute the final allowed OpenAlex request."],
    ["check", "Check final records", "Illustrative outcome: 9 / 10 unique records after year, metadata and duplicate checks."],
    ["decision", "Maximum rounds reached", "Still short of the target. Stop after round 3; never run an unlimited loop."],
    ["export", "Export partial CSV + search log", "Save the 9 records already found. The student can manually review relevance and adjust the research strategy."]
  ]
};

let s4Case = "enough";
let s4Index = 0;

function renderS4() {
  const steps = S4_CASES[s4Case];
  const [node, title, explanation] = steps[s4Index];

  document.querySelector("#s4-step").textContent =
    "STEP " + (s4Index + 1) + " / " + steps.length;
  document.querySelector("#s4-step-title").textContent = title;
  document.querySelector("#s4-step-desc").textContent = explanation;
  document.querySelector("#s4-prev").disabled = s4Index === 0;
  document.querySelector("#s4-next").textContent =
    s4Index === steps.length - 1 ? "Restart ↻" : "Next step →";

  document.querySelectorAll("[data-s4-node]").forEach((element) => {
    element.classList.toggle("active", element.dataset.s4Node === node);
    // The highlight marks the current stage, not a separate API request.
  });
  document.querySelectorAll("[data-s4-case]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.s4Case === s4Case));
  });

  document.querySelector("#s4-outcome").textContent =
    s4Case === "enough"
      ? "ENOUGH PAPERS → EXPORT"
      : "FEW PAPERS → REVISE OR STOP AT MAX ROUNDS";
}

document.querySelectorAll("[data-s4-case]").forEach((button) => {
  button.addEventListener("click", () => {
    s4Case = button.dataset.s4Case;
    s4Index = 0;
    renderS4();
  });
});
document.querySelector("#s4-prev").addEventListener("click", () => {
  s4Index = Math.max(0, s4Index - 1);
  renderS4();
});
document.querySelector("#s4-next").addEventListener("click", () => {
  s4Index = (s4Index + 1) % S4_CASES[s4Case].length;
  renderS4();
});

renderS4();
