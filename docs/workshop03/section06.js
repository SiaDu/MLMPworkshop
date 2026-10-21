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

  const patterns = {
    meta: {
      python: 'tag = soup.find("meta", attrs={"name": "citation_pdf_url"})\npath = tag.get("content")\npdf_url = urljoin(page_url, path)',
      url: "https://example.org/files/paper.pdf",
      explanation: "The content attribute contains /files/paper.pdf. urljoin() resolves it relative to the page's origin."
    },
    anchor: {
      python: 'tag = soup.find("a", href=True)\npath = tag.get("href")\npdf_url = urljoin(page_url, path)',
      url: "https://example.org/article/paper.pdf",
      explanation: "The href attribute contains paper.pdf. urljoin() resolves it relative to the article page."
    }
  };

  let patternIndex = "meta";
  const patternButtons = Array.from(parser.querySelectorAll("[data-s6-pattern]"));
  const htmlSamples = Array.from(parser.querySelectorAll("[data-s6-html]"));
  const pythonCode = parser.querySelector("#s6-python-code");
  const outputUrl = parser.querySelector("#s6-output-url");
  const outputInfo = parser.querySelector("#s6-output-info");
  const run = parser.querySelector("#s6-extract-run");
  const reset = parser.querySelector("#s6-extract-reset");

  function selectPattern(pattern) {
    patternIndex = pattern;
    parser.classList.remove("s6-found");
    patternButtons.forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.s6Pattern === pattern));
    });
    htmlSamples.forEach(element => {
      element.hidden = element.dataset.s6Html !== pattern;
    });
    pythonCode.textContent = patterns[pattern].python;
    outputUrl.textContent = "Waiting for extraction";
    outputInfo.textContent = "Click Find PDF Link to locate an HTML attribute.";
  }

  patternButtons.forEach(button => {
    button.addEventListener("click", () => selectPattern(button.dataset.s6Pattern));
  });
  run.addEventListener("click", () => {
    parser.classList.add("s6-found");
    outputUrl.textContent = patterns[patternIndex].url;
    outputInfo.textContent = patterns[patternIndex].explanation;
  });
  reset.addEventListener("click", () => selectPattern(patternIndex));

  showCase(0);
  selectPattern("meta");
})();
