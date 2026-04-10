"""
IPL 2026 Live Data Updater — AI-powered via Claude API + web search.

Reads the current public/ipl2026.json, uses Claude with web_search to find
the latest IPL 2026 match results, and outputs an updated JSON covering:
  - meta (matchesPlayed, lastUpdated)
  - pointsTable (ranks, W/L/NR, NRR, points, form)
  - recentResults (all match results with scores, venue, highlights)
  - upcomingFixtures (next 7 upcoming matches)
  - orangeCap (top 5 run scorers)
  - purpleCap (top 5 wicket takers)
  - storylines (AI-generated narratives)

Usage:
  export ANTHROPIC_API_KEY=sk-ant-...
  python pipeline/update_2026.py
"""

import json
import os
import sys
from datetime import date
from pathlib import Path

try:
    import anthropic
except ImportError:
    print("Error: 'anthropic' package not installed.")
    print("Run: pip install anthropic")
    sys.exit(1)

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
PUBLIC_JSON = ROOT / "public" / "ipl2026.json"

# ── Schema definition for validation ─────────────────────────────────────────
REQUIRED_TOP_KEYS = {
    "meta", "groups", "pointsTable", "captains", "recentResults",
    "upcomingFixtures", "orangeCap", "purpleCap", "storylines", "auctionHighlights",
}
REQUIRED_META_KEYS = {
    "edition", "title", "season", "startDate", "endDate",
    "totalMatches", "matchesPlayed", "defendingChampion", "lastUpdated",
}


def load_current() -> dict:
    """Load the current ipl2026.json."""
    if not PUBLIC_JSON.exists():
        print(f"Error: {PUBLIC_JSON} not found.")
        sys.exit(1)
    with open(PUBLIC_JSON, "r") as f:
        return json.load(f)


def build_prompt(current_data: dict) -> str:
    """Build the update prompt with current data as context."""
    current_json = json.dumps(current_data, indent=2)
    today_str = date.today().isoformat()

    return f"""You are an IPL 2026 data analyst. Your job is to update the live season JSON file
with the latest match results, standings, and statistics.

## Current data (as of {current_data['meta']['lastUpdated']}):
```json
{current_json}
```

## Today's date: {today_str}

## Instructions:
1. Use web_search to find IPL 2026 match results that occurred AFTER the last update date ({current_data['meta']['lastUpdated']}).
2. Search for: "IPL 2026 results {today_str}", "IPL 2026 points table", "IPL 2026 orange cap purple cap"
3. Update ALL sections of the JSON with the latest data:

   - **meta.matchesPlayed**: Update the count
   - **meta.lastUpdated**: Set to "{today_str}"
   - **pointsTable**: Recalculate ranks sorted by points (desc), then NRR (desc). Update W/L/NR/form arrays.
   - **recentResults**: Add new match results. Each needs: matchNo, date, team1, team2, result, venue, t1Score, t2Score, highlight
   - **upcomingFixtures**: Remove any matches that have been played. Keep next 7 upcoming.
   - **orangeCap**: Top 5 run scorers with: rank, player, team (short code), runs, innings, hs, avg, sr
   - **purpleCap**: Top 5 wicket takers with: rank, player, team (short code), wickets, innings, bbi, economy
   - **storylines**: Generate 4-6 fresh narratives about the season. Each needs: id, title, body, tag.
     Tags: "On Fire", "Sensation", "Crisis", "Under Pressure", "Historic", "Breakout"

4. Keep these sections UNCHANGED: groups, captains, auctionHighlights

5. If NO new matches have been played since the last update, return the data unchanged but set lastUpdated to today.

## CRITICAL OUTPUT FORMAT:
- Your response must be ONLY the JSON object. No text before it. No text after it. No markdown fences.
- Start your response with {{ and end with }}
- Do NOT include any explanation, commentary, or preamble — ONLY the raw JSON.
- Maintain the exact same schema structure as the input.
- All team names must be full official names (e.g., "Royal Challengers Bengaluru", not "RCB").
- NRR should be a string with sign (e.g., "+1.234" or "-0.567").
- form arrays should contain "W", "L", or "N" strings.
"""


