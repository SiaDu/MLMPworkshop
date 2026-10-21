"use strict";

// Section 6 — local teaching simulations. No network requests or LLM calls.
(() => {
  const inspector = document.getElementById("s6-inspector");
  const parser = document.getElementById("s6-parser");
  if (!inspector || !parser) return;

  const examples = [
    {
      type: "HTTP 200 · application/json",
      code: '{\n  "best_oa_location": {\n    "pdf_url": "https://example.org/paper.pdf"\n  }\n}',
      question: "The API returned a working PDF URL. What should Python do next?",
      answers: [
        "Parse a webpage with BeautifulSoup",
        "Request the PDF URL and validate the downloaded file",
        "Ask an LLM to invent another link"
      ],
      correct: 1,
      explain: "The API already provides a URL. Python can request that PDF and verify the response without scraping HTML."
    },
    {
      type: "HTTP 200 · text/html",
      code: '<html>\n  <head>\n    <meta name="citation_pdf_url"\n          content="/files/paper.pdf">\n  </head>\n</html>',
      question: "The webpage returned HTML. How can Python extract the PDF link?",
      answers: [
        "Use response.json() to decode the page",
        "Assume the webpage is itself a PDF",
        "Use BeautifulSoup to read the tag and urljoin() to resolve the path"
      ],
      correct: 2,
      explain: "BeautifulSoup can find an HTML element; urljoin() turns the relative address into a complete URL."
    },
    {
      type: "HTTP 403 · text/html",
      code: 'HTTP/1.1 403 Forbidden\nContent-Type: text/html\n\n<html>Access denied</html>',
      question: "What can we actually conclude from HTTP 403?",
      answers: [
        "The paper definitely requires payment",
        "The automated request was rejected; its underlying cause is unknown",
        "The PDF must be corrupted"
      ],
      correct: 1,
      explain: "A 403 response reports rejected access, not the underlying reason. It does not prove a paywall."
    }
  ];

  let caseIndex = 0;
  const choices = Array.from(inspector.querySelectorAll("[data-s6-answer]"));
  const tabs = Array.from(inspector.querySelectorAll("[data-s6-case]"));
  const responseCode = inspector.querySelector("#s6-response-code");
  const responseType = inspector.querySelector("#s6-response-type");
  const question = inspector.querySelector("#s6-question");
  const feedback = inspector.querySelector("#s6-feedback");

  function showCase(index) {
    caseIndex = index;
    const item = examples[index];
    tabs.forEach((tab, i) => tab.setAttribute("aria-pressed", String(i === index)));
    responseCode.textContent = item.code;
    responseType.textContent = item.type;
    question.textContent = item.question;
    choices.forEach((button, i) => {
      button.textContent = item.answers[i];
      button.setAttribute("aria-pressed", "false");
      button.classList.remove("s6-correct", "s6-incorrect");
    });
    feedback.hidden = true;
    feedback.classList.remove("s6-feedback-wrong");
    feedback.textContent = "";
  }

  tabs.forEach((tab, i) => tab.addEventListener("click", () => showCase(i)));
  choices.forEach((button, index) => {
    button.addEventListener("click", () => {
      const item = examples[caseIndex];
      const correct = index === item.correct;
      choices.forEach((choice, i) => {
        choice.setAttribute("aria-pressed", String(i === index));
        choice.classList.remove("s6-correct", "s6-incorrect");
      });
      button.classList.add(correct ? "s6-correct" : "s6-incorrect");
      feedback.classList.toggle("s6-feedback-wrong", !correct);
      feedback.hidden = false;
      const label = document.createElement("strong");
      label.textContent = correct ? "Correct. " : "Not quite. ";
      feedback.replaceChildren(label, document.createTextNode(item.explain));
    });
  });

  // Five highlighted Python lines. This is a teaching simulation, not Python execution.
  const patterns = {
    meta: {
      find: 'tag = soup.find("meta", attrs={"name": "citation_pdf_url"})',
      attribute: 'path = tag.get("content")',
      found: '<meta name="citation_pdf_url" content="/files/paper.pdf">',
      path: '/files/paper.pdf',
      finalUrl: 'https://example.org/files/paper.pdf',
      findExplain: 'Find the <meta> element whose name attribute equals citation_pdf_url. This identifies the PDF metadata tag.',
      valueExplain: 'Read the content attribute from the matching tag. It contains a relative URL, not the complete address.',
      finalExplain: 'urljoin() combines the webpage address with /files/paper.pdf. Because the path starts with /, it is relative to the domain root.'
    },
    anchor: {
      find: 'tag = soup.find("a", href=True)',
      attribute: 'path = tag.get("href")',
      found: '<a href="paper.pdf">Download PDF</a>',
      path: 'paper.pdf',
      finalUrl: 'https://example.org/article/paper.pdf',
      findExplain: 'Find the first <a> tag with an href attribute. Our teaching HTML has only one link; real sites may have many.',
      valueExplain: 'Read the href attribute. It contains a filename relative to the current article page.',
      finalExplain: 'urljoin() combines the webpage address with paper.pdf. Without a leading /, it resolves inside /article/.'
    }
  };

  const patternButtons = Array.from(parser.querySelectorAll("[data-s6-pattern]"));
  const htmlSamples = Array.from(parser.querySelectorAll("[data-s6-html]"));
  const codeLines = Array.from(parser.querySelectorAll("[data-s6-line]"));
  const outputValue = parser.querySelector("#s6-output-url");
  const description = parser.querySelector("#s6-step-description");
  const position = parser.querySelector("#s6-step-position");
  const previous = parser.querySelector("#s6-step-prev");
  const next = parser.querySelector("#s6-step-next");
  const reset = parser.querySelector("#s6-step-reset");
  let activePattern = "meta";
  let stepIndex = -1;

  function setLines(pattern) {
    codeLines[0].textContent = "response = requests.get(page_url)";
    codeLines[1].textContent = 'soup = BeautifulSoup(response.text, "html.parser")';
    codeLines[2].textContent = pattern.find;
    codeLines[3].textContent = pattern.attribute;
    codeLines[4].textContent = "pdf_url = urljoin(page_url, path)";
  }

  function renderStep() {
    const pattern = patterns[activePattern];
    parser.classList.toggle("s6-highlight-tag", stepIndex >= 2);
    parser.classList.toggle("s6-highlight-attr", stepIndex >= 3);
    codeLines.forEach((line, i) => {
      line.classList.toggle("s6-active-line", i === stepIndex);
    });
    position.textContent = String(stepIndex + 1) + " / 5";
    previous.disabled = stepIndex < 0;
    next.textContent = stepIndex === -1 ? "Start walkthrough →"
      : stepIndex === 4 ? "Restart ↺" : "Next line →";

    const stages = [
      [
        "Python sends an HTTP GET request to the paper landing page. We expect the response body to contain HTML.",
        "HTTP 200 · text/html (simulated)"
      ],
      [
        "response.text gives the HTML as text. BeautifulSoup parses it into HTML elements that Python can search.",
        "BeautifulSoup object: <html> ... </html>"
      ],
      [pattern.findExplain, pattern.found],
      [pattern.valueExplain, 'path = "' + pattern.path + '"'],
      [pattern.finalExplain, 'pdf_url = "' + pattern.finalUrl + '"']
    ];

    if (stepIndex < 0) {
      description.textContent = "Click Start walkthrough. Each click will highlight one Python line and explain its result.";
      outputValue.textContent = "Waiting to start...";
    } else {
      description.textContent = stages[stepIndex][0];
      outputValue.textContent = stages[stepIndex][1];
    }
  }

  function selectPattern(name) {
    activePattern = name;
    stepIndex = -1;
    patternButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.s6Pattern === name));
    });
    htmlSamples.forEach((sample) => {
      sample.hidden = sample.dataset.s6Html !== name;
    });
    setLines(patterns[name]);
    renderStep();
  }

  patternButtons.forEach((button) => {
    button.addEventListener("click", () => selectPattern(button.dataset.s6Pattern));
  });
  next.addEventListener("click", () => {
    stepIndex = stepIndex === 4 ? -1 : stepIndex + 1;
    renderStep();
  });
  previous.addEventListener("click", () => {
    stepIndex = Math.max(-1, stepIndex - 1);
    renderStep();
  });
  reset.addEventListener("click", () => {
    stepIndex = -1;
    renderStep();
  });

  showCase(0);
  selectPattern("meta");
})();
