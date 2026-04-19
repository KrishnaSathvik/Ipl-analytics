# IPL ANALYTICS PLATFORM — PROJECT STRUCTURE
## React + TypeScript + Tailwind + shadcn/ui + Recharts

---

## BUILD APPROACH

**Toolchain**: Web Artifacts Builder (init-artifact.sh → develop → bundle-artifact.sh)  
**Stack**: React 18 + TypeScript + Vite + Tailwind CSS 3.4 + shadcn/ui + Recharts  
**Output**: Single bundled HTML artifact (~200-400KB)  
**Data**: Pre-processed from 278K row CSV → embedded JSON (~80-100KB)

---

## DIRECTORY STRUCTURE

```
ipl-analytics/
│
├── index.html                          # Entry point
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── components.json                     # shadcn config
│
├── src/
│   ├── main.tsx                        # React mount
│   ├── index.css                       # Tailwind + CSS variables + custom theme
│   ├── App.tsx                         # Root: router + layout + state
│   │
│   ├── data/
│   │   ├── ipl-data.ts                 # Master data export (all pre-computed JSON)
│   │   ├── types.ts                    # TypeScript interfaces for all data shapes
│   │   ├── constants.ts                # Team colors, team names, season mappings
│   │   ├── sql-tables.ts              # AlaSQL table definitions + seed data
│   │   └── query-library.ts           # 25+ pre-built SQL queries with descriptions
│   │
│   ├── lib/
│   │   ├── utils.ts                    # shadcn cn() + general utilities
│   │   ├── formatters.ts              # Number formatting, percentage, run rate
│   │   ├── chart-helpers.ts           # Tooltip, color generators, axis formatters
│   │   ├── sql-engine.ts             # AlaSQL init, execute, error handling
│   │   ├── ai-query.ts              # Anthropic API prompt builder + response parser
│   │   └── auto-viz.ts              # Result shape detection → chart type selection
│   │
│   ├── hooks/
│   │   ├── useMediaQuery.ts           # Responsive breakpoint detection
│   │   ├── useTeamTheme.ts            # Dynamic team color theming
│   │   ├── useDebounce.ts             # Debounced search input
│   │   └── useQueryEngine.ts          # SQL execution + AI query state management
│   │
│   ├── components/
│   │   │
│   │   ├── layout/
│   │   │   ├── TopNav.tsx             # Desktop horizontal nav bar (sticky)
│   │   │   ├── BottomNav.tsx          # Mobile bottom tab bar (5 icons)
│   │   │   ├── MobileMenu.tsx         # Hamburger slide-out with all sections
│   │   │   ├── PageHeader.tsx         # Section title + breadcrumb + context filters
│   │   │   └── AppShell.tsx           # Wraps everything: nav + content + responsive logic
│   │   │
│   │   ├── shared/
│   │   │   ├── StatCard.tsx           # Big number + label + sub-stat
│   │   │   ├── ChartCard.tsx          # Titled chart wrapper with metric toggle pills
│   │   │   ├── MetricToggle.tsx       # Pill button group for switching chart metrics
│   │   │   ├── TeamPillStrip.tsx      # Horizontal team selector with brand colors
│   │   │   ├── SeasonStrip.tsx        # Horizontal year selector (2008–2025)
│   │   │   ├── SearchBar.tsx          # Player search with instant filter
│   │   │   ├── FilterPills.tsx        # Batter/Bowler/All-rounder toggle
│   │   │   ├── LeaderboardTable.tsx   # Sortable table with sticky headers, rank styling
│   │   │   ├── PlayerCard.tsx         # Compact player summary card (search results)
│   │   │   ├── EmptyState.tsx         # "No results" / "Select a team" placeholder
│   │   │   └── CustomTooltip.tsx      # Glass-morphism chart tooltip
│   │   │
│   │   ├── charts/
│   │   │   ├── PhaseRadar.tsx         # 3-axis radar: PP / Middle / Death
│   │   │   ├── H2HGrid.tsx           # Color-coded head-to-head heatmap/table
│   │   │   ├── DismissalDonut.tsx     # Donut chart for dismissal breakdown
│   │   │   ├── WinLossTimeline.tsx    # Season-by-season W/L stacked bar
│   │   │   ├── ScoreDistribution.tsx  # Histogram: score buckets (<120, 120-149, etc.)
│   │   │   ├── OverByOverChart.tsx    # 20-over run rate / wicket / sixes chart
│   │   │   └── TrendLine.tsx          # Reusable area/line chart with gradient
│   │   │
│   │   └── query/
│   │       ├── SqlEditor.tsx          # Syntax-highlighted SQL input (textarea-based)
│   │       ├── AiChatInput.tsx        # Natural language input bar + example chips
│   │       ├── QueryResults.tsx       # Table + auto-chart toggle for query results
│   │       ├── QueryLibrary.tsx       # Sidebar/drawer with pre-built query cards
│   │       └── SqlDisplay.tsx         # Read-only formatted SQL (AI-generated)
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx              # Home: hero stats, trends, titles, highlights
│   │   ├── TeamExplorer.tsx           # Team profile: all 12 sections per franchise
│   │   ├── HeadToHead.tsx             # Dual-team rivalry comparator
│   │   ├── Players.tsx                # Search + filter → player profiles
│   │   ├── BatterProfile.tsx          # Full batter analytics (10 sections)
│   │   ├── BowlerProfile.tsx          # Full bowler analytics (10 sections)
│   │   ├── SeasonDive.tsx             # Per-season deep dive
│   │   ├── VenueAnalytics.tsx         # Venue stats and breakdowns
│   │   ├── Records.tsx                # All-time records, milestones, superlatives
│   │   └── QueryLab.tsx               # SQL editor + AI query (tabbed)
│   │
│   └── components/ui/                 # shadcn/ui components (auto-generated)
│       ├── button.tsx
│       ├── card.tsx
│       ├── tabs.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── skeleton.tsx
│       ├── table.tsx
│       ├── toggle-group.tsx
│       ├── tooltip.tsx
│       └── ...                        # 40+ shadcn components available
│
├── scripts/                           # Pre-processing (runs before build)
│   └── process-ipl-data.py            # CSV → JSON transformer
│       │
│       │  Reads: IPL.csv (278,205 rows × 64 columns)
│       │  Outputs: Single ipl-data.ts with all computed datasets
│       │
│       │  Computed datasets:
│       │  ├── overview          → Hero stats, totals
│       │  ├── seasonData[]      → Per-season aggregates
│       │  ├── teamProfiles{}    → 15 teams × full profile data
│       │  │   ├── info          → Name, abbreviation, color, titles, home ground
│       │  │   ├── seasonRecord  → W/L/NR per season
│       │  │   ├── phaseBatting  → PP/Middle/Death RR, dots, boundaries
│       │  │   ├── topBatters    → Top 10 run scorers for franchise
│       │  │   ├── topBowlers    → Top 10 wicket takers for franchise
│       │  │   ├── h2h           → Record vs every other team
│       │  │   ├── tossImpact    → Bat first vs field first W/L
│       │  │   ├── venueRecord   → Win% at top 8 venues
│       │  │   ├── dismissals    → How batters get out (batting)
│       │  │   ├── dismissalsBowling → How they get batters out (bowling)
│       │  │   ├── records       → Highest/lowest scores, biggest wins
│       │  │   └── pomLeaders    → Top POM winners for franchise
│       │  │
│       │  ├── batterProfiles{}  → ~100 batters (500+ runs filter)
│       │  │   ├── career        → Runs, balls, SR, matches, 4s, 6s
│       │  │   ├── seasonwise    → Runs/SR per season
│       │  │   ├── phaseBreakdown → PP/Middle/Death stats
│       │  │   ├── dismissals    → Caught/bowled/lbw/run out/stumped
│       │  │   ├── vsTeams       → Runs scored against each team
│       │  │   ├── byPosition    → Runs at each batting position
│       │  │   ├── boundaryPct   → % runs from boundaries
│       │  │   └── pomCount      → Player of Match awards
│       │  │
│       │  ├── bowlerProfiles{}  → ~80 bowlers (50+ wickets filter)
│       │  │   ├── career        → Wickets, economy, balls, matches
│       │  │   ├── seasonwise    → Wickets/economy per season
│       │  │   ├── phaseBreakdown → PP/Middle/Death economy & wickets
│       │  │   ├── dismissalTypes → Caught/bowled/lbw/stumped
│       │  │   ├── vsTeams       → Wickets against each team
│       │  │   ├── byBatPosition → Wickets at each batting position
│       │  │   └── dotBallPct    → Dot ball % per phase
│       │  │
│       │  ├── overAnalysis[]    → 20 entries (per-over RR, wickets, 6s, dots)
│       │  ├── venueData[]       → Top 30 venues with scores, toss, teams
│       │  ├── h2hMatrix{}       → Full team × team results matrix
│       │  ├── records{}         → All record categories
│       │  │   ├── highestInnings
│       │  │   ├── highestTeamScores
│       │  │   ├── lowestTeamScores
│       │  │   ├── biggestWinsByRuns
│       │  │   ├── closestFinishes
│       │  │   ├── superOvers
│       │  │   ├── dlsMatches
│       │  │   ├── mostPOM
│       │  │   ├── topFielders
│       │  │   ├── positionAverages
│       │  │   └── scoreDistribution
│       │  │
│       │  └── sqlTables{}       → Flattened tables for AlaSQL
│       │      ├── matches[]     → 1,169 rows (match-level)
│       │      ├── batterInnings[] → ~25K rows (per-match batter stats)
│       │      ├── bowlerInnings[] → ~20K rows (per-match bowler stats)
│       │      ├── teamInnings[]   → ~2,400 rows (per-innings team totals)
│       │      └── overSummary[]   → ~23K rows (per-over aggregates)
│
└── bundle.html                        # Final artifact output (single file)
```

