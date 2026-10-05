# Workshop 02 — AI Project Survival: Instructor Key

This file is **not** for projection during the lottery.

The six repositories below were screened against their current repository files and documented inference paths on 5 October 2026. Before class, run every assigned path once on the actual BU lab image/hardware: repository compatibility can change and hardware/network restrictions are environment-specific.

---

## Selection criteria

Each lottery repo should have:

- a public GitHub repository;
- pretrained inference (no training required);
- a small or manageable sample input;
- a clear observable output;
- no API key/account requirement;
- a Python-only setup path that can be managed with uv;
- a different environment/repository pattern from at least some of the other choices.

---

# A — ultralytics/yolov5

**Task:** object detection  
**Difficulty:** Easy  
**Why it is useful:** modern `pyproject.toml`, clear script entry point, bundled example images, automatic weight download.

Repository:
https://github.com/ultralytics/yolov5

Useful files:

```text
pyproject.toml
requirements.txt
detect.py
data/images/bus.jpg
data/images/zidane.jpg
```

Suggested target:

```text
Input:  data/images/bus.jpg
Model:  yolov5n.pt
Output: runs/detect/...
```

Instructor preflight candidate:

```bash
git clone https://github.com/ultralytics/yolov5.git
cd yolov5
uv sync
uv run python detect.py --weights yolov5n.pt --source data/images/bus.jpg
```

Expected lesson:

```text
PEP-style pyproject → uv sync → uv run
weights can be downloaded automatically
```

---

# B — danielgatis/rembg

**Task:** image background removal  
**Difficulty:** Easy–Medium  
**Why it is useful:** `pyproject.toml` exists, but it uses Poetry metadata rather than a standard `[project]` dependency table. This prevents students from learning the false rule “pyproject.toml always means uv sync”.

Repository:
https://github.com/danielgatis/rembg

Useful files:

```text
pyproject.toml
examples/animal-1.jpg
examples/girl-1.jpg
examples/plants-1.jpg
```

Current documented Python range:

```text
>=3.11, <3.14
```

Suggested target:

```text
Input:  examples/animal-1.jpg
Model:  u2netp (small)
Output: output.png
```

Instructor preflight candidate:

```bash
git clone https://github.com/danielgatis/rembg.git
cd rembg
uv venv --python 3.11
uv pip install -e '.[cpu,cli]'
uv run rembg i -m u2netp examples/animal-1.jpg output.png
```

Expected lesson:

```text
inspect pyproject format before assuming uv project mode
optional dependency / extra
model download/cache can happen on first inference
```

---

# C — JaidedAI/EasyOCR

**Task:** optical character recognition  
**Difficulty:** Easy  
**Why it is useful:** classic research repo structure: `requirements.txt` + `setup.py`; model weights download automatically; CPU mode is explicitly supported.

Repository:
https://github.com/JaidedAI/EasyOCR

Useful files:

```text
requirements.txt
setup.py
examples/english.png
examples/chinese.jpg
```

Suggested target:

```text
Input:  examples/english.png
Language: en
Output: recognised text + bounding-box results
```

Instructor preflight candidate:

```bash
git clone https://github.com/JaidedAI/EasyOCR.git
cd EasyOCR
uv venv --python 3.11
uv pip install -e .
uv run python - <<'PY'
import easyocr
reader = easyocr.Reader(['en'], gpu=False)
print(reader.readtext('examples/english.png', detail=0))
PY
```

Expected lesson:

```text
setup.py / requirements-style project
CPU fallback
weights cached outside the repo
```

Optional extension: ask the group to save an annotated image instead of only terminal text.

---

# D — openai/CLIP

**Task:** image–text classification / similarity  
**Difficulty:** Easy–Medium  
**Why it is useful:** small dependency file, `setup.py`, bundled input image, automatic model download, output is a probability vector rather than a generated image.

Repository:
https://github.com/openai/CLIP

Useful files:

```text
requirements.txt
setup.py
CLIP.png
```

Suggested target:

```text
Input:  CLIP.png
Labels: "a diagram", "a dog", "a cat"
Model:  ViT-B/32
Output: label probabilities
```

Instructor preflight candidate:

```bash
git clone https://github.com/openai/CLIP.git
cd CLIP
uv venv --python 3.11
uv pip install -e .
```

Then run the short `ViT-B/32` example from the README using `CLIP.png`.

Expected lesson:

```text
not every inference produces a new media file
model checkpoint can be hidden behind a model-loading API
verification means interpreting the returned values
```

