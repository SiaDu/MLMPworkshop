# Workshop 02 — AI Project Survival

> **Mission:** Take an unfamiliar AI repository and get **one pretrained model** working on an example input.

Today is not about understanding the whole model.  
It is about learning how to **reproduce an AI project without breaking its environment**.

---

## 0. What counts as success?

One successful inference is enough:

```text
input
  ↓
pretrained model
  ↓
inference
  ↓
output
```

### Example — YOLO

```text
bus.jpg
  ↓
YOLO pretrained weights
  ↓
detect.py
  ↓
image with bounding boxes
```

You are finished only when:

- the command runs;
- the output exists;
- the output makes sense.

> **Codex saying “Done” is not evidence. The output is evidence.**

### Why AI projects fail

Usually the model itself is not the problem.

Common causes are:

```text
Python version
dependencies
CUDA / GPU
missing checkpoint
missing dataset / input
wrong file path
wrong config
incomplete instructions
```

Typical errors:

```text
ModuleNotFoundError

FileNotFoundError: checkpoint.pth

CUDA out of memory

RuntimeError: expected CUDA...

Version conflict
```

These errors are normal.  
The goal is to **identify the cause before changing the environment**.

---

# 1. Inspect Before You Install

Do not start with `pip install ...`.

Start with the **README**.

Look for sections such as:

```text
Installation
Requirements
Pretrained Models
Dataset
Inference
Examples
```

Before typing commands, try to answer:

```text
1. Which Python version?
2. How are dependencies installed?
3. Where are the pretrained weights?
4. What is the example input?
5. What command runs inference?
6. Where will the output go?
```

## A typical AI repository

```text
awesome-ai-project/
│
├── README.md
├── pyproject.toml
├── uv.lock
├── .gitignore
│
├── src/
│   ├── model.py
│   ├── dataset.py
│   └── inference.py
│
├── configs/
├── data/
├── checkpoints/
├── outputs/
└── tests/
```

The names will change between projects, but always ask:

> **Where is the code?**  
> **Where is the input?**  
> **Where is the model?**  
> **Where is the output?**

### Code, data and model are different things

| Code | Data / Input | Model |
|---|---|---|
| `.py` | images | `.pt` |
| scripts | videos | `.pth` |
| configs | text / CSV | `.ckpt` |
| utilities | audio | `.safetensors` |

A simple mental model:

```text
Input
  ↓
Code + pretrained model
  ↓
Inference
  ↓
Output
```

## Five things to find

| Find | Example |
|---|---|
| **Environment** | `pyproject.toml`, `requirements.txt`, Python version |
| **Entry point** | `inference.py`, `detect.py`, CLI command |
| **Model** | `.pt`, `.pth`, `.ckpt`, `.onnx`, model download |
| **Input** | image, video, audio, text |
| **Output** | image, text, mask, depth map, result folder |

### Quick example

You open a repo and find:

```text
requirements.txt
detect.py
weights/yolov5s.pt
data/images/bus.jpg
runs/detect/
```

You already know:

```text
Environment → requirements.txt
Entry point → detect.py
Model       → yolov5s.pt
Input       → bus.jpg
Output      → runs/detect/
```

Before installing anything, complete:

```text
This project does: ____________________
Environment: _________________________
Entry point: _________________________
Model: _______________________________
Input: _______________________________
Output: ______________________________
```

## What belongs in Git?

Usually commit:

```text
✓ code
✓ README
✓ configs
✓ environment files
✓ small examples
```

Usually do not commit:

```text
✗ .venv/
✗ large datasets
✗ large checkpoints
✗ generated outputs
✗ API keys / secrets
```

Why not `.venv/`?

- it is large;
- it is machine-specific;
- it should be recreated from the environment definition.

That is what `.gitignore` is for.

---

# 2. Keep the Environment Clean

Your environment is the combination of:

```text
Python version
+ installed packages
+ package versions
+ CUDA / PyTorch compatibility
```

A **broken environment** means these parts no longer work together.

### Example

The project expects:

```text
Python 3.10
torch 2.2
numpy 1.26
```

You randomly upgrade to:

```text
torch 2.8
numpy 2.x
```

One error may disappear, but the project may now fail somewhere else.

> **Do not randomly install or upgrade packages until the error disappears.**

## Use `uv`

### If the repo already has a usable `pyproject.toml`