---

## DATA FLOW

```
                    BUILD TIME                              RUNTIME
                    ──────────                              ───────

  IPL.csv          process-ipl-data.py          ipl-data.ts
  (107 MB)  ────►  Python preprocessing  ────►  (~80-100KB JSON)
  278K rows        Team normalization            Embedded in bundle
  64 columns       Phase computation
                   H2H matrix build              ┌─────────────────┐
                   Profile aggregation           │   React App      │
                   SQL table flattening           │                 │
                                                 │  Dashboard ◄──── ipl-data.ts
                                                 │  Teams     ◄──── teamProfiles
                                                 │  Players   ◄──── batterProfiles
                                                 │             ◄──── bowlerProfiles
                                                 │  Seasons   ◄──── seasonData
                                                 │  Venues    ◄──── venueData
                                                 │  Records   ◄──── records
                                                 │                 │
                                                 │  Query Lab      │
                                                 │   ├─ SQL ◄───── AlaSQL + sqlTables
                                                 │   └─ AI  ◄───── Anthropic API
                                                 │                 │
                                                 └─────────────────┘
```

---

## PAGE ARCHITECTURE & COMPONENT MAP

### Dashboard.tsx
```
┌─ PageHeader ("IPL Analytics · 2008–2025") ──────────────────────────┐
│                                                                      │
│  ┌─StatCard─┐ ┌─StatCard─┐ ┌─StatCard─┐ ┌─StatCard─┐ ┌─StatCard─┐ │
│  │ 1,169    │ │ 278K     │ │ 703      │ │ 18       │ │ 59       │ │
│  │ Matches  │ │ Balls    │ │ Batters  │ │ Seasons  │ │ Venues   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                                      │
│  ┌─ Title Winners (team cards with trophy count + brand colors) ──┐ │
│                                                                      │
│  ┌─ ChartCard ─────────────────┐  ┌─ ChartCard ─────────────────┐ │
│  │ "Avg Runs Per Match"        │  │ "Sixes Per Season"          │ │
│  │  TrendLine (area)           │  │  BarChart (vertical)        │ │
│  └─────────────────────────────┘  └─────────────────────────────┘ │
│                                                                      │
│  ┌─ ChartCard ─────────────────┐  ┌─ ChartCard ─────────────────┐ │
│  │ "Powerplay Run Rate"        │  │ "Score Distribution"        │ │
│  │  TrendLine (area)           │  │  ScoreDistribution          │ │
│  └─────────────────────────────┘  └─────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### TeamExplorer.tsx
```
┌─ TeamPillStrip (CSK | MI | RCB | KKR | DC | ...) ──────────────────┐
│   [each pill = team color, selected = glow ring]                     │
│                                                                      │
│  ┌─ Team Hero ──────────────────────────────────────────────────┐   │
│  │  CHENNAI SUPER KINGS · 5× Champions                          │   │
│  │  252 Matches · 142 Wins · 56.3% · Home: Chepauk             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ WinLossTimeline ──────────┐  ┌─ PhaseRadar ──────────────┐    │
│  │ Season-by-season W/L bars  │  │ PP / Middle / Death        │    │
│  │ (trophy icons on titles)   │  │ (vs IPL average overlay)   │    │
│  └────────────────────────────┘  └────────────────────────────┘    │
│                                                                      │
│  ┌─ LeaderboardTable ─────────┐  ┌─ LeaderboardTable ────────┐    │
│  │ "Top Batters (for team)"   │  │ "Top Bowlers (for team)"  │    │
│  │ Dhoni, Raina, Faf, ...     │  │ Jadeja, Bravo, Ashwin ... │    │
│  └────────────────────────────┘  └────────────────────────────┘    │
│                                                                      │
│  ┌─ H2HGrid (vs every other team) ─────────────────────────────┐   │
│  │ Color-coded: green (winning) / red (losing) / amber (even)   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ Toss Impact ──────────────┐  ┌─ DismissalDonut ──────────┐    │
│  │ Bat first W/L              │  │ Caught 67% / Bowled 15%   │    │
│  │ Field first W/L            │  │ LBW 7% / Run out 4% ...   │    │
│  └────────────────────────────┘  └────────────────────────────┘    │
│                                                                      │
│  ┌─ Venue Performance ──────────────────────────────────────────┐   │
│  │ Top 8 grounds: matches, wins, win% (bar chart)               │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ Team Records ───────────────────────────────────────────────┐   │
│  │ Highest score | Lowest score | Biggest win | POM leaders     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### HeadToHead.tsx
```
┌─ Team A Selector ─────────────  vs  ─────────── Team B Selector ───┐
│  [CSK pill active]                              [MI pill active]     │
│                                                                      │
│  ┌───────── Split Theme (CSK gold | MI blue) ────────────────────┐ │
│  │   CSK  18 W ─────── RECORD ─────── 21 W  MI                  │ │
│  │        58%  ─── TOSS WIN%  ───  62%                           │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ Rivalry Timeline (year by year results) ─────────────────────┐ │
│  ┌─ Top Performers in this matchup ──────────────────────────────┐ │
│  ┌─ Venue breakdown ─────────────────────────────────────────────┐ │
│  ┌─ Biggest wins both ways ──────────────────────────────────────┐ │
└──────────────────────────────────────────────────────────────────────┘
```