---

# E — DepthAnything/Depth-Anything-V2

**Task:** monocular depth estimation  
**Difficulty:** Medium  
**Why it is useful:** very clear image-to-image output, but students must notice that the checkpoint must be downloaded and placed at the exact path expected by `run.py`.

Repository:
https://github.com/DepthAnything/Depth-Anything-V2

Useful files:

```text
requirements.txt
run.py
assets/examples/demo01.jpg
checkpoints/
```

Use the **Small / vits** model for the workshop.

`run.py` currently expects:

```text
checkpoints/depth_anything_v2_vits.pth
```

Suggested target:

```text
Input:  assets/examples/demo01.jpg
Encoder: vits
Output: depth_vis/demo01.png
```

Instructor preflight candidate:

```bash
git clone https://github.com/DepthAnything/Depth-Anything-V2.git
cd Depth-Anything-V2
uv venv --python 3.11
uv pip install -r requirements.txt
```

Download the official **Depth-Anything-V2-Small** checkpoint and place it at:

```text
checkpoints/depth_anything_v2_vits.pth
```

Then:

```bash
uv run python run.py \
  --encoder vits \
  --img-path assets/examples/demo01.jpg \
  --outdir depth_vis
```

Expected lesson:

```text
checkpoint location is part of reproducibility
FileNotFoundError may be an asset/path problem, not a dependency problem
```

---

# F — timesler/facenet-pytorch

**Task:** face detection / face crop  
**Difficulty:** Medium  
**Why it is useful:** pretrained weights are downloaded automatically, but the repository pins a narrower PyTorch/TorchVision range. This makes Python/package compatibility visible without requiring CUDA.

Repository:
https://github.com/timesler/facenet-pytorch

Important dependency constraints in the current setup include:

```text
torch >=2.2.0, <=2.3.0
torchvision >=0.17.0, <=0.18.0
numpy <2.0.0
```

The repository includes example notebooks and a sample video, but for a 28-minute sprint give this group a small portrait image directly as the supplied input.

Suggested target:

```text
Input:  supplied_face.jpg
Model:  MTCNN
Output: face_crop.png
```

Instructor preflight candidate:

```bash
git clone https://github.com/timesler/facenet-pytorch.git
cd facenet-pytorch
uv venv --python 3.11
uv pip install -e .
```

Minimal inference script:

```python
from PIL import Image
from facenet_pytorch import MTCNN

img = Image.open('supplied_face.jpg').convert('RGB')
mtcnn = MTCNN(keep_all=True)
mtcnn(img, save_path='face_crop.png')
```

Expected lesson:

```text
Python/package compatibility matters
pretrained model assets can be downloaded automatically
inference entry point may be a library API rather than a repository script
```

---

# Difficulty balancing

Do **not** make the lottery completely blind if students have very different experience levels.

Suggested bands:

```text
A YOLOv5        Easy
C EasyOCR       Easy
B rembg         Easy–Medium
D CLIP          Easy–Medium
E DepthAnything Medium
F facenet       Medium
```

If you want a genuinely random draw, put students into pairs first and give each pair one project.

---

# Projects deliberately excluded

## OpenAI Whisper

Good project, but it requires the external `ffmpeg` executable. Do not use it unless `ffmpeg` is already installed on every lab machine.

## Real-ESRGAN

Very relevant to AI for Media, but its older dependency stack makes it better as a later debugging challenge than as a random Week 2 deployment task.

## MiDaS

Do not use it for this lottery: the original repository was archived in 2025. Depth Anything V2 provides a cleaner current depth-estimation task.

## Segment Anything (SAM v1)

Technically suitable, but automatic mask generation plus a relatively large checkpoint can make the 28-minute lottery more hardware-dependent than the six selected projects. Keep it as a backup/bonus repo if the lab GPU setup is confirmed.

---

# Before-class preflight — mandatory

Do this on the **same lab image/account type students will use**.

For every project:

```text
[ ] clone succeeds
[ ] chosen Python version can be created by uv
[ ] dependencies resolve without sudo
[ ] model/checkpoint downloads are reachable from the BU network
[ ] supplied input is available
[ ] inference finishes
[ ] expected output is produced
[ ] rerun works from a fresh environment
```

Record the exact working commit SHA:

```bash
git rev-parse HEAD
```

Then pin that SHA in the lottery sheet. Do not let six groups unknowingly test six moving `main` branches during class.
