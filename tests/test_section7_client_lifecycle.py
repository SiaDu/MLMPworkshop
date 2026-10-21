"""Regression tests for the Gemini client lifetime in Section 7.

No network or Gemini API key is needed. A mock chat uses a weak reference so
that a chat without an independently retained Client behaves like the real
reported "Cannot send a request, as the client has been closed" failure.
"""
import gc
import importlib
import io
import os
import runpy
import sys
import tempfile
import types
import unittest
import weakref
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

STARTER = (Path(__file__).resolve().parents[1]
           / "workshop03_Building_an_AI_Agent"
           / "literature_research_agent_starter")
sys.path.insert(0, str(STARTER))


class FakeChat:
    def __init__(self, client):
        self._client = weakref.ref(client)
        self.requests = []

    def send_message(self, text):
        client = self._client()
        if client is None or client.closed:
            raise RuntimeError("Cannot send a request, as the client has been closed.")
        self.requests.append(text)
        return types.SimpleNamespace(text="Completed.")


class FakeClient:
    def __init__(self):
        self.closed = False
        self.chats = FakeChats(self)

    def close(self):
        self.closed = True

    def __del__(self):
        self.close()


class FakeChats:
    def __init__(self, client):
        self.client_ref = weakref.ref(client)

    def create(self, *, model, config):
        client = self.client_ref()
        assert client is not None
        return FakeChat(client)


class LifecycleTests(unittest.TestCase):
    def test_create_agent_retains_client_for_chat(self):
        created = []

        def client_factory():
            client = FakeClient()
            created.append(weakref.ref(client))
            return client

        fake_genai = types.ModuleType("google.genai")
        fake_genai.Client = client_factory
        fake_types = types.ModuleType("google.genai.types")
        fake_types.GenerateContentConfig = lambda **kwargs: kwargs
        fake_types.AutomaticFunctionCallingConfig = lambda **kwargs: kwargs
        fake_genai.types = fake_types
        fake_google = types.ModuleType("google")
        fake_google.genai = fake_genai

        # Force a fresh import so the SDK mock is used even if the real module
        # was loaded earlier by another test.
        with patch.dict(sys.modules, {
            "google": fake_google,
            "google.genai": fake_genai,
            "google.genai.types": fake_types,
        }), patch.dict(os.environ, {"GEMINI_API_KEY": "test-only-key"}):
            sys.modules.pop("research_agent.agent", None)
            try:
                agent = importlib.import_module("research_agent.agent")
                client, chat = agent.create_agent(object())
                gc.collect()
                self.assertIsNotNone(created[0]())
                self.assertEqual(chat.send_message("Hi").text, "Completed.")
                self.assertFalse(client.closed)
                client.close()
                self.assertTrue(client.closed)
                with self.assertRaisesRegex(RuntimeError, "client has been closed"):
                    chat.send_message("Another message")
            finally:
                sys.modules.pop("research_agent.agent", None)

    def test_terminal_handles_multiple_turns_and_closes_client_on_exit(self):
        entry = runpy.run_path(str(STARTER / "07_research_agent.py"), run_name="_test_")
        main = entry["main"]
        created = []

        def create_agent(_pipeline, _model):
            client = FakeClient()
            created.append(client)
            return client, client.chats.create(model="fake", config={})

        fake_agent_module = types.ModuleType("research_agent.agent")
        fake_agent_module.create_agent = create_agent
        main.__globals__["ResearchPipeline"] = lambda root: object()
        with patch.dict(sys.modules, {"research_agent.agent": fake_agent_module}), \
                patch("sys.argv", ["07_research_agent.py"]), \
                patch("builtins.input", side_effect=[
                    "Show library status",
                    "Analyse only new paper.pdf",
                    "exit",
                ]), patch("os.chdir"), redirect_stdout(io.StringIO()) as output:
            main()
        self.assertEqual(created[0].closed, True)
        self.assertEqual(created[0].chats.client_ref(), created[0])
        self.assertEqual(output.getvalue().count("Agent: Completed."), 2)
        self.assertNotIn("[AGENT ERROR]", output.getvalue())

    def test_once_also_closes_client(self):
        entry = runpy.run_path(str(STARTER / "07_research_agent.py"), run_name="_test_once")
        main = entry["main"]
        client = FakeClient()
        fake_agent_module = types.ModuleType("research_agent.agent")
        fake_agent_module.create_agent = lambda pipeline, model: (
            client, client.chats.create(model="fake", config={})
        )
        main.__globals__["ResearchPipeline"] = lambda root: object()
        with patch.dict(sys.modules, {"research_agent.agent": fake_agent_module}), \
                patch("sys.argv", ["07_research_agent.py", "--once", "Show my status"]), \
                patch("os.chdir"), redirect_stdout(io.StringIO()) as output:
            main()
        self.assertTrue(client.closed)
        self.assertIn("Agent: Completed.", output.getvalue())


if __name__ == "__main__":
    unittest.main()