### Players.tsx → BatterProfile.tsx / BowlerProfile.tsx
```
┌─ SearchBar ("Search players...") ───────────────────────────────────┐
│  ┌─ FilterPills [Batters] [Bowlers] [All-rounders] ──────────────┐ │
│  ┌─ Sort: [Runs ▾] ─────────────────────────────────────────────┐ │
│                                                                      │
│  ┌─PlayerCard─┐ ┌─PlayerCard─┐ ┌─PlayerCard─┐ ┌─PlayerCard─┐      │
│  │ V Kohli    │ │ RG Sharma  │ │ S Dhawan   │ │ DA Warner  │      │
│  │ 8,671 runs │ │ 7,048 runs │ │ 6,769 runs │ │ 6,567 runs │      │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘      │
│  ... (click opens BatterProfile or BowlerProfile)                    │
└──────────────────────────────────────────────────────────────────────┘

BatterProfile.tsx:
┌─ Player Hero (name, career stats, POM count) ───────────────────────┐
│  ┌─ Season Chart ─────────────┐  ┌─ Phase Breakdown ────────────┐  │
│  │ Runs per season + SR line  │  │ PP / Middle / Death stats    │  │
│  ├─ DismissalDonut ───────────┤  ├─ vs Teams (bar chart) ───────┤  │
│  │ Caught 65% / Bowled 18%    │  │ Runs vs CSK, MI, RCB ...    │  │
│  ├─ Position Analysis ────────┤  ├─ Boundary % ─────────────────┤  │
│  │ Runs at #1, #2, #3, #4    │  │ 4s: 42%, 6s: 18%, Others    │  │
│  └────────────────────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### QueryLab.tsx
```
┌─ Mode Toggle: [ SQL ] [ Ask AI ] ───────────────────────────────────┐
│                                                                      │
│  SQL MODE:                           AI MODE:                        │
│  ┌─ SqlEditor ──────────────┐       ┌─ AiChatInput ─────────────┐  │
│  │ SELECT batter, SUM(runs) │       │ "Which bowler dismisses    │  │
│  │ FROM batter_innings      │       │  Kohli the most?"          │  │
│  │ GROUP BY batter          │       │          [Ask] [Examples]  │  │
│  │ ORDER BY 2 DESC          │       └────────────────────────────┘  │
│  │ LIMIT 10;                │                                        │
│  │         [Run ▶] [Clear]  │       ┌─ SqlDisplay (generated) ───┐  │
│  └──────────────────────────┘       │ SELECT bowler, COUNT(*)... │  │
│                                      └────────────────────────────┘  │
│  ┌─ QueryResults ───────────────────────────────────────────────┐   │
│  │  [Table] [Chart] [Export CSV]                                 │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │  Auto-detected chart OR data table                     │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─ QueryLibrary (collapsible sidebar / drawer) ────────────────┐   │
│  │  "Top 10 run scorers who never won POM"          [Run]       │   │
│  │  "Teams that won after losing toss by season"    [Run]       │   │
│  │  "Batters with 150+ SR in death (min 100 balls)" [Run]       │   │
│  │  "Most expensive overs in IPL history"           [Run]       │   │
│  │  "Bowlers who dismiss Kohli the most"            [Run]       │   │
│  │  ... (25+ queries)                                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## RESPONSIVE BEHAVIOR

