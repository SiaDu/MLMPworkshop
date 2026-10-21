"use strict";
// Test the actual navigation function with mock viewport geometry and clicks.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const code = fs.readFileSync(
  path.join(__dirname, "../docs/workshop03/app.js"), "utf8"
);
const begin = code.indexOf("function setupNavigation() {");
const end = code.indexOf('\n$("#scenario-condition").addEventListener', begin);
assert(begin !== -1 && end > begin, "Cannot locate sidebar setup function");
const navigation = code.slice(begin, end);
const ids = ["intro", "s2-start", "s3", "s4", "s5", "s6", "s7", "s8"];
const positions = [0, 800, 1900, 3600, 4900, 6200, 7900, 9000];
const handlers = {};
const jumps = [];
const windowMock = {
  scrollY: 0,
  innerHeight: 800,
  location: { hash: "" },
  addEventListener: (name, fn) => { handlers[name] = fn; },
  requestAnimationFrame: fn => fn(),
  scrollTo: options => {
    jumps.push(options);
    windowMock.scrollY = options.top;
  },
};
windowMock.history = {
  pushState: (_, __, hash) => { windowMock.location.hash = hash; },
};
const links = ids.map(id => {
  const attrs = { href: "#" + id };
  const classes = new Set();
  const events = {};
  return {
    attrs, classes, events,
    getAttribute: name => attrs[name] ?? null,
    setAttribute: (name, value) => { attrs[name] = value; },
    removeAttribute: name => { delete attrs[name]; },
    addEventListener: (event, fn) => { events[event] = fn; },
    classList: {
      toggle: (name, enabled) => {
        if (enabled) classes.add(name);
        else classes.delete(name);
      },
    },
  };
});
const documentRoot = { scrollHeight: 10200, style: { scrollBehavior: "" } };
const doc = {
  documentElement: documentRoot,
  getElementById: id => {
    const index = ids.indexOf(id);
    if (index === -1) return null;
    return { id, getBoundingClientRect: () => ({
      top: positions[index] - windowMock.scrollY
    }) };
  },
  querySelector: selector => selector === ".topbar"
    ? { getBoundingClientRect: () => ({ height: 70 }) } : null,
  querySelectorAll: selector =>
    selector === ".side-nav .nav-item" ? links : [],
};
vm.runInNewContext(navigation + "\nsetupNavigation();", {
  document: doc, window: windowMock,
});

function assertActive(id) {
  const active = links.filter(link => link.classes.has("active"));
  assert.equal(active.length, 1, "Exactly one sidebar item must be active");
  assert.equal(active[0].attrs.href, "#" + id);
  assert.equal(active[0].attrs["aria-current"], "location");
  links.filter(link => !link.classes.has("active")).forEach(link =>
    assert.equal(link.attrs["aria-current"], undefined)
  );
}
function clickLink(id) {
  const link = links[ids.indexOf(id)];
  assert(link && typeof link.events.click === "function");
  let prevented = false;
  const event = {
    button: 0, defaultPrevented: false,
    ctrlKey: false, metaKey: false, shiftKey: false, altKey: false,
    preventDefault: () => { prevented = true; },
  };
  link.events.click(event);
  assert.equal(prevented, true, "Sidebar must handle this anchor directly");
  assert.equal(windowMock.location.hash, "#" + id);
  assert.equal(jumps.at(-1).behavior, "instant");
  assert.equal(windowMock.scrollY, Math.max(0, positions[ids.indexOf(id)] - 88),
    "Clicking " + id + " must land at its own heading, not the previous section");
  assert.equal(documentRoot.style.scrollBehavior, "", "Restore CSS scroll behaviour");
  assertActive(id);
}

assertActive("intro");
// This reproduces the reported one-section-behind navigation problem.
for (const id of ["s4", "s5", "s6", "s7", "s8"]) {
  clickLink(id);
}
clickLink("s3");

// Also retain the previous scrollspy behaviour.
windowMock.scrollY = 1700;
handlers.scroll();
assertActive("s3");
windowMock.scrollY = 6100;
handlers.scroll();
assertActive("s6");
windowMock.scrollY = 8000;
handlers.hashchange();
assertActive("s7");
windowMock.scrollY = 9395;
handlers.resize();
assertActive("s8");

// Back navigation should use its own hash target.
windowMock.location.hash = "#s5";
handlers.popstate();
assert.equal(windowMock.scrollY, 4900 - 88);
assertActive("s5");

console.log("Sidebar navigation PASS: clicks land on exact Sections 4–8; scrollspy retained.");
