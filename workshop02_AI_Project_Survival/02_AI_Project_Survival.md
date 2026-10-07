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

## Inspect the Environment Before Installing

Before creating the virtual environment, first use an AI coding agent to inspect the repository and determine which Python version is appropriate.

Recommended options:

- **GitHub Copilot Free / Copilot Student**
- Codex
- Claude Code
- another equivalent coding agent

> **Do not ask the AI coding agent to install anything or configure the environment for you.**

Use this prompt:

```text
Inspect this repository and its README.

Do not install anything.
Do not modify any files.
Do not create or change a virtual environment.

Based on the repository files, README, dependency files, and package version requirements:

1. Which Python version should I use for this project?
2. Which Python version is least likely to cause dependency conflicts?

Give me one recommended Python version and briefly explain why.
```

Then create the local virtual environment yourself.

If the project works with your default Python:

```bash
uv venv
```

If a specific Python version is recommended:

```bash
uv venv --python 3.10
```

Replace `3.10` with the recommended version.

Activate the environment:

```bash
source .venv/bin/activate
```

Check where you are and which Python you are using:

```bash
pwd
which python
python --version
```

Your `which python` output should point to the `.venv` inside this repository.

## Decide How to Install the Dependencies

Now ask the AI coding agent to inspect how the repository expects its dependencies to be installed.

Use this prompt:

```text
Based on the repository files and README, which installation command
should I run manually?

For example:

uv sync

or

uv pip install -r requirements.txt

or another repository-specific command.

Do not run the installation command.
Do not install anything.
Do not modify any files.

Tell me the recommended command and briefly explain why.
```

Then run the recommended installation command yourself.

If the repository already has a suitable `pyproject.toml`:

```bash
uv sync
```

If the repository provides a `requirements.txt`:

```bash
uv pip install -r requirements.txt
```

### What if there is no dependency file?

Some repositories may not provide either:

```text
pyproject.toml
requirements.txt
```

In that case, do **not** start installing packages one by one at random.

Ask the AI coding agent to inspect the repository code and README and propose a minimal `requirements.txt` for the pretrained inference task.

Use this prompt:

```text
This repository does not contain a pyproject.toml or requirements.txt.

Inspect the README, import statements, installation instructions,
and the code needed for pretrained inference.

Do not install anything.
Do not modify any files.

Tell me what should be included in a new requirements.txt so that I can
run the repository's pretrained inference.

Include only the packages that are actually required.

If the repository indicates specific package versions, preserve them.
If a version cannot be determined from the repository, do not invent
an exact version unless compatibility requires one.

Return the proposed contents of requirements.txt and briefly explain
where each dependency came from.
```

Review the suggested dependencies before creating the file.

Then create `requirements.txt` and install it manually:

```bash
uv pip install -r requirements.txt
```

> **Inspect first. Create the environment second. Install dependencies third.**

> **Let the repository define the environment whenever possible. Reproduce first. Modernise later.**

---

# 3. Ask for an Inference Command — Do Not Let the Agent Run It

Once the environment is ready, use the AI coding agent to help you **find the correct inference command**.

The AI coding agent should inspect the repository and explain what to run, but **you should run the command yourself**.

Use this prompt:

```text
Give me one command to reproduce one pretrained inference in this repository.

Do not run the command.
Do not install anything.
Do not modify any files.

Before giving me the command, tell me:

1. which pretrained model / checkpoint is required;
2. where the checkpoint should be placed;
3. what example input I can use;
4. what output I should expect;
5. where the output will be saved.

Then give me one inference command to run manually.

Use the repository's own scripts and instructions where possible.
Do not train the model.
```

Before running the command yourself, check:

```text
[ ] the checkpoint exists
[ ] the input path exists
[ ] the command matches the repository README
[ ] I know where the output should appear
```

> **The AI coding agent suggests. You execute and verify.**

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

When a command fails, **do not immediately install another package**.

Copy both:

1. the exact command you ran;
2. the complete error message.

Then send them to your AI coding agent:

```text
I ran this command:

<PASTE THE EXACT COMMAND>

It failed with this error:

<PASTE THE COMPLETE ERROR>

Do not run anything.
Do not install anything.
Do not modify any files.

Please:

1. classify the error as one of:
   DEPENDENCY
   PYTHON VERSION
   CHECKPOINT / ASSET
   PATH
   DEVICE / CUDA
   COMMAND / CONFIG

2. identify the most likely root cause;

3. suggest the smallest fix;

4. explain why that fix addresses this error.

If there is not enough information, tell me which read-only command
I should run to collect the missing information.
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
command + error
      ↓
ask AI to classify
      ↓
find root cause
      ↓
choose the smallest fix
      ↓
you run the fix
      ↓
run the inference again
      ↓
verify output
```

> **Do not ask the AI coding agent to "fix everything". Diagnose one failure at a time.**

---

# 5. Project Lottery

The instructor demo uses [ultralytics/yolov5](https://github.com/ultralytics/yolov5).

You will receive **one unfamiliar AI repository** to reproduce yourself.

| ID | Repository | Task |
|---|---|---|
| **A** | [DepthAnything/Depth-Anything-V2](https://github.com/DepthAnything/Depth-Anything-V2) | Depth estimation |
| **B** | [facebookresearch/segment-anything](https://github.com/facebookresearch/segment-anything) | Image segmentation |
| **C** | [xinntao/Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) | Image super-resolution |
| **D** | [junyanz/pytorch-CycleGAN-and-pix2pix](https://github.com/junyanz/pytorch-CycleGAN-and-pix2pix) | Image-to-image translation |
| **E** | [TencentARC/GFPGAN](https://github.com/TencentARC/GFPGAN) | Face restoration |
| **F** | [richzhang/colorization](https://github.com/richzhang/colorization) | Image colorization |

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

## Step 5 — Check What Changed

```bash
git status
git diff
```

You should know what changed during deployment and why.

The AI coding agent should not make changes for you in this workshop.

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
git clone <repository-url> <repository-name>_fresh
cd <repository-name>_fresh
```

This gives you a new copy of the repository, separate from the one you used in class.

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

Inference task:
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
Which AI coding agent did you use?:

What advice did it give?:

What command or fix did you choose to run yourself?:

How did you verify the result?:
```

---

## Part 2 — Peer Reproduction

Exchange your README with another student.

Your partner must start from a **fresh clone** and try to reproduce your result using **only your README**.

Do not give extra instructions unless the README is incomplete.

The reviewer records:

```text
**Reviewer:**

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
