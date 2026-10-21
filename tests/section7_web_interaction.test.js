"use strict";

// Offline interaction tests for Section 7. No browser, API key, or network needed.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");

const source = fs.readFileSync(
  path.join(__dirname, "../docs/workshop03/section07.js"), "utf8"
);

class FakeElement {
  constructor() {
    this.textContent = "";
    this.disabled = false;
    this.hidden = false;
    this.children = [];
    this.attributes = {};
    this.handlers = {};
    this.dataset = {};
    const classes = new Set();
    this.classList = {
      toggle: (name, value) => {
        if (value === undefined) {
          if (classes.has(name)) classes.delete(name);
          else classes.add(name);
        } else if (value) classes.add(name);
        else classes.delete(name);
      },
      contains: (name) => classes.has(name),
    };
  }
  setAttribute(name, value) { this.attributes[name] = value; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  addEventListener(event, listener) { this.handlers[event] = listener; }
  click() {
    assert.equal(typeof this.handlers.click, "function", "Expected click handler");
    if (!this.disabled) this.handlers.click();
  }
}

const ids = [
  "s7-case-prompt", "s7-tool-path", "s7-route-count", "s7-route-why",
  "s7-route-takeaway", "s7-route-prev", "s7-route-next", "s7-route-reset",
  "s7-state-add", "s7-state-analyse", "s7-state-replay", "s7-state-reset",
  "s7-state-pdfs", "s7-state-pending", "s7-state-rows", "s7-state-message",
  "s7-state-new-file", "s7-state-new-row", "s7-state-activity",
];
const elements = Object.fromEntries(ids.map(id => [id, new FakeElement()]));
const tabs = Array.from({ length: 4 }, (_, i) => {
  const el = new FakeElement();
  el.dataset.s7Case = String(i);
  return el;
});
const section = {
  querySelector: selector => elements[selector.slice(1)] || null,
  querySelectorAll: selector => selector === "[data-s7-case]" ? tabs : [],
};
const document = {
  getElementById: id => id === "s7" ? section : null,
  createElement: () => new FakeElement(),
};
vm.runInNewContext(source, { document, console }, { filename: "section07.js" });

assert.equal(elements["s7-route-count"].textContent, "TOOL 1 / 4");
assert.match(elements["s7-case-prompt"].textContent, /Find 2 papers/);
assert.equal(elements["s7-tool-path"].children.length, 7); // 4 tools + 3 arrows
elements["s7-route-next"].click();
assert.equal(elements["s7-route-count"].textContent, "TOOL 2 / 4");
elements["s7-route-prev"].click();
assert.equal(elements["s7-route-count"].textContent, "TOOL 1 / 4");

tabs[1].click();
assert.equal(tabs[1].attributes["aria-pressed"], "true");
assert.equal(tabs[0].attributes["aria-pressed"], "false");
assert.match(elements["s7-case-prompt"].textContent, /TOG2024Pan\.pdf/);
assert.equal(elements["s7-route-count"].textContent, "TOOL 1 / 2");

tabs[3].click();
assert.equal(elements["s7-route-count"].textContent, "TOOL 1 / 1");
assert.equal(elements["s7-route-next"].disabled, true);
assert.equal(elements["s7-tool-path"].children.length, 1);

assert.equal(elements["s7-state-rows"].textContent, "3");
assert.equal(elements["s7-state-analyse"].disabled, true);
elements["s7-state-add"].click();
assert.equal(elements["s7-state-pdfs"].textContent, "4");
assert.equal(elements["s7-state-pending"].textContent, "1");
assert.equal(elements["s7-state-new-file"].hidden, false);
assert.equal(elements["s7-state-rows"].textContent, "3");
elements["s7-state-analyse"].click();
assert.equal(elements["s7-state-rows"].textContent, "4");
assert.equal(elements["s7-state-pending"].textContent, "0");
assert.equal(elements["s7-state-new-row"].hidden, false);
elements["s7-state-replay"].click();
assert.equal(elements["s7-state-rows"].textContent, "4");
assert.match(elements["s7-state-message"].textContent, /ALREADY_ANALYSED/);
elements["s7-state-reset"].click();
assert.equal(elements["s7-state-pdfs"].textContent, "3");
assert.equal(elements["s7-state-rows"].textContent, "3");
assert.equal(elements["s7-state-new-file"].hidden, true);
assert.equal(elements["s7-state-new-row"].hidden, true);
console.log("Section 7 interactive tool routing and state simulation: PASS");
