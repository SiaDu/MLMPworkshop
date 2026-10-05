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

> **An AI coding agent saying “Done” is not evidence. The output is evidence.**

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

The README tells you **how the author expects the project to run**.

## A typical AI repository

```text
awesome-ai-project/
│
├── README.md
├── pyproject.toml / requirements.txt / setup.py
├── .gitignore
│
├── src/
│   ├── model.py
│   └── dataset.py
│
├── scripts/
│   └── inference.py
│
├── utils/
├── configs/
├── data/
├── checkpoints/
├── outputs/
└── tests/
```

| Folder | Common file types | Usually contains |
|---|---|---|
| `src/` | `.py` | Core Python code |
| `utils/` | `.py` | Helper functions |
| `scripts/` | `.py`, `.sh` | Runnable scripts / commands |
| `configs/` | `.yaml`, `.yml`, `.json`, `.toml` | Settings and parameters |
| `data/` | `.json`, `.csv`, images, audio, text, etc. | Dataset-related files |
| `checkpoints/` | `.pt`, `.pth`, `.ckpt`, `.safetensors`, `.onnx` | Model weights |
| `outputs/` | images, `.json`, `.txt`, `.csv`, etc. | Generated results |
| `tests/` | `.py` | Code used to check that the project works |

Different projects use different names and structures.

The **entry point** may be in the project root, `src/`, or `scripts/`.

You do **not** need to understand every file.  
You only need to locate five things:

| Find | Question | Example |
|---|---|---|
| **Environment** | What does this project need to run? | `pyproject.toml`, `requirements.txt`, Python version |
| **Entry point** | What should I run? | `inference.py`, `detect.py`, CLI command |
| **Model** | Where are the pretrained weights? | `.pt`, `.pth`, `.ckpt`, `.onnx` |
| **Input** | What does the model receive? | image, video, audio, text |
| **Output** | What should be produced? | image, text, mask, depth map, result folder |

This is a common pattern, not a fixed standard. Real AI repositories may organise the same roles differently.

### Quick example

Let’s look at a real repository https://github.com/ultralytics/yolov5 and try to look for:

```text
Environment: __________________
Entry point: __________________
Model: ________________________
Input: ________________________
Output: _______________________     
```

This gives us the basic deployment flow:

```text
Input
  ↓
Entry point + pretrained model
  ↓
Inference
  ↓
Output
```

Before installing anything, you should be able to complete:


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

## Use a Separate Working Directory

Do **not** clone your assigned AI repository inside `MLMPworkshop`.

`MLMPworkshop` is your **submission repository**.  
The assigned AI repository is your **working repository**.

For example:

```text
~/
├── MLMPworkshop/          ← submit your work here
│
└── workshop02_projects/   ← clone and test AI projects here
    └── yolov5/
        ├── .git/
        └── .venv/
```

```bash
mkdir -p ~/workshop02_projects
cd ~/workshop02_projects

git clone <repository-url>
cd <repository-name>
```

> **Clone first, then create the environment inside the cloned repository.**

## Use `uv` with an AI Coding Agent

First identify:

```text
Python version
Dependency source
```

An AI coding agent can help create the environment, but **do not let it guess or freely upgrade dependency versions**.

Recommended options:

- **GitHub Copilot Free / Copilot Student**
- Codex
- Claude Code
- another equivalent coding agent

> **Using an AI coding agent is optional. You are responsible for checking what it changes.**

### If the repo already has `pyproject.toml`

Keep the existing project configuration.

Ask your AI coding agent:

```text
Inspect this repository and determine the required Python version.

Use uv to create or sync a local .venv using the existing pyproject.toml.

Do not upgrade or change dependency versions unless required.
Do not modify the source code.

When finished, show me:
1. the Python version used
2. the dependencies installed
3. the commands you ran
```

The usual workflow is:

```bash
uv sync
uv run <command>
```

### If the repo only has `requirements.txt` or `setup.py`

You may ask your AI coding agent to create a minimal uv-managed project configuration.

```text
Inspect the README, requirements.txt and setup.py.

Determine the required Python version.

Create a local uv environment using that Python version.

Create a minimal pyproject.toml and add the project's required dependencies with uv.

Preserve the dependency versions and constraints from the original repository.
Do not upgrade packages unnecessarily.
Do not modify the source code.

When finished, show me:
1. the Python version used
2. the dependencies added
3. the final pyproject.toml
4. the commands you ran
```

The goal is:

```text
original dependency information
        ↓
pyproject.toml
        ↓
uv sync
        ↓
.venv
```

> **The AI agent may organise the environment, but it must follow the repository's dependency requirements.**

> **Reproduce first. Modernise later.**

---

# 3. Use an AI Coding Agent as a Helper, Not a Guessing Machine

An AI coding agent can read the repo, run commands and change files.  
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

## Step 5 — Check AI agent changes

```bash
git status
git diff
```

If you used an AI agent, you should be able to explain every changed file.

---

# 7. Homework — Reproducibility Test

Running the project once in class is not enough.

The homework has **two parts**:

```text
Part 1 — Build and Document
          ↓
Part 2 — Peer Reproduction
          ↓
Update your README
```

## Part 1 — Build and Document

Start again from a **fresh clone** of your assigned repository.

A fresh clone means cloning the repository again into a **new folder**.

For example:

```bash
cd ~/workshop02_projects
git clone https://github.com/ultralytics/yolov5.git yolov5_fresh
cd yolov5_fresh
```

This creates:

```text
~/workshop02_projects/
├── yolov5/
└── yolov5_fresh/
```

Do not reuse the `.venv` from class.

Reproduce one pretrained inference and document exactly how you did it.

Submit to your `MLMPworkshop` repository:

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
Inference task:
```

Get the exact commit with:

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

### Environment setup

Give the **exact uv commands** needed to reproduce your environment.

### Inference

Give the **exact command** needed to reproduce the result.

### One real failure

Document one real problem:

```text
Category:
Root cause:
Minimal fix:
```

### AI agent check

If you used an AI coding agent:

```text
Which AI coding agent did you use?
What did it change?
How did you verify the change?
```

---

## Part 2 — Peer Reproduction

Exchange your README with another student.

Your partner must start from a **fresh clone** and try to reproduce your result using **only your README**.

Do not give extra instructions unless the README is incomplete.

The reviewer records:

```text
Reviewer:
Reproduction result: PASS / FAIL

If FAIL:
Failed step:
Missing information:
Suggested fix:
```

## Final step

Use the peer feedback to update your own README.

Your final README should contain enough information for another person to reproduce the inference without asking you for help.


---

# Final Rule

> **If another person cannot reproduce your result from your instructions, the deployment is not finished.**
