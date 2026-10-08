"""
Workshop 03 — Section 2A: Your first Gemini API call.

Student task:
1. Run this file once.
2. Change TOPIC to your own AI for Media survey topic.
3. Run it again and compare the answers.
"""

import os  # Lets Python read environment variables, including the API key.

from google import genai  # Imports the Google Gemini Python library.


# Change this topic to something relevant to your own survey.
TOPIC = "AI facial animation"

# The model name identifies which Gemini model should answer our request.
MODEL = "gemini-3.5-flash-lite"


# Check that the API key exists WITHOUT showing the secret in the terminal.
if not os.getenv("GEMINI_API_KEY"):
    raise SystemExit(
        "GEMINI_API_KEY is missing. Follow the README to configure it."
    )

# Make a client. It reads GEMINI_API_KEY from the environment automatically.
# Important: this line alone DOES NOT test whether the key is valid.
client = genai.Client()

# This is the text we send to the model (the prompt).
prompt = (
    f"Suggest exactly three different academic search queries about {TOPIC}. "
    "Write a short numbered list. Do not invent paper titles or references."
)

print("Topic:", TOPIC)
print("Sending the first request to Gemini...")

# This call sends the prompt over the internet to the selected Gemini model.
# An actual API request is needed to confirm that the key/model works.
response = client.models.generate_content(
    model=MODEL,
    contents=prompt,
)

# Print the natural-language response returned by Gemini.
print("\n--- Model response ---")
print(response.text)

# Token counts let us see how much text was processed.
# These values are usage information, not monetary cost.
if response.usage_metadata:
    usage = response.usage_metadata
    print("\n--- Token usage ---")
    print("Input tokens:", usage.prompt_token_count)
    print("Output tokens:", usage.candidates_token_count)
