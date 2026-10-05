# Workshop 02 — AI Project Survival

> **Mission:** Take an unfamiliar AI repository and make **one pretrained inference** work.

Today is **not** about understanding the whole model.
Today is about learning how to **reproduce someone else's AI project without breaking the environment**.

---

## 0. What counts as success?

A successful deployment means:

```text
repository
   ↓
working Python environment
   ↓
pretrained model / checkpoint
   ↓
sample input
   ↓
inference command
   ↓
verified output
```

**Codex saying “Done” is not evidence.**

Evidence means:

- the command finishes successfully;
- the expected output actually exists;
- the output makes sense for the task.

---

# 1. Triage Before Typing

When you open an unfamiliar repository, do **not** install things immediately.

Find these five things first:

| Question | What are you looking for? |
|---|---|
| **Environment** | `pyproject.toml`, `requirements.txt`, `setup.py`, Python version |
| **Entry point** | `inference.py`, `predict.py`, `detect.py`, CLI command, demo script |
| **Model** | checkpoint / weights / pretrained model download |
| **Input** | image, video, audio, text, folder, config |
| **Output** | image, mask, depth map, text, embedding, result folder |

### 90-second repo scan

Before running anything, you should be able to complete:

```text
This project does: __________________________

Environment definition: ____________________
Inference entry point: _____________________
Checkpoint / model: ________________________
Example input: _____________________________
Expected output: ___________________________
```

---

# 2. Using `uv` with Someone Else's Project

We use **uv** for Python environments in this module.

But different repositories describe their dependencies differently.

## Case A — modern project

You find a standard Python project with dependency metadata in `pyproject.toml`.

```bash
uv sync
uv run <command>
```

## Case B — legacy / research project

You find files such as:

```text
requirements.txt
setup.py
environment.yml
```

Create an isolated environment first:

```bash
uv venv
```

Then reproduce the repository's dependency instructions using uv, for example:

```bash
uv pip install -r requirements.txt
```

or:

```bash
uv pip install -e .
```

Then run inside the environment:

```bash
uv run <command>
```

## Python version problem?

Do not change the system Python.

Ask uv for the required version instead:

```bash
uv venv --python 3.11
```

### Rule for today

> **Reproduce first. Modernise later.**

Do not rewrite somebody else's project structure before you have reproduced the original inference.

---

# 3. Codex as a Deployment Agent

Codex may inspect files, run commands and modify the repository.

That is useful — but **you are still responsible for the environment**.

Before starting:

```bash
pwd
git status
```

Use this as your starting prompt:

```text
You are helping me reproduce one pretrained inference in this repository.

Rules:
1. Work only inside the current repository.
2. Use uv for the Python environment and Python dependencies.
3. Do not use sudo and do not modify the global Python environment.
4. Do not access credentials, SSH keys, or files outside this repository.
5. Do not train the model.
6. Before changing anything, inspect the README, dependency files,
   inference entry point, checkpoint requirements, input and output paths.
7. Preserve the upstream project structure and dependency files unless a
   minimal change is required.
8. If a command fails, diagnose the root cause before changing files or
   installing additional packages.
9. Make the smallest necessary change.
10. Stop after one pretrained inference succeeds and verify the output exists.

Start by inspecting the repository.
Do not modify anything yet.
```

---

# 4. Diagnose Before You Fix

When something fails, classify the failure first.

```text
DEPENDENCY
PYTHON VERSION
CHECKPOINT / ASSET
PATH
DEVICE / CUDA
COMMAND / CONFIG
```

Use:

```text
The last command failed.

Classify the failure as one of:
dependency / Python version / checkpoint-asset / path / device / command-config.

Explain the root cause before changing anything.
Then propose the smallest possible fix.
```

### Bad debugging

```text
Error
 ↓
pip install something
 ↓
new error
 ↓
pip install something else
 ↓
???
```

### Better debugging

```text
Error
 ↓
classify
 ↓
find root cause
 ↓
minimal change
 ↓
run again
 ↓
verify
```

