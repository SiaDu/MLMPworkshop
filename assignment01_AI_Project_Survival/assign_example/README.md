**Project**

Repository URL: https://github.com/ultralytics/yolov5

Exact commit: [Insert the full commit SHA from `git rev-parse HEAD` on the version you actually used]

Inference task: Object detection

**Repo map**

Environment: pyproject.toml & requirements.txt

Entry point: detect.py

Model: The detect.py automatically downloads models from the latest YOLOv5 release 

Input: data/images/test.jpg (copied from `evidence/input.jpg`)

Output: runs/detect/exp*/test.jpg (the output folder number may vary)

**Environment setup**

This example assumes the `MLMPworkshop/` and `yolov5/` folders are siblings. Replace the commit placeholder below with the exact SHA recorded above.

```bash
git clone https://github.com/ultralytics/yolov5
cd yolov5
git checkout <exact-commit-sha>
uv python install 3.10
uv venv --python 3.10
source .venv/bin/activate
uv pip install -r requirements.txt
```

**Inference**

Copy the small input evidence file into the AI project's input folder, then run the pretrained model:

```bash
cp ../MLMPworkshop/assignment01_AI_Project_Survival/assign_example/evidence/input.jpg data/images/test.jpg
python detect.py --weights yolov5s.pt --source data/images/test.jpg
```

Check the generated image in `runs/detect/` and compare it with `evidence/output.jpg`.

**One real failure**

Category: Version conflict

Root cause: the full declared dependency set is not resolvable for Python 3.8 because the optional export extra includes keras>=3.5.0,<=3.12.0, which requires Python >=3.9 / >=3.10 depending on version. So the effective minimum for the full dependency set is Python 3.9+, while the repo metadata still says >=3.8.

Minimal fix: change to Python 3.10

**AI agent check**

Which AI coding agent did you use?: Copilot

What advice did it give?: Use Python 3.10 to avoid the dependency version conflict.

What command or fix did you apply yourself?: Created the virtual environment using `uv venv --python 3.10`.

How did you verify the result yourself?: [Record the actual checks performed, such as `python --version`, the inference command, and inspection of the output image. Asking the AI agent alone does not count as verification.]

> **Example note:** The exact commit and verification record above must be filled with observed details before this can count as a fully reproducible student submission.