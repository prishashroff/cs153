import os
from google import genai

# Initialize the modern client
# It will automatically pick up the GEMINI_API_KEY environment variable if set.
# Otherwise, pass it explicitly: client = genai.Client(api_key="YOUR_API_KEY")

client = genai.Client(api_key=os.environ.get("GCP_API_KEY"))
# Define the log contents you need parsed
activity_log = """
Analyze Your Day
1 logged activity: [Insert activity data here]
"""

print("Sending request to Gemini...")

# Call the unified generate_content method using a supported Pro model
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=activity_log,
)

print("\n--- Personal Insights & Recommendations ---")
print(response.text)