### Desktop (1024px+)
- TopNav: horizontal tabs, full labels
- Content: 1200px max-width, 2-column grid for chart pairs
- Tables: full width, all columns visible
- QueryLab: editor + results stacked, library as sidebar

### Tablet (768–1023px)
- TopNav: horizontal, compressed labels
- Content: single column, charts full-width
- Tables: full width, scrollable if needed
- QueryLab: editor + results stacked, library as drawer

### Mobile (<768px)
- TopNav → hamburger menu (MobileMenu.tsx)
- BottomNav: 5 icons (Home, Teams, Players, Records, Query)
- Content: single column, cards stack
- Charts: 100% width, 200px min-height
- Tables: horizontal scroll, sticky first column
- TeamPillStrip: scrollable with touch swipe
- QueryLab: full-width editor (120px), bottom-pinned AI input

---

## STATE MANAGEMENT

```
App.tsx (root state)
├── activePage: string              # Current page/route
├── selectedTeam: string | null     # Active team in TeamExplorer
├── selectedPlayer: string | null   # Active player in Players
├── selectedSeason: string | null   # Active season in SeasonDive
├── h2hTeams: [string, string]      # Head to Head pair
├── queryMode: 'sql' | 'ai'        # QueryLab mode
├── isMobile: boolean               # From useMediaQuery hook
└── teamAccent: string              # Dynamic CSS variable from useTeamTheme
```

