"""
Workshop 03 — Section 2B: Ask Gemini for a structured JSON SearchPlan.

Student task:
1. Run this file.
2. Change TOPIC to your survey topic and run it again.
3. Find search_plan.json. This file will help with the next section.
Optional: add a 'research_focus: str' field to SearchPlan.
"""

import os  # Reads the GEMINI_API_KEY environment variable.
from datetime import date  # Gets the current year for a simple check.
from pathlib import Path  # Helps save our JSON output to a file.

from google import genai  # The official Google Gemini Python SDK.
from google.genai import types  # Configuration options for Gemini.
from pydantic import BaseModel, Field  # Define and describe a data schema.


# EDIT THIS: use your own survey topic.
TOPIC = "AI facial animation"
MODEL = "gemini-3.5-flash-lite"


# A Pydantic class defines the exact fields that Python expects.
# This is NOT an LLM agent or a paper-search function.
class SearchPlan(BaseModel):
    # str = a piece of text, such as "AI facial animation".
    topic: str = Field(description="The student's academic survey topic")

    # list[str] = a list of text strings (search queries).
    search_queries: list[str] = Field(
        description="Three distinct queries suitable for academic paper search"
    )

    # int = an integer, such as 2022.
    start_year: int = Field(
        description="Earliest publication year to search from"
    )


# Stop with a useful message if the student's key is not configured.
if not os.getenv("GEMINI_API_KEY"):
    raise SystemExit("Missing GEMINI_API_KEY. See the README.")

# Set up our API client; the key comes from the environment.
client = genai.Client()

# Tell Gemini what we need. The schema below enforces the data FORMAT.
prompt = (
    f"Create a literature search plan for the topic: {TOPIC}. "
    "Give exactly three different academic search queries. "
    "Focus on publications from 2022 onwards. "
    "Do not invent specific paper titles or citations."
)

# Request JSON whose fields follow our Pydantic model.
response = client.models.generate_content(
    model=MODEL,
    contents=prompt,
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_json_schema=SearchPlan.model_json_schema(),
    ),
)

# A successful response should contain JSON text, not an empty response.
if not response.text:
    raise SystemExit("The model did not return any JSON text.")

# This checks the returned JSON against our expected Python field types.
# If a field is missing or the wrong type, Pydantic reports an error.
plan = SearchPlan.model_validate_json(response.text)

# Extra RULES for the lesson: correct JSON types are not enough.
# We also want EXACTLY three queries and a sensible publication year.
if len(plan.search_queries) != 3:
    raise ValueError("Expected exactly three search queries.")

if not (2000 <= plan.start_year <= date.today().year):
    raise ValueError("The start_year is outside the allowed range.")

# Convert the validated Python model back into neatly formatted JSON.
json_output = plan.model_dump_json(indent=2)

print("\n--- Validated SearchPlan (JSON) ---")
print(json_output)

# Demonstrate that Python can access each field directly.
print("\n--- Python can use individual fields ---")
print("Topic:", plan.topic)
print("First search query:", plan.search_queries[0])
print("Start year:", plan.start_year)

# Save this structured plan so the next lesson can reuse it.
output_file = Path("search_plan.json")
output_file.write_text(json_output + "\n", encoding="utf-8")
print("\nSaved file:", output_file.resolve())
