# 🏏 IPL Analytics Hub 2026

A comprehensive, mobile-first IPL statistics and live season tracker built with React + TypeScript + Vite. Covers all 18 seasons (2008–2025) of historical data plus live IPL 2026 season tracking.

**Live Demo:** https://www.perplexity.ai/computer/a/ipl-analytics-hub-2026-gCWjWkSGRIyW.Xk4MNe.nw

---

## Features

### IPL 2026 (Live Season)
- Real-time points table with NRR, form, playoff indicators
- Recent match results with scorecards and highlights
- Upcoming fixtures
- Orange Cap & Purple Cap live leaderboards
- 2026 Captains grid
- Key Storylines updated each match day
- Mega Auction Highlights (verified against official BCCI/iplt20.com data)

### Teams
- All 10 active franchises + historical teams (Deccan Chargers, Rising Pune Supergiant etc.)
- Season-by-season win/loss chart per team
- IPL Season Timeline with championship years
- Head-to-Head records against every opponent with last 5 results

### Players
- 393 batters + 345 bowlers with full career IPL stats
- Team filter, search, and sorting
- Individual profiles with career charts (wickets/SR per season)
- Visual compare mode (any two players side by side)
- Batter vs Bowler matchup matrix
- Clutch stats (death overs performance)
- Share card image generation per player

### Season History
- All 18 seasons (2008–2025) with final match details:
  - Both finalists with team logos
  - Full scores, result margin
  - Winning & runner-up captains
  - Man of the Match
  - Venue
- Season-level stats: runs, wickets, sixes, fours
- Orange Cap, Purple Cap, Most POM per season

### Analytics
- Over-by-over run rate analysis (all 20 overs)
- Venue analytics (45 venues, sortable by matches/sixes/run rate)
- Powerplay stats by team
- Toss analysis (win% and decision trends)
- Clutch performers (death overs batters & bowlers)

### Deep Dives
- 45 all-time rivalries with win/loss records
- Top partnerships
- Home advantage analysis
- On This Day — matches on today's date across all seasons

### Records
- All-time batting & bowling records
- Season records (highest totals, biggest wins)
- Player milestones
- IPL Firsts

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Charts | Recharts |
| Icons | Phosphor Icons |
| Share cards | html2canvas |
| PWA | Custom service worker + Web App Manifest |
| Data | Pre-computed JSON from 278,205-row IPL CSV (2008–2025) |

## Design System

- Light mode only — white `#ffffff` background
- Accent: `#f97316` (orange)
- Font: Geist (Google Fonts)
- Vercel/Linear-inspired minimal aesthetic
- All tables use `tableLayout: fixed` with `colgroup` for mobile-first layout
- No horizontal overflow on 390px viewport

---

## Project Structure

```
ipl-app/
├── public/
│   ├── logos/          # Real IPL team logos (CSK, MI, RCB, KKR, DC, PBKS, RR, SRH, GT, LSG, DCH)
│   ├── icons/          # PWA icons
│   ├── manifest.json   # PWA manifest
│   └── sw.js           # Service worker
├── src/
│   ├── components/
│   │   ├── Nav.tsx         # Bottom nav (mobile) + top bar (desktop)
│   │   ├── TeamBadge.tsx   # Real team logos with fallback
│   │   ├── ShareCard.tsx   # Player stat share card (html2canvas)
│   │   └── InstallPrompt.tsx
│   ├── data/               # 20+ pre-computed JSON data files
│   │   ├── ipl2026.json            # Live 2026 season data
│   │   ├── player-batters.json     # 393 batters
│   │   ├── player-bowlers.json     # 345 bowlers
│   │   ├── season-summary.json     # 18 seasons + finals data
│   │   ├── venue-analytics.json    # 45 venues
│   │   ├── rivalries-all.json      # 45 team pair rivalries
│   │   └── ...
│   ├── pages/
│   │   ├── Home.tsx        # IPL 2026 live hub
│   │   ├── Teams.tsx       # Team profiles + H2H
│   │   ├── Players.tsx     # Player profiles + compare
│   │   ├── Seasons.tsx     # Season history
│   │   ├── Analytics.tsx   # Stats analytics tabs
│   │   ├── DeepDives.tsx   # Deep analysis sections
│   │   └── Records.tsx     # All-time records
│   ├── types.ts
│   └── main.tsx
└── pipeline/
    └── build_data.py   # Python pipeline: IPL.csv → all JSON files
```

---

## Data Pipeline

The `pipeline/build_data.py` script processes the raw `IPL.csv` (278,205 rows × 64 columns, ball-by-ball data 2008–2025) into all JSON data files used by the app.

```bash
cd pipeline
python build_data.py
```

All outputs are written directly to `src/data/`.

The `ipl2026.json` file is manually maintained with live 2026 season data and updated after each match.

---

## Getting Started

```bash
# Install dependencies
cd ipl-app
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Data Sources

- Historical ball-by-ball data: IPL CSV dataset (2008–2025)
- IPL 2026 live data: [ESPNcricinfo](https://espncricinfo.com), [Cricbuzz](https://cricbuzz.com), [iplt20.com](https://iplt20.com)
- Finals data verified against Wikipedia IPL season pages
- Team logos: Official IPL team assets
- Player bios: iplt20.com

---

## PWA Support

Install as a Progressive Web App on any device:
- Add to Home Screen on iOS/Android
- Offline support via service worker caching
- Custom app icons and splash screen

---

## License

MIT
