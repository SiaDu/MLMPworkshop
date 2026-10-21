"""Load numbered teaching scripts without running their command-line entry points."""
import importlib.util
from functools import lru_cache
from pathlib import Path


@lru_cache(maxsize=3)
def load_script(root: str, number: str):
    names = {
        "04": "04_research_agent.py",
        "05": "05_rag.py",
        "06": "06_pdf_finder.py",
    }
    if number not in names:
        raise ValueError("Only Sections 04–06 can be reused.")
    location = Path(root) / names[number]
    spec = importlib.util.spec_from_file_location("workshop_legacy_" + number, location)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot import {location}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