def call_claude(prompt: str) -> str:
    """Call Claude API with web_search tool and return the response text."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    print("Calling Claude API with web search...")
    print(f"  SDK version: {anthropic.__version__}")

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=16000,
            tools=[{"type": "web_search_20250305", "name": "web_search"}],
            messages=[
                {"role": "user", "content": prompt},
            ],
        )
    except anthropic.APIError as e:
        print(f"\nAPI Error: {e.status_code} - {e.message}")
        print(f"  Type: {type(e).__name__}")
        sys.exit(1)
    except Exception as e:
        print(f"\nUnexpected error calling Claude API: {type(e).__name__}: {e}")
        sys.exit(1)

    print(f"  Stop reason: {response.stop_reason}")
    print(f"  Usage: {response.usage.input_tokens} input, {response.usage.output_tokens} output tokens")

    # Extract text content from response
    result_text = ""
    for block in response.content:
        if block.type == "text":
            result_text += block.text

    if not result_text:
        print("\nError: Claude returned no text content.")
        print(f"  Content blocks: {[b.type for b in response.content]}")
        sys.exit(1)

    return result_text.strip()


def extract_json(text: str) -> dict:
    """Extract JSON from Claude's response, handling preamble text and markdown fences."""
    # Strip markdown code fences if present
    if "```json" in text:
        text = text.split("```json", 1)[1]
        text = text.rsplit("```", 1)[0]
        return json.loads(text.strip())
    elif "```" in text:
        text = text.split("```", 1)[1]
        text = text.rsplit("```", 1)[0]
        return json.loads(text.strip())

    # Try parsing as-is first
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Find the first '{' and last '}' — extract the JSON object from surrounding text
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return json.loads(text[start:end + 1])

    raise json.JSONDecodeError("No JSON object found in response", text, 0)


def validate_output(data: dict) -> list[str]:
    """Validate the output JSON against the expected schema. Returns list of errors."""
    errors = []

    # Check top-level keys
    missing = REQUIRED_TOP_KEYS - set(data.keys())
    if missing:
        errors.append(f"Missing top-level keys: {missing}")

    # Check meta
    if "meta" in data:
        meta_missing = REQUIRED_META_KEYS - set(data["meta"].keys())
        if meta_missing:
            errors.append(f"Missing meta keys: {meta_missing}")

    # Check pointsTable
    if "pointsTable" in data:
        if not isinstance(data["pointsTable"], list):
            errors.append("pointsTable must be a list")
        elif len(data["pointsTable"]) < 10:
            errors.append(f"pointsTable has {len(data['pointsTable'])} entries, expected 10")
        else:
            for entry in data["pointsTable"]:
                for key in ["rank", "team", "short", "color", "played", "won", "lost", "nrr", "points", "form"]:
                    if key not in entry:
                        errors.append(f"pointsTable entry missing '{key}': {entry.get('team', '?')}")
                        break

    # Check recentResults
    if "recentResults" in data:
        if not isinstance(data["recentResults"], list):
            errors.append("recentResults must be a list")

    # Check orangeCap / purpleCap
    for cap in ["orangeCap", "purpleCap"]:
        if cap in data and not isinstance(data[cap], list):
            errors.append(f"{cap} must be a list")

    # Check storylines
    if "storylines" in data:
        if not isinstance(data["storylines"], list):
            errors.append("storylines must be a list")
        else:
            for s in data["storylines"]:
                for key in ["id", "title", "body", "tag"]:
                    if key not in s:
                        errors.append(f"storyline missing '{key}'")
                        break

    return errors


def save_output(data: dict, original: dict):
    """Save updated JSON and print a diff summary."""
    old_matches = original["meta"]["matchesPlayed"]
    new_matches = data["meta"]["matchesPlayed"]
    old_results = len(original["recentResults"])
    new_results = len(data["recentResults"])

    print(f"\n{'='*50}")
    print(f"Update Summary")
    print(f"{'='*50}")
    print(f"  Last updated:    {original['meta']['lastUpdated']} → {data['meta']['lastUpdated']}")
    print(f"  Matches played:  {old_matches} → {new_matches} (+{new_matches - old_matches})")
    print(f"  Results:         {old_results} → {new_results} (+{new_results - old_results})")
    print(f"  Storylines:      {len(data.get('storylines', []))}")

    if data.get("orangeCap"):
        print(f"  Orange Cap:      {data['orangeCap'][0]['player']} ({data['orangeCap'][0].get('runs', '?')} runs)")
    if data.get("purpleCap"):
        print(f"  Purple Cap:      {data['purpleCap'][0]['player']} ({data['purpleCap'][0].get('wickets', '?')} wkts)")

    with open(PUBLIC_JSON, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"\nWritten to {PUBLIC_JSON}")


def main():
    print(f"IPL 2026 Live Data Updater")
    print(f"{'='*50}")

    # Load current data
    current = load_current()
    print(f"Current data: {current['meta']['matchesPlayed']} matches, last updated {current['meta']['lastUpdated']}")

    # Build prompt and call Claude
    prompt = build_prompt(current)
    raw_response = call_claude(prompt)

    # Parse response
    try:
        updated = extract_json(raw_response)
    except json.JSONDecodeError as e:
        print(f"\nError: Failed to parse Claude's response as JSON: {e}")
        print(f"Raw response (first 500 chars):\n{raw_response[:500]}")
        sys.exit(1)

    # Validate
    errors = validate_output(updated)
    if errors:
        print(f"\nValidation errors ({len(errors)}):")
        for err in errors:
            print(f"  - {err}")
        print("\nAborting — fix the issues and retry.")
        sys.exit(1)

    print("Validation passed.")

    # Preserve unchanged sections from original
    for key in ["groups", "captains", "auctionHighlights"]:
        if key in current:
            updated[key] = current[key]

    # Save
    save_output(updated, current)
    print("Done!")


if __name__ == "__main__":
    main()
