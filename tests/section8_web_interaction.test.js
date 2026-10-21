"use strict";
// Standalone offline regression test for the Section 8 terminology quiz.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const code = fs.readFileSync(
  path.join(__dirname, "../docs/workshop03/section08.js"), "utf8"
);

class Element {
  constructor() {
    this.textContent = "";
    this.hidden = false;
    this.disabled = false;
    this.type = "";
    this.style = {};
    this.children = [];
    this.attributes = {};
    this.events = {};
    this.classes = new Set();
    this.classList = {
      add: name => this.classes.add(name),
      remove: name => this.classes.delete(name),
      contains: name => this.classes.has(name),
    };
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = [...children]; }
  addEventListener(name, callback) { this.events[name] = callback; }
  click() {
    assert.equal(typeof this.events.click, "function");
    if (!this.disabled) this.events.click();
  }
}

const names = [
  "s8-choices", "s8-question-counter", "s8-quiz-progress",
  "s8-question", "s8-feedback", "s8-next", "s8-result",
  "s8-question-panel", "s8-restart", "s8-score",
  "s8-progress-fill", "s8-total",
];
const entries = Object.fromEntries(names.map(name => [name, new Element()]));
const section = { querySelector: selector => entries[selector.slice(1)] || null };
const document = {
  getElementById: id => id === "s8" ? section : null,
  createElement: () => new Element(),
};
vm.runInNewContext(code, { document, console }, { filename: "section08.js" });

assert.equal(entries["s8-total"].textContent, "7");
assert.equal(entries["s8-next"].disabled, true);
assert.match(entries["s8-question"].textContent, /stateful workflow/);
assert.equal(entries["s8-choices"].children.length, 3);

// The first question tests incorrect answers and the right-answer reveal.
entries["s8-choices"].children[0].click();
assert.equal(entries["s8-feedback"].hidden, false);
assert.match(entries["s8-feedback"].textContent, /^$/); // children contain feedback
assert.equal(entries["s8-choices"].children[0].classes.has("s8-choice-wrong"), true);
assert.equal(entries["s8-choices"].children[1].classes.has("s8-choice-correct"), true);
entries["s8-next"].click();
assert.match(entries["s8-question"].textContent, /external services/);

// Questions 2–7 are answered correctly, yielding 6/7 total.
for (let question = 1; question < 7; question += 1) {
  const answer = 0;
  assert.equal(entries["s8-question-counter"].textContent, "QUESTION " + (question + 1) + " / 7");
  assert.equal(entries["s8-next"].disabled, true);
  entries["s8-choices"].children[answer].click();
  assert.equal(entries["s8-next"].disabled, false);
  assert.equal(entries["s8-choices"].children[answer].attributes["aria-pressed"], "true");
  entries["s8-next"].click();
}
assert.equal(entries["s8-question-panel"].hidden, true);
assert.equal(entries["s8-result"].hidden, false);
assert.equal(entries["s8-score"].textContent, "6 / 7");
assert.equal(entries["s8-progress-fill"].style.width, "100%");

// Restart fully clears score and restores the initial question.
entries["s8-restart"].click();
assert.equal(entries["s8-result"].hidden, true);
assert.equal(entries["s8-question-panel"].hidden, false);
assert.equal(entries["s8-next"].disabled, true);
assert.match(entries["s8-question"].textContent, /stateful workflow/);
assert.equal(entries["s8-feedback"].hidden, true);
assert.equal(entries["s8-choices"].children[0].classes.has("s8-choice-wrong"), false);
console.log("Section 8 terminology quiz: PASS (7 questions, feedback, score, retry)");