---

# 5. Live Deployment

During the demonstration, track the process rather than copying commands.

```text
SCAN
 ↓
PLAN
 ↓
ENVIRONMENT
 ↓
MODEL / ASSETS
 ↓
INFERENCE
 ↓
ERROR?
 ↓
DIAGNOSE
 ↓
VERIFY
```

Questions to answer while watching:

1. What information did we find **before** installing anything?
2. Why did we choose that uv workflow?
3. What did Codex change?
4. How did we verify that the final inference really worked?

---

# 6. Project Lottery

You will receive **one unfamiliar repository**.

| ID | Repository | Task |
|---|---|---|
| **A** | [ultralytics/yolov5](https://github.com/ultralytics/yolov5) | Object detection |
| **B** | [danielgatis/rembg](https://github.com/danielgatis/rembg) | Background removal |
| **C** | [JaidedAI/EasyOCR](https://github.com/JaidedAI/EasyOCR) | Text recognition |
| **D** | [openai/CLIP](https://github.com/openai/CLIP) | Image–text classification |
| **E** | [DepthAnything/Depth-Anything-V2](https://github.com/DepthAnything/Depth-Anything-V2) | Monocular depth estimation |
| **F** | [timesler/facenet-pytorch](https://github.com/timesler/facenet-pytorch) | Face detection / face crop |

Your task is **not** to train or understand the full architecture.

Your task is:

> **Get one supplied example through one pretrained inference successfully.**

---

# 7. Deployment Sprint

## You have 28 minutes.

### Stage 1 — Inspect

Do not install anything until you can identify:

```text
[ ] dependency definition
[ ] inference entry point
[ ] model / checkpoint source
[ ] sample input
[ ] expected output
```

### Stage 2 — Environment

```text
[ ] environment is local to this repository
[ ] uv is managing the Python environment
[ ] no sudo
[ ] no global pip installation
```

### Stage 3 — Run

```text
[ ] pretrained model is available
[ ] sample input is available
[ ] one inference command runs
```

### Stage 4 — Verify

```text
[ ] output exists
[ ] output makes sense
[ ] I know where it was written
```

### Stage 5 — Audit Codex

```bash
git status
git diff
```

You should be able to explain **every file Codex changed**.

---

# 8. Checkpoint

Before you say **finished**, you must be able to answer:

```text
1. What is the inference entry point?
2. Where did the model weights come from?
3. What was the input?
4. Where was the output written?
5. What was the most important dependency/environment decision?
6. Did Codex modify anything? Why?
```

If you cannot answer these, you have not finished the task yet.

---

# 9. Homework — Fresh Clone Reproduction

Running it once in class is not enough.

Your homework is to prove that the deployment is **reproducible**.

## Step 1

Start again from a **fresh clone / clean working directory**.

Do not reuse your working `.venv`.

## Step 2

Reproduce the inference using only your documented instructions.

## Step 3

Submit the following to your workshop repository:

```text
workshop02_AI_Project_Survival/
├── README.md
└── evidence/
    ├── input.*
    └── output.*
```

Do **not** submit:

```text
.venv/
large checkpoints
datasets
model caches
```

## README requirements

### 1. Assigned project

```text
Repository:
Commit:
Task:
```

Get the exact commit with:

```bash
git rev-parse HEAD
```

### 2. Repo map

```text
Environment definition:
Inference entry point:
Checkpoint / model:
Input:
Output:
```

### 3. Environment setup

Give the **exact uv commands** required to reproduce your environment.

### 4. Inference

Give the **exact command** required to reproduce the result.

### 5. One failure

Document one real problem using:

```text
Category:
Root cause:
Minimal fix:
```

### 6. Codex audit

Answer briefly:

```text
What did Codex change?
How did you verify the change?
```

### 7. Fresh-clone test

```text
Reproduction result: PASS / FAIL
```

---

# Final Rule

> **If another person cannot reproduce your result from your instructions, the project is not deployed yet.**
