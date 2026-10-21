"""Section 7 — Complete Literature Research Agent (terminal chat).

Examples:
  python 07_research_agent.py
  python 07_research_agent.py --once "Show my research library status"
  python 07_research_agent.py --status   # Local-only, no Gemini API call

You can drop a PDF into papers/ and ask the running agent to analyse it.
State and method_comparison.csv persist between terminal sessions.
"""
import argparse
import os
from pathlib import Path

from research_agent.pipeline import ResearchPipeline


def parse_args():
    parser = argparse.ArgumentParser(description="Natural-language literature research agent.")
    parser.add_argument("--once", type=str, help="Run one natural-language request, then exit.")
    parser.add_argument("--status", action="store_true",
                        help="Show local library status without using Gemini.")
    parser.add_argument("--model", default=None, help="Override GEMINI_MODEL.")
    return parser.parse_args()


def main():
    args = parse_args()
    root = Path(__file__).resolve().parent
    # Previous teaching scripts use relative data paths. Preserve that behavior
    # even if the student launches this script from a different directory.
    os.chdir(root)
    pipeline = ResearchPipeline(root)

    if args.status:
        for key, value in pipeline.status().items():
            print(f"{key}: {value}")
        return

    # Lazy import keeps --status usable without Gemini dependencies/API access.
    from research_agent.agent import create_agent
    chat = create_agent(pipeline, args.model)

    def respond(text):
        if not text.strip():
            return
        try:
            message = chat.send_message(text)
            print("\nAgent:", message.text or "[No text response; check tool results.]")
        except Exception as exc:
            print(f"\n[AGENT ERROR] {type(exc).__name__}: {exc}")
            print("Your local files are preserved. You can try another request.")

    if args.once is not None:
        respond(args.once)
        return

    print("\nLiterature Research Agent — Section 7")
    print("Search papers, download open PDFs, analyse papers, or update the method table.")
    print("You can add a PDF to papers/ and ask to analyse only that file.")
    print("Type 'exit' or 'quit' to stop; 'help' for examples.\n")
    while True:
        try:
            request = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n[EXIT] Bye.")
            break
        if request.casefold() in {"exit", "quit"}:
            print("[EXIT] Bye.")
            break
        if request.casefold() == "help":
            print("Examples:\n"
                  "  Find 10 papers about speech-driven facial animation since 2022.\n"
                  "  Download the open PDFs from papers.csv.\n"
                  "  Analyse all unprocessed PDFs and update the method table.\n"
                  "  I added new_paper.pdf to papers/. Analyse only that PDF.\n"
                  "  Analyse the only new PDF I added.\n"
                  "  Show download failures and manual URLs.\n"
                  "  Show my research library status.")
            continue
        respond(request)


if __name__ == "__main__":
    main()
