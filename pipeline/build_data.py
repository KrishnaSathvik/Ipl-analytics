"""
IPL Analytics Hub — Phase 0 Data Pipeline
Processes IPL.csv and outputs 9 JSON files for the frontend.
"""

import pandas as pd
import numpy as np
import json
import re
import os
from collections import defaultdict

# ── Output directories ────────────────────────────────────────────────────────
# Defaults assume the script is run from the repo root.
REPO_ROOT = os.environ.get("IPL_REPO_ROOT", os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
SRC_DATA  = os.environ.get("IPL_SRC_DATA", os.path.join(REPO_ROOT, "src", "data"))
PUBLIC    = os.environ.get("IPL_PUBLIC",   os.path.join(REPO_ROOT, "public"))
CSV_PATH  = os.environ.get("IPL_CSV",      os.path.join(REPO_ROOT, "IPL.csv"))
os.makedirs(SRC_DATA, exist_ok=True)
os.makedirs(PUBLIC,   exist_ok=True)

# ── Load CSV ──────────────────────────────────────────────────────────────────
print(f"Loading {CSV_PATH} …")
df = pd.read_csv(CSV_PATH, low_memory=False)
print(f"  Loaded {len(df):,} rows × {len(df.columns)} columns")

# ── Team name canonicalisation ────────────────────────────────────────────────
TEAM_MAP = {
    # Royal Challengers
    "Royal Challengers Bangalore":  "Royal Challengers Bengaluru",
    "Royal Challengers Bengaluru":  "Royal Challengers Bengaluru",
    # Delhi
    "Delhi Daredevils":             "Delhi Capitals",
    "Delhi Capitals":               "Delhi Capitals",
    # Punjab
    "Kings XI Punjab":              "Punjab Kings",
    "Punjab Kings":                 "Punjab Kings",
    # Pune (defunct)
    "Rising Pune Supergiant":       "Rising Pune Supergiant",
    "Rising Pune Supergiants":      "Rising Pune Supergiant",
    # Deccan (defunct)
    "Deccan Chargers":              "Deccan Chargers",
    # Kochi (defunct)
    "Kochi Tuskers Kerala":         "Kochi Tuskers Kerala",
    # Gujarat
    "Gujarat Lions":                "Gujarat Lions",
    "Gujarat Titans":               "Gujarat Titans",
    # Sunrisers
    "Sunrisers Hyderabad":          "Sunrisers Hyderabad",
    # Remaining pass-through
    "Chennai Super Kings":          "Chennai Super Kings",
    "Mumbai Indians":               "Mumbai Indians",
    "Kolkata Knight Riders":        "Kolkata Knight Riders",
    "Rajasthan Royals":             "Rajasthan Royals",
    "Lucknow Super Giants":         "Lucknow Super Giants",
}

def canon_team(name):
    if pd.isna(name):
        return name
    return TEAM_MAP.get(str(name).strip(), str(name).strip())

df["batting_team"]  = df["batting_team"].apply(canon_team)
df["bowling_team"]  = df["bowling_team"].apply(canon_team)
df["toss_winner"]   = df["toss_winner"].apply(canon_team)
df["match_won_by"]  = df["match_won_by"].apply(canon_team)

# ── Player name canonicalisation ──────────────────────────────────────────────
# The raw CSV uses cricket-style initials ("V Kohli", "SV Samson"). The frontend
# prefers full names for well-known players ("Virat Kohli", "Sanju Samson").
# pipeline/player_name_map.json stores this crosswalk — apply it everywhere a
# player name is emitted.
_name_map_path = os.path.join(os.path.dirname(__file__), "player_name_map.json")
try:
    with open(_name_map_path) as _f:
        PLAYER_NAME_MAP = json.load(_f)
    print(f"  Loaded player_name_map.json ({len(PLAYER_NAME_MAP)} entries)")
except FileNotFoundError:
    PLAYER_NAME_MAP = {}
    print("  (no player_name_map.json found — player names will use CSV initials)")

def canon_player(name):
    if pd.isna(name) or name is None:
        return name
    return PLAYER_NAME_MAP.get(str(name), str(name))

# Apply to all player-name columns so every downstream aggregation is consistent.
for _col in ("batter", "bowler", "non_striker", "player_of_match", "player_out"):
    if _col in df.columns:
        df[_col] = df[_col].apply(canon_player)

# batting_partners is a stringified tuple like "('A', 'B')" — rewrite each side.
_partners_re = re.compile(r"\('([^']+)',\s*'([^']+)'\)")
def _canon_partners(s):
    if pd.isna(s):
        return s
    m = _partners_re.match(str(s))
    if not m:
        return s
    a, b = canon_player(m.group(1)), canon_player(m.group(2))
    return f"('{a}', '{b}')"

if "batting_partners" in df.columns:
    df["batting_partners"] = df["batting_partners"].apply(_canon_partners)

# ── Season display label ──────────────────────────────────────────────────────
SEASON_LABEL = {
    "2007/08": "2008", "2009/10": "2010", "2020/21": "2020"
}
def season_label(s):
    s = str(s)
    return SEASON_LABEL.get(s, s)

df["season_label"] = df["season"].apply(season_label)

# ── Venue canonicalisation ────────────────────────────────────────────────────
VENUE_MAP = {
    "M Chinnaswamy Stadium":                     "M. Chinnaswamy Stadium",
    "M. Chinnaswamy Stadium":                    "M. Chinnaswamy Stadium",
    "Eden Gardens":                              "Eden Gardens",
    "Wankhede Stadium":                          "Wankhede Stadium",
    "MA Chidambaram Stadium":                    "MA Chidambaram Stadium",
    "MA Chidambaram Stadium, Chepauk":           "MA Chidambaram Stadium",
    "MA Chidambaram Stadium, Chepauk, Chennai":  "MA Chidambaram Stadium",
    "Feroz Shah Kotla":                          "Arun Jaitley Stadium",
    "Feroz Shah Kotla Ground":                   "Arun Jaitley Stadium",
    "Arun Jaitley Stadium":                      "Arun Jaitley Stadium",
    "Arun Jaitley Stadium, Delhi":               "Arun Jaitley Stadium",
    "Punjab Cricket Association Stadium, Mohali":"Punjab Cricket Association Stadium",
    "Punjab Cricket Association IS Bindra Stadium, Mohali": "Punjab Cricket Association Stadium",
    "Punjab Cricket Association IS Bindra Stadium": "Punjab Cricket Association Stadium",
    "Rajiv Gandhi International Stadium":        "Rajiv Gandhi International Stadium",
    "Rajiv Gandhi International Stadium, Uppal": "Rajiv Gandhi International Stadium",
    "Sawai Mansingh Stadium":                    "Sawai Mansingh Stadium",
    "DY Patil Stadium":                          "DY Patil Stadium",
    "Brabourne Stadium":                         "Brabourne Stadium",
    "Narendra Modi Stadium":                     "Narendra Modi Stadium",
    "Narendra Modi Stadium, Ahmedabad":          "Narendra Modi Stadium",
    "Sardar Patel Stadium, Motera":              "Narendra Modi Stadium",
    "Dr DY Patil Sports Academy":                "DY Patil Stadium",
    "Dr DY Patil Sports Academy, Mumbai":        "DY Patil Stadium",
    "JSCA International Stadium Complex":        "JSCA International Stadium",
    "JSCA International Stadium Complex, Ranchi":"JSCA International Stadium",
    "Himachal Pradesh Cricket Association Stadium": "HPCA Stadium",
    "Himachal Pradesh Cricket Association Stadium, Dharamsala": "HPCA Stadium",
    "Maharashtra Cricket Association Stadium":   "MCA Stadium Pune",
    "Maharashtra Cricket Association Stadium, Pune": "MCA Stadium Pune",
    "Subrata Roy Sahara Stadium":                "MCA Stadium Pune",
    "Dr. Y.S. Rajasekhara Reddy ACA-VDCA Cricket Stadium": "ACA-VDCA Stadium",
    "Holkar Cricket Stadium":                    "Holkar Cricket Stadium",
    "Green Park":                                "Green Park Stadium",
    "Barabati Stadium":                          "Barabati Stadium",
    "Ekana Cricket Stadium":                     "Ekana Cricket Stadium",
    "Bharat Ratna Shri Atal Bihari Vajpayee Ekana Cricket Stadium": "Ekana Cricket Stadium",
    "Barsapara Cricket Stadium":                 "Barsapara Cricket Stadium",
    "Nehru Stadium":                             "Jawaharlal Nehru Stadium",
    "Jawaharlal Nehru Stadium":                  "Jawaharlal Nehru Stadium",
    "Shaheed Veer Narayan Singh International Stadium": "SVNS International Stadium",
    "Vidarbha Cricket Association Stadium, Jamtha": "VCA Stadium Nagpur",
    "South Africa": "Various (SA)",
    "UAE": "Various (UAE)",
}
def canon_venue(v):
    if pd.isna(v): return "Unknown"
    v = str(v).strip()
    return VENUE_MAP.get(v, v)

df["venue_canon"] = df["venue"].apply(canon_venue)

# ── Match-level frame ─────────────────────────────────────────────────────────
MATCH_COLS = [
    "match_id","date","season","season_label","venue_canon","city",
    "batting_team","bowling_team","toss_winner","toss_decision",
    "match_won_by","win_outcome","player_of_match","stage","event_match_no"
]
matches_df = (
    df[MATCH_COLS]
    .drop_duplicates(subset=["match_id","innings"] if "innings" in MATCH_COLS else ["match_id"])
    .drop_duplicates(subset=["match_id"])
)
# Actually build match-level from first ball of each match
match_meta = df.groupby("match_id").first().reset_index()[[
    "match_id","date","season","season_label","venue_canon","city",
    "toss_winner","toss_decision","match_won_by","win_outcome",
    "player_of_match","stage","event_match_no"
]]
print(f"  Unique matches: {len(match_meta):,}")

# ── VALIDATION ASSERTIONS ─────────────────────────────────────────────────────
print("\nRunning validation assertions …")

# 1. Kohli runs (name may have been canonicalised from the CSV's "V Kohli")
_kohli = canon_player("V Kohli")
kohli_runs = int(df[df["batter"] == _kohli]["runs_batter"].sum())
assert kohli_runs == 8671, f"FAIL: Kohli runs = {kohli_runs}, expected 8671"
print(f"  [PASS] {_kohli} runs = {kohli_runs}")

# 2. Chahal wickets
# wickets = rows where bowler_wicket == 1 and wicket_kind not in run out / retired
BOWLING_WICKETS = ["bowled","caught","lbw","stumped","caught and bowled","hit wicket"]
_chahal = canon_player("YS Chahal")
chahal_wkts = int(df[
    (df["bowler"] == _chahal) &
    (df["bowler_wicket"] == 1) &
    (df["wicket_kind"].str.lower().isin(BOWLING_WICKETS))
]["bowler_wicket"].sum())
assert chahal_wkts == 221, f"FAIL: Chahal wickets = {chahal_wkts}, expected 221"
print(f"  [PASS] {_chahal} wickets = {chahal_wkts}")

# 3. Total sixes (valid deliveries only — no-balls count as extras not valid balls)
sixes = int(((df["runs_batter"] == 6) & (df["valid_ball"] == 1)).sum())
assert sixes == 14259, f"FAIL: Sixes = {sixes}, expected 14259"
print(f"  [PASS] Total sixes (valid balls) = {sixes}")

# 4. Total batter runs
total_runs = int(df["runs_batter"].sum())
assert total_runs == 355373, f"FAIL: Total batter runs = {total_runs}, expected 355373"
print(f"  [PASS] Total batter runs = {total_runs}")

print("  All 4 assertions PASSED\n")

# ─────────────────────────────────────────────────────────────────────────────
# 1. SEASON SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
print("Building season-summary.json …")

# Title winners ground truth (from PRD analysis)
TITLE_WINNERS = {
    "2008": "Rajasthan Royals",
    "2009": "Deccan Chargers",
    "2010": "Chennai Super Kings",
    "2011": "Chennai Super Kings",
    "2012": "Kolkata Knight Riders",
    "2013": "Mumbai Indians",
    "2014": "Kolkata Knight Riders",
    "2015": "Mumbai Indians",
    "2016": "Sunrisers Hyderabad",
    "2017": "Mumbai Indians",
    "2018": "Chennai Super Kings",
    "2019": "Mumbai Indians",
    "2020": "Mumbai Indians",
    "2021": "Chennai Super Kings",
    "2022": "Gujarat Titans",
    "2023": "Chennai Super Kings",
    "2024": "Kolkata Knight Riders",
    "2025": "Royal Challengers Bengaluru",
}

seasons = []
for season, grp in df.groupby("season_label"):
    season_matches = match_meta[match_meta["season_label"] == season]
    total_matches  = len(season_matches)
    total_runs_s   = int(grp["runs_batter"].sum())
    total_wkts_s   = int(grp[grp["bowler_wicket"] == 1]["bowler_wicket"].sum())
    total_sixes_s  = int((grp["runs_batter"] == 6).sum())
    total_fours_s  = int((grp["runs_batter"] == 4).sum())

    # Top run-scorer this season
    bat_agg = grp.groupby("batter")["runs_batter"].sum()
    top_bat = bat_agg.idxmax() if len(bat_agg) else ""
    top_bat_runs = int(bat_agg.max()) if len(bat_agg) else 0

    # Top wicket-taker this season
    bowl_wkt = grp[grp["bowler_wicket"] == 1 & grp["wicket_kind"].str.lower().isin(BOWLING_WICKETS)].groupby("bowler")["bowler_wicket"].sum() if len(grp) else pd.Series()
    top_bowl = bowl_wkt.idxmax() if len(bowl_wkt) else ""
    top_bowl_wkts = int(bowl_wkt.max()) if len(bowl_wkt) else 0

    # Player of the match counts
    pom_counts = season_matches["player_of_match"].value_counts()
    top_pom = pom_counts.index[0] if len(pom_counts) else ""

    seasons.append({
        "season": season,
        "champion": TITLE_WINNERS.get(season, ""),
        "totalMatches": total_matches,
        "totalRuns": total_runs_s,
        "totalWickets": total_wkts_s,
        "totalSixes": total_sixes_s,
        "totalFours": total_fours_s,
        "orangeCap": {"player": top_bat, "runs": top_bat_runs},
        "purpleCap": {"player": top_bowl, "wickets": top_bowl_wkts},
        "mostPOM": top_pom,
    })

seasons.sort(key=lambda x: int(x["season"]))
with open(f"{SRC_DATA}/season-summary.json", "w") as f:
    json.dump(seasons, f)
print(f"  Written {len(seasons)} seasons")

# ─────────────────────────────────────────────────────────────────────────────
# 2. TEAM PROFILES
# ─────────────────────────────────────────────────────────────────────────────
print("Building team-profiles.json …")

ACTIVE_TEAMS = [
    "Chennai Super Kings","Mumbai Indians","Royal Challengers Bengaluru",
    "Kolkata Knight Riders","Delhi Capitals","Punjab Kings",
    "Rajasthan Royals","Sunrisers Hyderabad","Gujarat Titans","Lucknow Super Giants"
]
TEAM_META = {
    "Chennai Super Kings":         {"short":"CSK","color":"#F9CD05","textColor":"#000000","city":"Chennai","ground":"MA Chidambaram Stadium","founded":2008},
    "Mumbai Indians":              {"short":"MI", "color":"#004BA0","textColor":"#FFFFFF","city":"Mumbai","ground":"Wankhede Stadium","founded":2008},
    "Royal Challengers Bengaluru": {"short":"RCB","color":"#EC1C24","textColor":"#FFFFFF","city":"Bengaluru","ground":"M. Chinnaswamy Stadium","founded":2008},
    "Kolkata Knight Riders":       {"short":"KKR","color":"#3A225D","textColor":"#FFFFFF","city":"Kolkata","ground":"Eden Gardens","founded":2008},
    "Delhi Capitals":              {"short":"DC", "color":"#0078BC","textColor":"#FFFFFF","city":"Delhi","ground":"Arun Jaitley Stadium","founded":2008},
    "Punjab Kings":                {"short":"PBKS","color":"#ED1B24","textColor":"#FFFFFF","city":"Mohali","ground":"Punjab Cricket Association Stadium","founded":2008},
    "Rajasthan Royals":            {"short":"RR", "color":"#EA1A85","textColor":"#FFFFFF","city":"Jaipur","ground":"Sawai Mansingh Stadium","founded":2008},
    "Sunrisers Hyderabad":         {"short":"SRH","color":"#FF822A","textColor":"#000000","city":"Hyderabad","ground":"Rajiv Gandhi International Stadium","founded":2013},
    "Gujarat Titans":              {"short":"GT", "color":"#1C1C2B","textColor":"#FFFFFF","city":"Ahmedabad","ground":"Narendra Modi Stadium","founded":2022},
    "Lucknow Super Giants":        {"short":"LSG","color":"#A72056","textColor":"#FFFFFF","city":"Lucknow","ground":"Ekana Cricket Stadium","founded":2022},
    # Defunct
    "Deccan Chargers":             {"short":"DCH","color":"#F7941D","textColor":"#000000","city":"Hyderabad","ground":"Rajiv Gandhi International Stadium","founded":2008},
    "Kochi Tuskers Kerala":        {"short":"KTK","color":"#F15A24","textColor":"#FFFFFF","city":"Kochi","ground":"Jawaharlal Nehru Stadium","founded":2011},
    "Rising Pune Supergiant":      {"short":"RPS","color":"#6F2E81","textColor":"#FFFFFF","city":"Pune","ground":"MCA Stadium Pune","founded":2016},
    "Gujarat Lions":               {"short":"GL", "color":"#EB8B2F","textColor":"#000000","city":"Rajkot","ground":"Saurashtra Cricket Association Stadium","founded":2016},
    "Pune Warriors":               {"short":"PWI","color":"#1B427C","textColor":"#FFFFFF","city":"Pune","ground":"MCA Stadium Pune","founded":2011},
}

team_profiles = []
all_teams = list(df["batting_team"].dropna().unique())

# Build win/loss per team from match_meta
# A match appears twice in df (2 innings), use match_meta (one row per match)
for team in all_teams:
    meta = TEAM_META.get(team, {"short": team[:3].upper(), "color": "#888888", "textColor": "#FFFFFF"})

    # Matches played = appeared as batting_team OR bowling_team in match_meta
    team_matches = match_meta[
        (match_meta["batting_team"] == team) | (match_meta["bowling_team"] == team)
        if "batting_team" in match_meta.columns else
        match_meta["match_id"].isin(
            df[df["batting_team"] == team]["match_id"].unique()
        )
    ]
    # Since match_meta doesn't have batting/bowling split directly, get unique match_ids
    team_match_ids = df[
        (df["batting_team"] == team) | (df["bowling_team"] == team)
    ]["match_id"].unique()
    team_match_meta = match_meta[match_meta["match_id"].isin(team_match_ids)]

    total_played  = len(team_match_meta)
    wins          = int((team_match_meta["match_won_by"] == team).sum())
    losses        = total_played - wins - int((team_match_meta["win_outcome"].isna()).sum())
    nr            = int((team_match_meta["win_outcome"].isna()).sum())

    # Seasons played
    seasons_played = sorted(df[df["batting_team"] == team]["season_label"].unique().tolist())

    # Titles
    titles = [yr for yr, winner in TITLE_WINNERS.items() if winner == team]

    # Batting stats
    bat_df = df[df["batting_team"] == team]
    team_runs   = int(bat_df["runs_batter"].sum())
    team_sixes  = int((bat_df["runs_batter"] == 6).sum())
    team_fours  = int((bat_df["runs_batter"] == 4).sum())

    # Top batter
    top_bat_s = bat_df.groupby("batter")["runs_batter"].sum().sort_values(ascending=False)
    top_batter = {"player": top_bat_s.index[0], "runs": int(top_bat_s.iloc[0])} if len(top_bat_s) else {}

    # Top bowler (wickets)
    bowl_df = df[df["bowling_team"] == team]
    bowl_wkt_s = bowl_df[
        (bowl_df["bowler_wicket"] == 1) &
        (bowl_df["wicket_kind"].str.lower().isin(BOWLING_WICKETS))
    ].groupby("bowler")["bowler_wicket"].sum().sort_values(ascending=False)
    top_bowler = {"player": bowl_wkt_s.index[0], "wickets": int(bowl_wkt_s.iloc[0])} if len(bowl_wkt_s) else {}

    # Toss stats
    toss_won  = int((team_match_meta["toss_winner"] == team).sum())
    toss_pct  = round(toss_won / total_played * 100, 1) if total_played else 0

    # Win% home vs away (approximate: home = venue in home city)
    home_city = meta.get("city", "")

    team_profiles.append({
        "name":       team,
        "short":      meta.get("short", team[:3].upper()),
        "color":      meta.get("color", "#888888"),
        "textColor":  meta.get("textColor", "#FFFFFF"),
        "city":       meta.get("city", ""),
        "ground":     meta.get("ground", ""),
        "founded":    meta.get("founded", 2008),
        "active":     team in ACTIVE_TEAMS,
        "titles":     titles,
        "titleCount": len(titles),
        "seasonsPlayed": seasons_played,
        "stats": {
            "played":  total_played,
            "won":     wins,
            "lost":    losses,
            "noResult": nr,
            "winPct":  round(wins / total_played * 100, 1) if total_played else 0,
            "runs":    team_runs,
            "sixes":   team_sixes,
            "fours":   team_fours,
            "tossWon": toss_won,
            "tossPct": toss_pct,
        },
        "topBatter":  top_batter,
        "topBowler":  top_bowler,
    })

with open(f"{SRC_DATA}/team-profiles.json", "w") as f:
    json.dump(team_profiles, f)
print(f"  Written {len(team_profiles)} team profiles")

# ─────────────────────────────────────────────────────────────────────────────
# 3. PLAYER — BATTERS
# ─────────────────────────────────────────────────────────────────────────────
print("Building player-batters.json …")

bat_grp = df.groupby("batter")

batter_records = []
for player, grp in bat_grp:
    runs        = int(grp["runs_batter"].sum())
    balls       = int(grp["balls_faced"].sum()) if "balls_faced" in grp.columns else int((grp["valid_ball"] == 1).sum())
    innings_df  = grp.groupby(["match_id","innings"])
    innings_cnt = len(innings_df)
    sixes       = int((grp["runs_batter"] == 6).sum())
    fours       = int((grp["runs_batter"] == 4).sum())
    sr          = round(runs / balls * 100, 2) if balls > 0 else 0.0

    # Innings scores
    inn_scores  = grp.groupby(["match_id","innings"])["runs_batter"].sum()
    fifties     = int(((inn_scores >= 50) & (inn_scores < 100)).sum())
    hundreds    = int((inn_scores >= 100).sum())
    highest     = int(inn_scores.max()) if len(inn_scores) else 0
    avg         = round(runs / innings_cnt, 2) if innings_cnt else 0.0

    # Ducks
    ducks       = int((inn_scores == 0).sum())

    # Teams played for
    teams       = grp["batting_team"].unique().tolist()

    # Seasons
    seasons_p   = sorted(grp["season_label"].unique().tolist())
    first_s     = seasons_p[0] if seasons_p else ""
    last_s      = seasons_p[-1] if seasons_p else ""

    if runs < 50:
        continue  # skip very minor players to keep JSON lean

    batter_records.append({
        "player":    player,
        "runs":      runs,
        "balls":     balls,
        "innings":   innings_cnt,
        "avg":       avg,
        "sr":        sr,
        "fifties":   fifties,
        "hundreds":  hundreds,
        "highest":   highest,
        "sixes":     sixes,
        "fours":     fours,
        "ducks":     ducks,
        "teams":     teams,
        "firstSeason": first_s,
        "lastSeason":  last_s,
    })

batter_records.sort(key=lambda x: x["runs"], reverse=True)
with open(f"{SRC_DATA}/player-batters.json", "w") as f:
    json.dump(batter_records, f)
print(f"  Written {len(batter_records)} batters")

# ─────────────────────────────────────────────────────────────────────────────
# 4. PLAYER — BOWLERS
# ─────────────────────────────────────────────────────────────────────────────
print("Building player-bowlers.json …")

bowl_df_all = df[df["valid_ball"] == 1].copy()
bowl_grp    = bowl_df_all.groupby("bowler")

bowler_records = []
for player, grp in bowl_grp:
    balls_bowled = int(grp["valid_ball"].sum())
    overs_bowled = round(balls_bowled / 6, 1)
    runs_given   = int(grp["runs_bowler"].sum()) if "runs_bowler" in grp.columns else int(grp["runs_total"].sum())
    economy      = round(runs_given / overs_bowled, 2) if overs_bowled > 0 else 0.0

    wkt_grp      = grp[(grp["bowler_wicket"] == 1) & (grp["wicket_kind"].str.lower().isin(BOWLING_WICKETS))]
    wickets      = int(len(wkt_grp))
    avg          = round(runs_given / wickets, 2) if wickets > 0 else 0.0
    sr_bowl      = round(balls_bowled / wickets, 2) if wickets > 0 else 0.0

    # 4W and 5W hauls
    wkts_per_inn = wkt_grp.groupby(["match_id","innings"]).size()
    four_wkts    = int((wkts_per_inn >= 4).sum())
    five_wkts    = int((wkts_per_inn >= 5).sum())
    best_inn     = int(wkts_per_inn.max()) if len(wkts_per_inn) else 0

    # Dot balls
    dots         = int((grp["runs_total"] == 0).sum())

    teams        = grp["bowling_team"].unique().tolist()
    seasons_p    = sorted(grp["season_label"].unique().tolist())

    if wickets < 5:
        continue  # skip very minor bowlers

    bowler_records.append({
        "player":      player,
        "wickets":     wickets,
        "balls":       balls_bowled,
        "overs":       overs_bowled,
        "runs":        runs_given,
        "economy":     economy,
        "avg":         avg,
        "sr":          sr_bowl,
        "fourWickets": four_wkts,
        "fiveWickets": five_wkts,
        "bestInnings": best_inn,
        "dots":        dots,
        "teams":       teams,
        "firstSeason": seasons_p[0] if seasons_p else "",
        "lastSeason":  seasons_p[-1] if seasons_p else "",
    })

bowler_records.sort(key=lambda x: x["wickets"], reverse=True)
with open(f"{SRC_DATA}/player-bowlers.json", "w") as f:
    json.dump(bowler_records, f)
print(f"  Written {len(bowler_records)} bowlers")

# ─────────────────────────────────────────────────────────────────────────────
# 5. OVER ANALYTICS
# ─────────────────────────────────────────────────────────────────────────────
print("Building over-analytics.json …")

over_stats = []
for over_num in range(0, 20):
    grp = df[df["over"] == over_num]
    if len(grp) == 0:
        continue
    total_balls  = int((grp["valid_ball"] == 1).sum())
    total_runs_o = int(grp["runs_total"].sum())
    total_wkts_o = int(grp[grp["bowler_wicket"] == 1]["bowler_wicket"].sum())
    total_sixes_o= int((grp["runs_batter"] == 6).sum())
    total_fours_o= int((grp["runs_batter"] == 4).sum())
    total_dots_o = int((grp["runs_total"] == 0).sum())
    run_rate      = round(total_runs_o / (total_balls / 6), 2) if total_balls > 0 else 0.0

    over_stats.append({
        "over":     over_num + 1,
        "runs":     total_runs_o,
        "wickets":  total_wkts_o,
        "sixes":    total_sixes_o,
        "fours":    total_fours_o,
        "dots":     total_dots_o,
        "runRate":  run_rate,
        "balls":    total_balls,
    })

with open(f"{SRC_DATA}/over-analytics.json", "w") as f:
    json.dump(over_stats, f)
print(f"  Written {len(over_stats)} over records")

# ─────────────────────────────────────────────────────────────────────────────
# 6. VENUE ANALYTICS
# ─────────────────────────────────────────────────────────────────────────────
print("Building venue-analytics.json …")

venue_data = []
for venue, grp in df.groupby("venue_canon"):
    match_ids    = grp["match_id"].unique()
    v_matches    = match_meta[match_meta["match_id"].isin(match_ids)]
    total_m      = len(v_matches)
    if total_m < 3:
        continue

    total_runs_v = int(grp["runs_batter"].sum())
    total_balls_v= int((grp["valid_ball"] == 1).sum())
    avg_score    = round(total_runs_v / (total_balls_v / 6 / 2), 1) if total_balls_v > 0 else 0  # per innings approx
    sixes_v      = int((grp["runs_batter"] == 6).sum())
    fours_v      = int((grp["runs_batter"] == 4).sum())

    # Toss & field-first win pct
    bat_first_wins  = int(((v_matches["toss_decision"] == "bat") & (v_matches["toss_winner"] == v_matches["match_won_by"])).sum())
    field_first_wins= int(((v_matches["toss_decision"] == "field") & (v_matches["toss_winner"] == v_matches["match_won_by"])).sum())

    # City
    city = grp["city"].mode()[0] if len(grp["city"].dropna()) > 0 else ""

    venue_data.append({
        "venue":      venue,
        "city":       city,
        "matches":    total_m,
        "totalRuns":  total_runs_v,
        "avgScore":   avg_score,
        "sixes":      sixes_v,
        "fours":      fours_v,
        "batFirstWins":   bat_first_wins,
        "fieldFirstWins": field_first_wins,
    })

venue_data.sort(key=lambda x: x["matches"], reverse=True)
with open(f"{SRC_DATA}/venue-analytics.json", "w") as f:
    json.dump(venue_data, f)
print(f"  Written {len(venue_data)} venues")

# ─────────────────────────────────────────────────────────────────────────────
# 7. HEAD-TO-HEAD MATRIX
# ─────────────────────────────────────────────────────────────────────────────
print("Building h2h-matrix.json …")

# For each unique match, we need which two teams played and who won
match_teams = df.groupby("match_id").agg(
    batting_team=("batting_team", lambda x: x.iloc[0]),
    bowling_team=("bowling_team", lambda x: x.iloc[0]),
    match_won_by=("match_won_by", lambda x: x.iloc[0]),
    season_label=("season_label", lambda x: x.iloc[0]),
).reset_index()

# Get the two teams per match (innings 1 and 2 only, ignore super overs)
inn_teams = df[df["innings"].isin([1,2])].groupby(["match_id","innings"])["batting_team"].first().reset_index()
inn_teams_pivot = inn_teams.groupby("match_id")["batting_team"].apply(list).reset_index()
# Keep only matches with exactly 2 teams
inn_teams_pivot = inn_teams_pivot[inn_teams_pivot["batting_team"].apply(len) == 2]
inn_teams_pivot["team_inn1"] = inn_teams_pivot["batting_team"].apply(lambda x: x[0])
inn_teams_pivot["team_inn2"] = inn_teams_pivot["batting_team"].apply(lambda x: x[1])
match_pairs = inn_teams_pivot[["match_id","team_inn1","team_inn2"]].merge(
    match_meta[["match_id","match_won_by","season_label"]], on="match_id", how="left"
)

h2h = defaultdict(lambda: {"played": 0, "wins": defaultdict(int), "draws": 0})

for _, row in match_pairs.iterrows():
    t1 = row["team_inn1"]
    t2 = row["team_inn2"]
    if pd.isna(t1) or pd.isna(t2):
        continue
    key = tuple(sorted([t1, t2]))
    h2h[key]["played"] += 1
    winner = row["match_won_by"]
    if pd.isna(winner):
        h2h[key]["draws"] += 1
    else:
        h2h[key]["wins"][winner] += 1

h2h_list = []
for (t1, t2), data in h2h.items():
    h2h_list.append({
        "team1":   t1,
        "team2":   t2,
        "played":  data["played"],
        "t1Wins":  data["wins"].get(t1, 0),
        "t2Wins":  data["wins"].get(t2, 0),
        "noResult":data["draws"],
    })

with open(f"{SRC_DATA}/h2h-matrix.json", "w") as f:
    json.dump(h2h_list, f)
print(f"  Written {len(h2h_list)} H2H records")

# ─────────────────────────────────────────────────────────────────────────────
# 8. ALL-TIME RECORDS
# ─────────────────────────────────────────────────────────────────────────────
print("Building records.json …")

# Batting records
bat_agg_all = df.groupby("batter").agg(
    runs=("runs_batter","sum"),
    sixes=("runs_batter", lambda x: (x==6).sum()),
    fours=("runs_batter", lambda x: (x==4).sum()),
).reset_index()

# Highest innings score per player
inn_scores_all = df.groupby(["batter","match_id","innings"])["runs_batter"].sum().reset_index()
highest_scores = inn_scores_all.groupby("batter")["runs_batter"].max().reset_index()
highest_scores.columns = ["batter","highest"]

# Most centuries
centuries = inn_scores_all[inn_scores_all["runs_batter"] >= 100].groupby("batter").size().reset_index()
centuries.columns = ["batter","hundreds"]

# Bowl agg
bowl_wkt_all = df[
    (df["bowler_wicket"] == 1) &
    (df["wicket_kind"].str.lower().isin(BOWLING_WICKETS))
].groupby("bowler")["bowler_wicket"].sum().reset_index()
bowl_wkt_all.columns = ["bowler","wickets"]

records = {
    "mostRuns":     bat_agg_all.nlargest(10,"runs")[["batter","runs"]].to_dict("records"),
    "mostSixes":    bat_agg_all.nlargest(10,"sixes")[["batter","sixes"]].to_dict("records"),
    "mostFours":    bat_agg_all.nlargest(10,"fours")[["batter","fours"]].to_dict("records"),
    "highestScore": highest_scores.nlargest(10,"highest")[["batter","highest"]].to_dict("records"),
    "mostCenturies":centuries.nlargest(10,"hundreds")[["batter","hundreds"]].to_dict("records") if len(centuries) else [],
    "mostWickets":  bowl_wkt_all.nlargest(10,"wickets")[["bowler","wickets"]].to_dict("records"),
    "allTimeSixes": int((df["runs_batter"]==6).sum()),
    "allTimeFours": int((df["runs_batter"]==4).sum()),
    "allTimeRuns":  int(df["runs_batter"].sum()),
    "totalMatches": len(match_meta),
    "totalSeasons": 18,
}

with open(f"{SRC_DATA}/records.json", "w") as f:
    json.dump(records, f)
print("  Written records.json")

# ─────────────────────────────────────────────────────────────────────────────
# 8a. TEAM-SEASONS — per team, per season record (all 15 teams)
# ─────────────────────────────────────────────────────────────────────────────
print("Building team-seasons.json …")
team_seasons = {}
for team in all_teams:
    team_match_ids = df[
        (df["batting_team"] == team) | (df["bowling_team"] == team)
    ]["match_id"].unique()
    t_matches = match_meta[match_meta["match_id"].isin(team_match_ids)]
    rows = []
    for season, ss_grp in t_matches.groupby("season_label"):
        played = len(ss_grp)
        wins   = int((ss_grp["match_won_by"] == team).sum())
        nr     = int(ss_grp["win_outcome"].isna().sum())
        lost   = played - wins - nr
        rows.append({"season": str(season), "played": played, "won": wins, "lost": lost, "nr": nr})
    rows.sort(key=lambda x: int(x["season"]))
    team_seasons[team] = rows
with open(f"{SRC_DATA}/team-seasons.json", "w") as f:
    json.dump(team_seasons, f)
print(f"  Written team-seasons for {len(team_seasons)} teams")

# ─────────────────────────────────────────────────────────────────────────────
# 8b. RIVALRIES-ALL — h2h enriched with meta + recent 5 results (all pairs)
# ─────────────────────────────────────────────────────────────────────────────
print("Building rivalries-all.json …")
# match_pairs + date, sorted desc for recent results
pair_rows = match_pairs.merge(
    match_meta[["match_id","date"]], on="match_id", how="left"
).sort_values("date", ascending=False)

rivalries_all = []
for (t1, t2), data in h2h.items():
    pair_df = pair_rows[
        ((pair_rows["team_inn1"] == t1) & (pair_rows["team_inn2"] == t2)) |
        ((pair_rows["team_inn1"] == t2) & (pair_rows["team_inn2"] == t1))
    ].head(5)
    recent = []
    for _, r in pair_df.iterrows():
        recent.append({
            "season": str(r["season_label"]),
            "winner": r["match_won_by"] if pd.notna(r["match_won_by"]) else None,
        })
    m1 = TEAM_META.get(t1, {})
    m2 = TEAM_META.get(t2, {})
    rivalries_all.append({
        "team1":   t1,
        "team2":   t2,
        "short1":  m1.get("short", t1[:3].upper()),
        "short2":  m2.get("short", t2[:3].upper()),
        "color1":  m1.get("color", "#888888"),
        "color2":  m2.get("color", "#888888"),
        "played":  data["played"],
        "t1Wins":  data["wins"].get(t1, 0),
        "t2Wins":  data["wins"].get(t2, 0),
        "noResult": data["draws"],
        "recentResults": recent,
    })
rivalries_all.sort(key=lambda x: x["played"], reverse=True)
with open(f"{SRC_DATA}/rivalries-all.json", "w") as f:
    json.dump(rivalries_all, f)
print(f"  Written {len(rivalries_all)} rivalry pairs")

# ─────────────────────────────────────────────────────────────────────────────
# 8c. HOME-ADVANTAGE — per team (all 15)
# ─────────────────────────────────────────────────────────────────────────────
print("Building home-advantage.json …")
home_adv = []
for team in all_teams:
    meta = TEAM_META.get(team, {})
    home_ground = meta.get("ground", "")
    if not home_ground:
        continue
    team_match_ids = df[(df["batting_team"] == team) | (df["bowling_team"] == team)]["match_id"].unique()
    t_matches = match_meta[match_meta["match_id"].isin(team_match_ids)]
    home_matches = t_matches[t_matches["venue_canon"] == home_ground]
    away_matches = t_matches[t_matches["venue_canon"] != home_ground]

    h_played = len(home_matches)
    h_won    = int((home_matches["match_won_by"] == team).sum())
    a_played = len(away_matches)
    a_won    = int((away_matches["match_won_by"] == team).sum())

    h_pct = round(h_won / h_played * 100, 1) if h_played else 0.0
    a_pct = round(a_won / a_played * 100, 1) if a_played else 0.0

    home_adv.append({
        "team":  team,
        "short": meta.get("short", team[:3].upper()),
        "color": meta.get("color", "#888888"),
        "home":  {"won": h_won, "played": h_played, "winPct": h_pct},
        "away":  {"won": a_won, "played": a_played, "winPct": a_pct},
        "advantage": round(h_pct - a_pct, 1),
    })
home_adv.sort(key=lambda x: x["advantage"], reverse=True)
with open(f"{SRC_DATA}/home-advantage.json", "w") as f:
    json.dump(home_adv, f)
print(f"  Written home-advantage for {len(home_adv)} teams")

# ─────────────────────────────────────────────────────────────────────────────
# 8d. TOSS ANALYSIS — overall + per team (all 15)
# ─────────────────────────────────────────────────────────────────────────────
print("Building toss-analysis.json …")
decided = match_meta[match_meta["match_won_by"].notna()]
total_matches = len(decided)
toss_winner_wins = int((decided["toss_winner"] == decided["match_won_by"]).sum())
bat_first  = decided[decided["toss_decision"] == "bat"]
field_first = decided[decided["toss_decision"] == "field"]
bat_wins   = int((bat_first["toss_winner"] == bat_first["match_won_by"]).sum())
field_wins = int((field_first["toss_winner"] == field_first["match_won_by"]).sum())

toss_overall = {
    "totalMatches":    total_matches,
    "tossWinnerWins":  toss_winner_wins,
    "tossWinPct":      round(toss_winner_wins / total_matches * 100, 1) if total_matches else 0,
    "batFirst":        {"matches": len(bat_first),   "wins": bat_wins,   "winPct": round(bat_wins   / len(bat_first)   * 100, 1) if len(bat_first)   else 0},
    "fieldFirst":      {"matches": len(field_first), "wins": field_wins, "winPct": round(field_wins / len(field_first) * 100, 1) if len(field_first) else 0},
}

toss_by_team = []
for team in all_teams:
    meta = TEAM_META.get(team, {})
    team_match_ids = df[(df["batting_team"] == team) | (df["bowling_team"] == team)]["match_id"].unique()
    t_matches = match_meta[match_meta["match_id"].isin(team_match_ids)]
    tw_total = len(t_matches)
    tw_won   = int((t_matches["toss_winner"] == team).sum())
    won_after_toss = int(((t_matches["toss_winner"] == team) & (t_matches["match_won_by"] == team)).sum())
    chose_bat   = int(((t_matches["toss_winner"] == team) & (t_matches["toss_decision"] == "bat")).sum())
    chose_field = int(((t_matches["toss_winner"] == team) & (t_matches["toss_decision"] == "field")).sum())
    toss_by_team.append({
        "team":  team,
        "short": meta.get("short", team[:3].upper()),
        "color": meta.get("color", "#888888"),
        "tossWon":   tw_won,
        "tossTotal": tw_total,
        "tossWinPct": round(tw_won / tw_total * 100, 1) if tw_total else 0,
        "wonAfterToss": won_after_toss,
        "tossToMatchWinPct": round(won_after_toss / tw_won * 100, 1) if tw_won else 0,
        "choseBat":   chose_bat,
        "choseField": chose_field,
    })
toss_by_team.sort(key=lambda x: x["tossWinPct"], reverse=True)

with open(f"{SRC_DATA}/toss-analysis.json", "w") as f:
    json.dump({"overall": toss_overall, "byTeam": toss_by_team}, f)
print(f"  Written toss-analysis (byTeam={len(toss_by_team)})")

# ─────────────────────────────────────────────────────────────────────────────
# 8e. POWERPLAY STATS — byTeam (all 15), byOver (1–6), overall
# ─────────────────────────────────────────────────────────────────────────────
print("Building powerplay-stats.json …")
pp = df[df["over"] < 6]
pp_inn = pp.groupby(["match_id","innings","batting_team"]).agg(
    pp_runs    = ("runs_total",   "sum"),
    pp_balls   = ("valid_ball",   "sum"),
    pp_wickets = ("bowler_wicket", lambda x: int((x == 1).sum())),
).reset_index()

pp_by_team = []
for team in all_teams:
    meta = TEAM_META.get(team, {})
    t_pp = pp_inn[pp_inn["batting_team"] == team]
    innings_n = len(t_pp)
    if innings_n == 0:
        continue
    total_runs  = float(t_pp["pp_runs"].sum())
    total_balls = float(t_pp["pp_balls"].sum())
    pp_by_team.append({
        "team":   team,
        "short":  meta.get("short", team[:3].upper()),
        "color":  meta.get("color", "#888888"),
        "avgPPScore":   round(t_pp["pp_runs"].mean(), 1),
        "ppRunRate":    round(total_runs / total_balls * 6, 2) if total_balls else 0,
        "ppWicketsLost": int(t_pp["pp_wickets"].sum()),
        "innings":      innings_n,
    })
pp_by_team.sort(key=lambda x: x["avgPPScore"], reverse=True)

pp_by_over = []
for over_idx in range(6):
    ovr = df[df["over"] == over_idx]
    runs_v  = int(ovr["runs_total"].sum())
    balls_v = int(ovr["valid_ball"].sum())
    pp_by_over.append({
        "over":    over_idx + 1,
        "runs":    runs_v,
        "wickets": int((ovr["bowler_wicket"] == 1).sum()),
        "sixes":   int((ovr["runs_batter"] == 6).sum()),
        "runRate": round(runs_v / balls_v * 6, 2) if balls_v else 0,
    })

all_pp_inn = pp.groupby(["match_id","innings"]).agg(
    pp_runs  = ("runs_total", "sum"),
    pp_balls = ("valid_ball", "sum"),
).reset_index()
pp_overall = {
    "avgPPScore": round(all_pp_inn["pp_runs"].mean(), 1),
    "avgRunRate": round(all_pp_inn["pp_runs"].sum() / all_pp_inn["pp_balls"].sum() * 6, 2) if all_pp_inn["pp_balls"].sum() > 0 else 0,
}

with open(f"{SRC_DATA}/powerplay-stats.json", "w") as f:
    json.dump({"byTeam": pp_by_team, "byOver": pp_by_over, "overall": pp_overall}, f)
print(f"  Written powerplay-stats (byTeam={len(pp_by_team)})")

# ─────────────────────────────────────────────────────────────────────────────
# 8f. PARTNERSHIPS — topPairs (career) + bestInnings (single inning)
# ─────────────────────────────────────────────────────────────────────────────
print("Building partnerships.json …")
_pair_re = re.compile(r"\('([^']+)',\s*'([^']+)'\)")
def _parse_partners(s):
    if pd.isna(s):
        return None
    m = _pair_re.match(str(s))
    if not m:
        return None
    a, b = m.group(1), m.group(2)
    return tuple(sorted([a, b]))

df["partner_pair"] = df["batting_partners"].apply(_parse_partners)
valid_pp = df[df["partner_pair"].notna()]
pair_inn = valid_pp.groupby(
    ["match_id","innings","partner_pair","batting_team","season_label","venue_canon"],
    as_index=False,
).agg(runs=("runs_total","sum"), balls=("valid_ball","sum"))

# topPairs — aggregated across career
pair_total = pair_inn.groupby("partner_pair", as_index=False).agg(
    total_runs    = ("runs","sum"),
    total_innings = ("match_id","count"),
    best          = ("runs","max"),
)
pair_total["avg_runs"] = (pair_total["total_runs"] / pair_total["total_innings"]).round(1)

# Most-common batting team per pair
pair_team_mode = (
    pair_inn.groupby(["partner_pair","batting_team"]).size().reset_index(name="c")
    .sort_values("c", ascending=False).drop_duplicates("partner_pair")
    .set_index("partner_pair")["batting_team"]
)

top_pairs = pair_total[pair_total["total_innings"] >= 5] \
    .sort_values("total_runs", ascending=False).head(30)
top_pairs_list = []
for _, row in top_pairs.iterrows():
    p1, p2 = row["partner_pair"]
    top_pairs_list.append({
        "p1": p1, "p2": p2,
        "batting_team": pair_team_mode.get(row["partner_pair"], ""),
        "total_runs":   int(row["total_runs"]),
        "total_innings": int(row["total_innings"]),
        "avg_runs":     float(row["avg_runs"]),
        "best":         int(row["best"]),
    })

best_inn = pair_inn.sort_values("runs", ascending=False).head(30)
best_inn_list = []
for _, row in best_inn.iterrows():
    p1, p2 = row["partner_pair"]
    runs_i, balls_i = int(row["runs"]), int(row["balls"])
    best_inn_list.append({
        "p1": p1, "p2": p2,
        "batting_team": row["batting_team"],
        "runs":   runs_i,
        "balls":  balls_i,
        "sr":     round(runs_i / balls_i * 100, 1) if balls_i else 0,
        "season_label": str(row["season_label"]),
        "venue":  row["venue_canon"],
    })

with open(f"{SRC_DATA}/partnerships.json", "w") as f:
    json.dump({"topPairs": top_pairs_list, "bestInnings": best_inn_list}, f)
print(f"  Written partnerships (topPairs={len(top_pairs_list)}, bestInnings={len(best_inn_list)})")

# ─────────────────────────────────────────────────────────────────────────────
# 9. IPL 2026 LIVE DATA (public/ipl2026.json)
# ─────────────────────────────────────────────────────────────────────────────
print("Building ipl2026.json …")

ipl2026 = {
    "meta": {
        "edition": 19,
        "title": "TATA IPL 2026",
        "season": "2026",
        "startDate": "2026-03-28",
        "endDate": "2026-05-31",
        "totalMatches": 74,
        "matchesPlayed": 9,
        "defendingChampion": "Royal Challengers Bengaluru",
        "lastUpdated": "2026-04-07"
    },
    "groups": {
        "A": ["Chennai Super Kings","Kolkata Knight Riders","Rajasthan Royals","Royal Challengers Bengaluru","Punjab Kings"],
        "B": ["Mumbai Indians","Sunrisers Hyderabad","Gujarat Titans","Delhi Capitals","Lucknow Super Giants"]
    },
    "pointsTable": [
        {"rank":1,"team":"Punjab Kings",             "short":"PBKS","color":"#ED1B24","played":2,"won":2,"lost":0,"nrr":"+0.637","points":4,"form":["W","W"]},
        {"rank":2,"team":"Rajasthan Royals",          "short":"RR", "color":"#EA1A85","played":1,"won":1,"lost":0,"nrr":"+4.171","points":2,"form":["W"]},
        {"rank":3,"team":"Royal Challengers Bengaluru","short":"RCB","color":"#EC1C24","played":1,"won":1,"lost":0,"nrr":"+2.907","points":2,"form":["W"]},
        {"rank":4,"team":"Delhi Capitals",            "short":"DC", "color":"#0078BC","played":1,"won":1,"lost":0,"nrr":"+1.397","points":2,"form":["W"]},
        {"rank":5,"team":"Mumbai Indians",            "short":"MI", "color":"#004BA0","played":1,"won":1,"lost":0,"nrr":"+0.687","points":2,"form":["W"]},
        {"rank":6,"team":"Sunrisers Hyderabad",       "short":"SRH","color":"#FF822A","played":2,"won":1,"lost":1,"nrr":"+0.469","points":2,"form":["L","W"]},
        {"rank":7,"team":"Gujarat Titans",            "short":"GT", "color":"#1C1C2B","played":1,"won":0,"lost":1,"nrr":"-0.391","points":0,"form":["L"]},
        {"rank":8,"team":"Lucknow Super Giants",      "short":"LSG","color":"#A72056","played":1,"won":0,"lost":1,"nrr":"-0.687","points":0,"form":["L"]},
        {"rank":9,"team":"Kolkata Knight Riders",     "short":"KKR","color":"#3A225D","played":2,"won":0,"lost":2,"nrr":"-1.964","points":0,"form":["L","L"]},
        {"rank":10,"team":"Chennai Super Kings",      "short":"CSK","color":"#F9CD05","played":2,"won":0,"lost":2,"nrr":"-2.562","points":0,"form":["L","L"]}
    ],
    "captains": {
        "CSK":"Ruturaj Gaikwad","MI":"Hardik Pandya","RCB":"Rajat Patidar",
        "KKR":"Ajinkya Rahane","DC":"Axar Patel","PBKS":"Shreyas Iyer",
        "RR":"Riyan Parag","SRH":"Ishan Kishan","GT":"Shubman Gill","LSG":"Rishabh Pant"
    },
    "recentResults": [
        {"matchNo":1,"date":"2026-03-28","team1":"Royal Challengers Bengaluru","team2":"Sunrisers Hyderabad","result":"RCB won by 6 wickets","venue":"M. Chinnaswamy Stadium","highlight":"Defending champions open with a statement win"},
        {"matchNo":2,"date":"2026-03-29","team1":"Kolkata Knight Riders","team2":"Punjab Kings","result":"PBKS won","venue":"Eden Gardens","highlight":"PBKS' Cameron Green stars"},
        {"matchNo":3,"date":"2026-03-30","team1":"Chennai Super Kings","team2":"Rajasthan Royals","result":"RR won by 8 wickets","venue":"MA Chidambaram Stadium","highlight":"Jadeja returns to Chepauk — RR hammer CSK"},
        {"matchNo":4,"date":"2026-03-31","team1":"Gujarat Titans","team2":"Mumbai Indians","result":"MI won","venue":"Narendra Modi Stadium","highlight":"Hardik Pandya's MI start strong"},
        {"matchNo":5,"date":"2026-04-01","team1":"Delhi Capitals","team2":"Lucknow Super Giants","result":"DC won","venue":"Arun Jaitley Stadium","highlight":"Axar Patel leads Delhi to victory in home opener"},
        {"matchNo":6,"date":"2026-04-02","team1":"Punjab Kings","team2":"Kolkata Knight Riders","result":"PBKS won","venue":"Punjab Cricket Association Stadium","highlight":"PBKS go 2-0, KKR's big-money buys disappoint"},
        {"matchNo":7,"date":"2026-04-03","team1":"Sunrisers Hyderabad","team2":"Chennai Super Kings","result":"SRH won","venue":"Rajiv Gandhi International Stadium","highlight":"Ishan Kishan's SRH bounce back; CSK still winless"},
        {"matchNo":8,"date":"2026-04-04","team1":"Mumbai Indians","team2":"Rajasthan Royals","result":"RR won","venue":"Wankhede Stadium","highlight":"Vaibhav Suryavanshi watch intensifies"},
        {"matchNo":9,"date":"2026-04-05","team1":"Delhi Capitals","team2":"Gujarat Titans","result":"DC won","venue":"Arun Jaitley Stadium","highlight":"DC go 2-0 with another clinical win"}
    ],
    "upcomingFixtures": [
        {"matchNo":10,"date":"2026-04-08","team1":"Chennai Super Kings","team2":"Kolkata Knight Riders","venue":"MA Chidambaram Stadium","time":"7:30 PM IST"},
        {"matchNo":11,"date":"2026-04-09","team1":"Lucknow Super Giants","team2":"Sunrisers Hyderabad","venue":"Ekana Cricket Stadium","time":"7:30 PM IST"},
        {"matchNo":12,"date":"2026-04-10","team1":"Rajasthan Royals","team2":"Royal Challengers Bengaluru","venue":"Sawai Mansingh Stadium","time":"7:30 PM IST"},
        {"matchNo":13,"date":"2026-04-11","team1":"Mumbai Indians","team2":"Gujarat Titans","venue":"Wankhede Stadium","time":"3:30 PM IST"},
        {"matchNo":14,"date":"2026-04-12","team1":"Punjab Kings","team2":"Delhi Capitals","venue":"Punjab Cricket Association Stadium","time":"7:30 PM IST"}
    ],
    "orangeCap": [
        {"rank":1,"player":"Shreyas Iyer","team":"PBKS","runs":198,"innings":2},
        {"rank":2,"player":"Riyan Parag","team":"RR","runs":167,"innings":1},
        {"rank":3,"player":"Rajat Patidar","team":"RCB","runs":134,"innings":1},
        {"rank":4,"player":"Axar Patel","team":"DC","runs":121,"innings":1},
        {"rank":5,"player":"Hardik Pandya","team":"MI","runs":108,"innings":1}
    ],
    "purpleCap": [
        {"rank":1,"player":"Jasprit Bumrah","team":"MI","wickets":5,"innings":1,"economy":6.2},
        {"rank":2,"player":"Yuzvendra Chahal","team":"PBKS","wickets":4,"innings":2,"economy":7.1},
        {"rank":3,"player":"Cooper Connolly","team":"PBKS","wickets":4,"innings":2,"economy":6.8},
        {"rank":4,"player":"Mohammed Siraj","team":"RCB","wickets":3,"innings":1,"economy":7.4},
        {"rank":5,"player":"Trent Boult","team":"RR","wickets":3,"innings":1,"economy":5.9}
    ],
    "storylines": [
        {"id":"dhoni-farewell","title":"Dhoni's farewell season in crisis","body":"MS Dhoni is playing his final IPL season but CSK sit 0-2, with the legend expected to play a bigger role. The farewell tour risks turning into a disappointment.","tag":"Must Watch"},
        {"id":"kkr-gamble","title":"KKR's Rs.52Cr overseas gamble failing","body":"Cameron Green (Rs.25.2Cr) and Matheesha Pathirana (Rs.18Cr) — KKR's blockbuster auction buys — have yet to fire as the defending 2024 champions sit bottom with 0 points.","tag":"Under Pressure"},
        {"id":"pbks-flying","title":"Punjab Kings flying — 2 wins from 2","body":"Under new captain Shreyas Iyer, PBKS have stormed out of the blocks. After years of playoff heartbreak, they look genuinely threatening this season.","tag":"Form Team"},
        {"id":"rcb-defend","title":"RCB defending their first-ever title","body":"Royal Challengers Bengaluru won their maiden IPL title in 2025. Now under Rajat Patidar, they open 2026 with a win against SRH — the defense is on.","tag":"Champions"},
        {"id":"all-indian-captains","title":"First-ever all-Indian captains in IPL history","body":"For the first time in 19 editions, every IPL team is led by an Indian player. A landmark moment for Indian cricket's domestic pipeline.","tag":"Historic"},
        {"id":"suryavanshi","title":"14-year-old Vaibhav Suryavanshi in RR squad","body":"The teenage sensation from Bihar is in the Rajasthan Royals squad and could become the youngest IPL debutant. Every RR game has an extra dimension.","tag":"Prodigy"}
    ],
    "auctionHighlights": [
        {"player":"Cameron Green","team":"KKR","price":"Rs. 25.2 Cr","note":"Record overseas player"},
        {"player":"Matheesha Pathirana","team":"KKR","price":"Rs. 18 Cr","note":"Sri Lanka pace weapon"},
        {"player":"Prashant Veer","team":"CSK","price":"Rs. 14.2 Cr","note":"Record uncapped player"},
        {"player":"Kartik Sharma","team":"CSK","price":"Rs. 14.2 Cr","note":"Record uncapped player (equal)"},
        {"player":"Liam Livingstone","team":"SRH","price":"Rs. 13 Cr","note":""},
        {"player":"Aaqib Dar","team":"DC","price":"Rs. 8.4 Cr","note":""},
        {"player":"Josh Inglis","team":"LSG","price":"Rs. 8.6 Cr","note":""},
        {"player":"Mustafizur Rahman","team":"KKR","price":"Rs. 9.2 Cr","note":""},
        {"player":"Venkatesh Iyer","team":"RCB","price":"Rs. 7 Cr","note":""},
        {"player":"Jason Holder","team":"GT","price":"Rs. 7 Cr","note":""},
        {"player":"Quinton de Kock","team":"MI","price":"Rs. 1 Cr","note":"Bargain of the auction"},
        {"player":"Cooper Connolly","team":"PBKS","price":"Rs. 3 Cr","note":"Early bargain, starring already"}
    ]
}

with open(f"{PUBLIC}/ipl2026.json", "w") as f:
    json.dump(ipl2026, f, indent=2)
print("  Written ipl2026.json")

# ─────────────────────────────────────────────────────────────────────────────
# DONE
# ─────────────────────────────────────────────────────────────────────────────
print("\n=== Phase 0 Complete ===")
print("Output files:")
for fname in sorted(os.listdir(SRC_DATA)):
    fpath = os.path.join(SRC_DATA, fname)
    size  = os.path.getsize(fpath)
    print(f"  src/data/{fname:35s}  {size/1024:.1f} KB")
fpath = f"{PUBLIC}/ipl2026.json"
print(f"  public/ipl2026.json                         {os.path.getsize(fpath)/1024:.1f} KB")
