"use strict";

// Section 8 is a self-contained, offline concept check.
// It makes no API calls, does not read files and never executes research tools.
(() => {
  const section = document.getElementById("s8");
  if (!section) return;

  const questions = [
    {
      question: "Your research Agent needs a stateful workflow with conditional branches, checkpoints and resumable execution. Which technology fits?",
      choices: ["Agent Skills", "LangGraph", "Fine-tuning"],
      answer: 1,
      why: "LangGraph is a framework for stateful orchestration. Skills describe reusable ways to do a task; fine-tuning changes model behaviour, not workflow execution."
    },
    {
      question: "You want to connect an AI application to tools exposed by external services through a standard protocol.",
      choices: ["MCP", "RAG", "Multi-Agent"],
      answer: 0,
      why: "MCP standardises how AI applications discover and use external capabilities such as tools and resources. RAG retrieves context; Multi-Agent is an architecture."
    },
    {
      question: "Two independently built Agent systems need to communicate and delegate tasks to each other.",
      choices: ["A2A", "Pydantic", "LangChain"],
      answer: 0,
      why: "A2A focuses on interoperability between Agent systems. MCP instead primarily connects AI applications with external tools and resources."
    },
    {
      question: "You want a reusable set of instructions explaining how the Agent should perform an academic review.",
      choices: ["Agent Skills", "Observability", "A2A"],
      answer: 0,
      why: "Agent Skills package task guidance and supporting resources. A Skill can describe when to use tools, but the Skill itself is not a replacement for an executable tool."
    },
    {
      question: "The Agent should ask the student to approve the selected papers before analysing them.",
      choices: ["Human-in-the-Loop", "Context Window", "Tracing"],
      answer: 0,
      why: "Human-in-the-Loop introduces an approval or correction step. This is useful when relevance and scholarly quality require human judgement."
    },
    {
      question: "A run ended with a wrong method table. You need to inspect which tool calls were made and where the problem occurred.",
      choices: ["Observability / Tracing", "Multi-Agent", "Agent Skills"],
      answer: 0,
      why: "Tracing records execution steps, tool calls and errors so you can diagnose failures. Evaluation checks whether the overall task succeeded."
    },
    {
      question: "You want to measure whether the Agent finds real papers and correctly avoids duplicate analyses across many test cases.",
      choices: ["Agent Evaluation (Evals)", "MCP", "Plan-and-Execute"],
      answer: 0,
      why: "Evals measure behaviour and outcomes against expected criteria across test cases. Tool protocols and planning strategies do not themselves evaluate correctness."
    }
  ];

  const $ = selector => section.querySelector(selector);
  const choices = $("#s8-choices");
  const count = $("#s8-question-counter");
  const progress = $("#s8-quiz-progress");
  const prompt = $("#s8-question");
  const feedback = $("#s8-feedback");
  const next = $("#s8-next");
  const result = $("#s8-result");
  const quizPanel = $("#s8-question-panel");
  const tryAgain = $("#s8-restart");
  const score = $("#s8-score");
  const bar = $("#s8-progress-fill");
  const total = $("#s8-total");
  let questionIndex = 0;
  const responses = Array(questions.length).fill(null);
  total.textContent = String(questions.length);

  function make(tag, classname, value) {
    const element = document.createElement(tag);
    if (classname) element.className = classname;
    if (value !== undefined) element.textContent = value;
    return element;
  }

  function renderQuestion() {
    const q = questions[questionIndex];
    const selected = responses[questionIndex];
    quizPanel.hidden = false;
    result.hidden = true;
    count.textContent = "QUESTION " + (questionIndex + 1) + " / " + questions.length;
    progress.textContent = "Choose the technology that best matches the goal.";
    prompt.textContent = q.question;
    bar.style.width = Math.round((questionIndex / questions.length) * 100) + "%";
    choices.replaceChildren();

    q.choices.forEach((choice, index) => {
      const button = make("button", "s8-choice", "");
      button.type = "button";
      const letter = make("span", "s8-choice-letter", String.fromCharCode(65 + index));
      const title = make("span", "s8-choice-title", choice);
      button.append(letter, title);
      button.setAttribute("aria-pressed", String(selected === index));
      if (selected !== null) {
        if (index === q.answer) button.classList.add("s8-choice-correct");
        else if (selected === index) button.classList.add("s8-choice-wrong");
      }
      button.addEventListener("click", () => {
        if (responses[questionIndex] !== null) return;
        responses[questionIndex] = index;
        renderQuestion();
      });
      choices.append(button);
    });

    if (selected === null) {
      feedback.hidden = true;
      feedback.replaceChildren();
      next.disabled = true;
    } else {
      feedback.hidden = false;
      const success = selected === q.answer;
      feedback.className = "s8-feedback " + (success ? "s8-feedback-correct" : "s8-feedback-wrong");
      const title = make("strong", "", success ? "Correct ✓" : "Not quite.");
      const explanation = make("p", "", q.why);
      feedback.replaceChildren(title, explanation);
      next.disabled = false;
    }
    next.textContent = questionIndex === questions.length - 1 ? "See my result →" : "Next question →";
  }

  function showResult() {
    const correct = responses.reduce((sum, choice, index) =>
      sum + (choice === questions[index].answer ? 1 : 0), 0);
    quizPanel.hidden = true;
    result.hidden = false;
    score.textContent = correct + " / " + questions.length;
    bar.style.width = "100%";
  }

  next.addEventListener("click", () => {
    if (responses[questionIndex] === null) return;
    if (questionIndex === questions.length - 1) showResult();
    else {
      questionIndex += 1;
      renderQuestion();
    }
  });
  tryAgain.addEventListener("click", () => {
    responses.fill(null);
    questionIndex = 0;
    renderQuestion();
  });

  renderQuestion();
})();
