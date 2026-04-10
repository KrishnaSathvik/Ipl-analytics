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
    last_update = current_data['meta']['lastUpdated']
    matches_played = current_data['meta']['matchesPlayed']

    # Get last match number from recent results
    last_match_no = 0
    if current_data.get("recentResults"):
        last_match_no = max(r.get("matchNo", 0) for r in current_data["recentResults"])

    return f"""You are a meticulous IPL 2026 data analyst. Your job is to find ACCURATE, VERIFIED data
from the web and update the season JSON. Accuracy is critical — do NOT guess or fabricate any statistics.

## Today's date: {today_str}
## Last update: {last_update} (after Match #{last_match_no}, {matches_played} matches played)

## STEP 1 — SEARCH FOR DATA (do ALL of these searches):
You MUST perform these specific web searches to gather accurate data:

1. Search "IPL 2026 results schedule" — find ALL match results after Match #{last_match_no}
2. Search "IPL 2026 points table {today_str}" — get the EXACT current standings with NRR
3. Search "IPL 2026 orange cap most runs {today_str}" — get top 5 run scorers with exact stats
4. Search "IPL 2026 purple cap most wickets {today_str}" — get top 5 wicket takers with exact stats
5. Search "IPL 2026 upcoming fixtures schedule" — get next 7 upcoming matches

For each search, extract ONLY verified facts. If you cannot find exact data for a field, keep the existing value from the current JSON rather than guessing.

## STEP 2 — UPDATE THE JSON:
Take the current JSON below and update it with the data you found:

```json
{current_json}
```

### Update rules per section:

**meta**: Update matchesPlayed count and set lastUpdated to "{today_str}".

**pointsTable**: Must have EXACTLY 10 teams. For each team provide:
  - rank (1-10, sorted by points desc, then NRR desc)
  - team (full name), short (code), color (keep existing hex)
  - played, won, lost, nr (no result count)
  - nrr (string with sign like "+1.234" or "-0.567" — get EXACT value from web)
  - points (2 per win, 1 per no-result, 0 per loss)
  - form (array of last 5 results: "W", "L", or "N", most recent LAST)
  CRITICAL: Points = won*2 + nr*1. Verify this math. played = won + lost + nr.

**recentResults**: Keep ALL existing results. APPEND new ones after Match #{last_match_no}.
  Each result needs: matchNo, date (YYYY-MM-DD), team1, team2, result, venue, t1Score, t2Score, highlight.
  - t1Score/t2Score format: "185/6 (20)" or "N/A" for abandoned.
  - highlight: one-liner about the match (key performer, dramatic finish, etc.)

**upcomingFixtures**: List the next 7 matches NOT yet played. Each needs:
  matchNo, date (YYYY-MM-DD), team1, team2, venue, time ("7:30 PM IST" or "3:30 PM IST").

**orangeCap**: Top 5 run scorers. Each needs: rank, player, team (short code), runs, innings, hs, avg, sr.
  Get EXACT stats from search results. Do not round or estimate.

**purpleCap**: Top 5 wicket takers. Each needs: rank, player, team (short code), wickets, innings, bbi, economy.
  Get EXACT stats from search results. Do not round or estimate.

**storylines**: Generate 4-6 narratives based on ACTUAL events from the matches you found. Each needs: id, title, body, tag.
  Tags: "On Fire", "Sensation", "Crisis", "Under Pressure", "Historic", "Breakout".
  IMPORTANT: Storylines must reference SPECIFIC recent matches, player performances, and team streaks.
  Examples of good storylines:
    - A team's winning/losing streak with specific match references
    - A breakout player performance in a recent match (name, score, opponent)
    - A captain's form slump or revival with stats
    - A record broken or milestone achieved in a specific match
  Do NOT write generic storylines. Every storyline must cite at least one specific match or stat.

**Keep UNCHANGED**: groups, captains, auctionHighlights — do not modify these.

## STEP 3 — OUTPUT:
Return ONLY the complete updated JSON object.
- Start your response directly with {{ — no text, no explanation, no markdown fences before it.
- End with }} — no text after it.
- Every field must be present. Use existing values for any data you could not verify.
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


def validate_output(data: dict, original: dict) -> list[str]:
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
                # Validate points math: points = won*2 + nr*1
                if all(k in entry for k in ["won", "lost", "points"]):
                    nr = entry.get("nr", 0)
                    expected_pts = entry["won"] * 2 + nr
                    if entry["points"] != expected_pts:
                        errors.append(
                            f"pointsTable math error for {entry.get('team', '?')}: "
                            f"won={entry['won']}, nr={nr}, points={entry['points']} "
                            f"(expected {expected_pts})"
                        )

    # Check recentResults — must not lose existing results
    if "recentResults" in data:
        if not isinstance(data["recentResults"], list):
            errors.append("recentResults must be a list")
        elif len(data["recentResults"]) < len(original.get("recentResults", [])):
            errors.append(
                f"recentResults shrunk from {len(original['recentResults'])} to {len(data['recentResults'])} — "
                "new results should be appended, not replace existing"
            )

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

    print(f"\n{'='*60}")
    print(f"  Update Summary")
    print(f"{'='*60}")
    print(f"  Last updated:    {original['meta']['lastUpdated']} → {data['meta']['lastUpdated']}")
    print(f"  Matches played:  {old_matches} → {new_matches} (+{new_matches - old_matches})")
    print(f"  Results:         {old_results} → {new_results} (+{new_results - old_results})")
    print(f"  Storylines:      {len(data.get('storylines', []))}")

    if data.get("orangeCap"):
        oc = data['orangeCap'][0]
        print(f"  Orange Cap:      {oc['player']} ({oc.get('team', '?')}) — {oc.get('runs', '?')} runs")
    if data.get("purpleCap"):
        pc = data['purpleCap'][0]
        print(f"  Purple Cap:      {pc['player']} ({pc.get('team', '?')}) — {pc.get('wickets', '?')} wkts")

    # Print points table summary
    print(f"\n  {'Rank':<5} {'Team':<30} {'P':>3} {'W':>3} {'L':>3} {'NR':>3} {'Pts':>4} {'NRR':>8}")
    print(f"  {'─'*60}")
    for row in data.get("pointsTable", []):
        print(f"  {row.get('rank', '?'):<5} {row.get('team', '?'):<30} "
              f"{row.get('played', '?'):>3} {row.get('won', '?'):>3} "
              f"{row.get('lost', '?'):>3} {row.get('nr', 0):>3} "
              f"{row.get('points', '?'):>4} {row.get('nrr', '?'):>8}")

    with open(PUBLIC_JSON, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"\n  Written to {PUBLIC_JSON}")
    print(f"{'='*60}")


def main():
    print(f"IPL 2026 Live Data Updater")
    print(f"{'='*60}")

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
    errors = validate_output(updated, current)
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