```bash
uv sync
uv run <command>
```

### If the repo uses `requirements.txt` or `setup.py`

```bash
uv venv
uv pip install -r requirements.txt
```

or:

```bash
uv pip install -e .
```

Then run:

```bash
uv run <command>
```

### Wrong Python version?

Do not change the system Python.

```bash
uv venv --python 3.11
```

> **Reproduce first. Modernise later.**

---

# 3. Use Codex as a Helper, Not a Guessing Machine

Codex can read the repo, run commands and change files.  
That is useful, but you must still check what it does.

Before starting:

```bash
pwd
git status
```

Use this prompt:

```text
Help me reproduce one pretrained inference in this repository.

Rules:
- work only inside this repository
- use uv
- do not use sudo
- do not modify the global Python environment
- do not train the model
- inspect before changing anything
- diagnose errors before installing new packages
- make the smallest necessary change
- stop after one inference succeeds

First inspect the repository.
Do not modify anything yet.
```

### Bad request

```text
Fix everything.
```

### Better request

```text
Explain why this command failed.
Do not change anything yet.
Find the root cause first.
```

---

# 4. Diagnose Before You Fix

Most deployment errors fit one of these groups:

```text
DEPENDENCY
PYTHON VERSION
CHECKPOINT / ASSET
PATH
DEVICE / CUDA
COMMAND / CONFIG
```

### Example 1

```text
ModuleNotFoundError: No module named 'cv2'
```

Likely category:

```text
DEPENDENCY
```

### Example 2

```text
FileNotFoundError: checkpoints/model.pth
```

Likely category:

```text
CHECKPOINT / ASSET
```

Do not solve Example 2 by installing more Python packages.

Use this debugging flow:

```text
error
  ↓
classify
  ↓
find root cause
  ↓
smallest fix
  ↓
run again
  ↓
verify output
```

---

# 5. Project Lottery

You will receive **one unfamiliar AI repository**.

| ID | Repository | Task |
|---|---|---|
| **A** | [ultralytics/yolov5](https://github.com/ultralytics/yolov5) | Object detection |
| **B** | [danielgatis/rembg](https://github.com/danielgatis/rembg) | Background removal |
| **C** | [JaidedAI/EasyOCR](https://github.com/JaidedAI/EasyOCR) | Text recognition |
| **D** | [openai/CLIP](https://github.com/openai/CLIP) | Image–text classification |
| **E** | [DepthAnything/Depth-Anything-V2](https://github.com/DepthAnything/Depth-Anything-V2) | Depth estimation |
| **F** | [timesler/facenet-pytorch](https://github.com/timesler/facenet-pytorch) | Face detection |

Your goal is simple:

> **Get one example input through one pretrained model and produce one valid output.**

You do **not** need to:

- train the model;
- understand the whole architecture;
- improve the model;
- rewrite the project.

---

# 6. Deployment Sprint

## Step 1 — Inspect

```text
[ ] environment
[ ] entry point
[ ] model / checkpoint
[ ] input
[ ] output
```

## Step 2 — Set up

```text
[ ] local uv environment
[ ] correct Python version
[ ] required dependencies
[ ] no sudo / global pip
```

## Step 3 — Run

```text
[ ] pretrained model available
[ ] sample input available
[ ] inference command runs
```

## Step 4 — Verify

```text
[ ] output exists
[ ] output makes sense
[ ] I know where it was saved
```

## Step 5 — Check Codex changes

```bash
git status
git diff
```

You should be able to explain every changed file.

---

# 7. Homework — Fresh Clone Test

Running it once in class is not enough.

Your homework is to prove that another person can reproduce it.

## Start from a fresh clone

Do not reuse the `.venv` from class.

Submit:

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

## README must include

### Project

```text
Repository:
Commit:
Task:
```

Get the commit with:

```bash
git rev-parse HEAD
```

### Repo map

```text
Environment:
Entry point:
Model:
Input:
Output:
```

### Setup

Give the exact `uv` commands.

### Inference

Give the exact inference command.

### One real failure

```text
Category:
Root cause:
Minimal fix:
```

### Codex check

```text
What did Codex change?
How did you verify it?
```

### Final test

```text
Fresh-clone reproduction: PASS / FAIL
```

---

# Final Rule

> **If another person cannot reproduce your result from your instructions, the deployment is not finished.**
