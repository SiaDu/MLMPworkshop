**Project**

Repository: https://github.com/ultralytics/yolov5

Inference task: Object detection

**Repo map**

Environment: pyproject.toml & requirements.txt

Entry point: detect.py

Model: The detect.py automatically downloads models from the latest YOLOv5 release 

Input: data/images/

Output: run/detect/exp

**Environment setup**
```text
git clone https://github.com/ultralytics/yolov5
cd yolov5
uv python install 3.10
uv venv --python 3.10
source .venv/bin/activate
uv pip install -r requirements.txt
```

**Inference** 
```text
python detect.py --weights yolov5s.pt --source '/home/sdu/Desktop/workshop02_projects/yolov5/data/images/test.jpg'
```

**One real failure**

Category: Version conflict

Root cause: the full declared dependency set is not resolvable for Python 3.8 because the optional export extra includes keras>=3.5.0,<=3.12.0, which requires Python >=3.9 / >=3.10 depending on version. So the effective minimum for the full dependency set is Python 3.9+, while the repo metadata still says >=3.8.

Minimal fix: change to Python 3.10

**AI agent check**

Which AI coding agent did you use?: copilot

What did it change?: only venv python version

How did you verify the change?: I asked it to do this