# IPL Analytics Hub 2026

A comprehensive, mobile-first IPL statistics and live season tracker built with React + TypeScript + Vite. Covers all 18 seasons (2008-2025) of historical data plus live IPL 2026 season tracking with AI-powered daily updates.

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
- **AI-powered daily updates** via GitHub Actions + Claude API

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
- All 18 seasons (2008-2025) with final match details
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
- On This Day -- matches on today's date across all seasons

### Records
- All-time batting & bowling records
- Season records (highest totals, biggest wins)
- Player milestones

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 + CSS custom properties |
| Charts | Recharts |
| Icons | Phosphor Icons |
| Share cards | html2canvas |
| PWA | Custom service worker + Web App Manifest |
| Testing | Vitest + React Testing Library |
| AI Updates | Anthropic Claude API (web search) |
| CI/CD | GitHub Actions (daily cron during IPL season) |
| Data | Pre-computed JSON from 278,205-row IPL CSV (2008-2025) |

## Design System

- Light mode only -- white `#ffffff` background
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
│   ├── logos/              # IPL team logos
│   ├── icons/              # PWA icons
│   ├── ipl2026.json        # Live 2026 season data (fetched at runtime)
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service worker (network-first for live data)
├── src/
│   ├── components/
│   │   ├── Nav.tsx             # Bottom nav (mobile) + top bar (desktop)
│   │   ├── TeamBadge.tsx       # Team logos with fallback
│   │   ├── ShareCard.tsx       # Player stat share card (html2canvas)
│   │   ├── ErrorBoundary.tsx   # Graceful error recovery
│   │   ├── StatCard.tsx        # Reusable stat display
│   │   └── InstallPrompt.tsx   # PWA install prompt
│   ├── lib/
│   │   └── teams.ts            # Shared team constants (colors, logos, codes)
│   ├── hooks/
│   │   └── useIPL2026.ts       # Runtime fetch hook for live 2026 data
│   ├── data/                   # 20+ pre-computed JSON data files
│   │   ├── player-batters.json
│   │   ├── player-bowlers.json
│   │   ├── season-summary.json
│   │   ├── venue-analytics.json
│   │   ├── rivalries-all.json
│   │   └── ...
│   ├── pages/                  # Code-split via React.lazy()
│   │   ├── Home.tsx            # IPL 2026 live hub
│   │   ├── Teams.tsx           # Team profiles + H2H
│   │   ├── Players.tsx         # Player profiles + compare
│   │   ├── Seasons.tsx         # Season history
│   │   ├── Analytics.tsx       # Stats analytics tabs
│   │   ├── DeepDives.tsx       # Deep analysis sections
│   │   └── Records.tsx         # All-time records
│   ├── __tests__/
│   │   └── smoke.test.tsx      # Smoke tests for components + constants
│   ├── types.ts
│   └── main.tsx
├── pipeline/
│   ├── build_data.py           # Python pipeline: IPL.csv -> JSON files
│   ├── update_2026.py          # AI-powered live data updater (Claude API)
│   └── requirements.txt        # Python deps for update script
└── .github/
    └── workflows/
        └── update-ipl2026.yml  # Daily cron: auto-update live 2026 data
```

---

## Data Pipeline

### Historical Data (2008-2025)

The `pipeline/build_data.py` script processes the raw `IPL.csv` (278,205 rows x 64 columns, ball-by-ball data 2008-2025) into all JSON data files used by the app.

```bash
cd pipeline
python build_data.py
```

### Live 2026 Data (AI-Powered)

The `pipeline/update_2026.py` script uses the Claude API with web search to automatically update `public/ipl2026.json` after each match day:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
python pipeline/update_2026.py
```

It searches trusted sources (iplt20.com, ESPNcricinfo, Wikipedia), extracts match results, points table, Orange/Purple Cap standings, and generates match-specific storylines.

**Automated via GitHub Actions:** A cron job runs daily at 11:30 PM IST during IPL season. To enable:
1. Add `ANTHROPIC_API_KEY` as a repository secret (Settings > Secrets > Actions)
2. The workflow runs automatically, or trigger manually from the Actions tab

> **Note:** AI-generated data should be reviewed for accuracy. NRR values and cap stats may need manual correction via the GitHub file editor.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint
npm run lint

# Preview production build
npm run preview
```

---

## Architecture Improvements

This project includes several engineering improvements over the initial build:

- **Shared constants** -- Team colors, logos, and codes in a single `src/lib/teams.ts` (was duplicated across 5+ files)
- **Code splitting** -- All 7 pages lazy-loaded via `React.lazy()` + `Suspense` (reduces initial bundle)
- **Error boundary** -- Graceful error recovery instead of blank screen on crashes
- **Runtime data fetch** -- `ipl2026.json` fetched at runtime (not bundled), service worker provides offline fallback
- **Accessibility** -- ARIA labels on navigation, `scope="col"` on tables, `role="dialog"` on modals
- **Smoke tests** -- Vitest + React Testing Library for component and constants validation
- **Unused deps removed** -- Cleaned out `lucide-react`, `clsx`, and dead `App.css`

---

## Data Sources

- Historical ball-by-ball data: IPL CSV dataset (2008-2025)
- IPL 2026 live data: [iplt20.com](https://iplt20.com), [ESPNcricinfo](https://espncricinfo.com), [Wikipedia](https://en.wikipedia.org/wiki/2026_Indian_Premier_League)
- Finals data verified against Wikipedia IPL season pages
- Team logos: Official IPL team assets

---

## PWA Support

Install as a Progressive Web App on any device:
- Add to Home Screen on iOS/Android
- Offline support via service worker caching
- Custom app icons and splash screen

---

## License

MIT
