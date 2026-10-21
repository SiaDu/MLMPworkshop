"use strict";
// No browser or external packages: test the actual sidebar navigation function.
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
const windowMock = {
  scrollY: 0,
  innerHeight: 800,
  addEventListener: (name, fn) => { handlers[name] = fn; },
  requestAnimationFrame: fn => fn(),
};
const links = ids.map(id => {
  const attrs = { href: "#" + id };
  const classes = new Set();
  return {
    attrs, classes,
    getAttribute: name => attrs[name] ?? null,
    setAttribute: (name, value) => { attrs[name] = value; },
    removeAttribute: name => { delete attrs[name]; },
    classList: {
      toggle: (name, shouldHave) => {
        if (shouldHave) classes.add(name);
        else classes.delete(name);
      },
    },
  };
});
const doc = {
  documentElement: { scrollHeight: 10200 },
  getElementById: id => {
    const index = ids.indexOf(id);
    if (index === -1) return null;
    return { id, getBoundingClientRect: () => ({
      top: positions[index] - windowMock.scrollY
    }) };
  },
  querySelectorAll: selector =>
    selector === ".side-nav .nav-item" ? links : [],
};
vm.runInNewContext(navigation + "\nsetupNavigation();", {
  document: doc, window: windowMock
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
assertActive("intro");

// Section 3's border is at 200px inside viewport, a common screenshot state.
// The old fixed 170px scrollspy incorrectly showed Section 2.
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

windowMock.scrollY = 1700;
handlers.load();
assertActive("s3");
console.log("Navigation scrollspy: PASS (single active item across sections, scroll/hash/resize)");