No external state library needed — React useState + context for theme.
Data is static (imported JSON), so no async loading or caching required.

---

## BUILD PIPELINE

```bash
# Step 0: Pre-process data (one-time, runs in Python)
python scripts/process-ipl-data.py

# Step 1: Initialize project
bash /mnt/skills/examples/web-artifacts-builder/scripts/init-artifact.sh ipl-analytics

# Step 2: Install additional dependencies
cd ipl-analytics
pnpm install recharts alasql

# Step 3: Develop (create all files above)
# ... edit src/ files ...

# Step 4: Bundle to single HTML artifact
bash /mnt/skills/examples/web-artifacts-builder/scripts/bundle-artifact.sh

# Step 5: Present bundle.html to user
```

---

## ESTIMATED SIZES

| Component              | Approx Size  |
|------------------------|-------------|
| Pre-computed JSON data | 80–100 KB   |
| React + Recharts       | ~150 KB gz  |
| shadcn/ui components   | ~30 KB gz   |
| Tailwind CSS           | ~15 KB gz   |
| App code (all pages)   | ~60 KB gz   |
| AlaSQL engine          | ~80 KB gz   |
| **Total bundle.html**  | **~400–500 KB** |

---

## DEVELOPMENT ORDER

### Phase 1: Foundation
1. `process-ipl-data.py` — generate all JSON data
2. `data/` layer — types, constants, data exports
3. `AppShell` + `TopNav` + `BottomNav` — navigation skeleton
4. `Dashboard.tsx` — hero stats + trend charts

### Phase 2: Team & Player Profiles
5. `TeamExplorer.tsx` — full team profile page
6. `HeadToHead.tsx` — rivalry comparator
7. `Players.tsx` + `BatterProfile.tsx` + `BowlerProfile.tsx`

### Phase 3: Deep Dives
8. `SeasonDive.tsx` — per-season analysis
9. `VenueAnalytics.tsx` — ground stats
10. `Records.tsx` — all-time records

### Phase 4: Query Engine
11. `sql-engine.ts` + `SqlEditor.tsx` — AlaSQL integration
12. `ai-query.ts` + `AiChatInput.tsx` — Claude API integration
13. `QueryLab.tsx` — combined SQL + AI interface

### Phase 5: Polish
14. Mobile responsive testing + fixes
15. Micro-interactions + animations
16. Performance optimization (lazy rendering large tables)
17. Bundle + deliver
