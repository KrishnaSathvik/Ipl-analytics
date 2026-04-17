// ── IPL 2026 Types ────────────────────────────────────────────────────────────

export interface PointsTableEntry {
  rank: number;
  team: string;
  short: string;
  color: string;
  played: number;
  won: number;
  lost: number;
  nr?: number;
  nrr: string;
  points: number;
  form: string[];
}

export interface MatchResult {
  matchNo: number;
  date: string;
  team1: string;
  team2: string;
  result: string;
  venue: string;
  highlight: string;
}

export interface Fixture {
  matchNo: number;
  date: string;
  team1: string;
  team2: string;
  venue: string;
  time: string;
}

export interface CapEntry {
  rank: number;
  player: string;
  team: string;
  matches?: number;
  innings?: number;
  // Batting
  runs?: number;
  avg?: number;
  sr?: number;
  fours?: number;
  sixes?: number;
  // Bowling
  wickets?: number;
  overs?: number;
  balls?: number;
  economy?: number;
  fourWickets?: number;
  fiveWickets?: number;
}

export interface Storyline {
  id: string;
  title: string;
  body: string;
  tag: string;
}

export interface AuctionBuy {
  player: string;
  team: string;
  price: string;
  note: string;
}

export interface IPL2026Data {
  meta: {
    edition: number;
    title: string;
    season: string;
    startDate: string;
    endDate: string;
    totalMatches: number;
    matchesPlayed: number;
    defendingChampion: string;
    lastUpdated: string;
  };
  groups: { A: string[]; B: string[] };
  pointsTable: PointsTableEntry[];
  captains: Record<string, string>;
  recentResults: MatchResult[];
  upcomingFixtures: Fixture[];
  orangeCap: CapEntry[];
  purpleCap: CapEntry[];
  storylines: Storyline[];
  auctionHighlights: AuctionBuy[];
}

// ── Historical Data Types ─────────────────────────────────────────────────────

export interface TeamProfile {
  name: string;
  short: string;
  color: string;
  textColor: string;
  city: string;
  ground: string;
  founded: number;
  active: boolean;
  titles: string[];
  titleCount: number;
  seasonsPlayed: string[];
  stats: {
    played: number;
    won: number;
    lost: number;
    noResult: number;
    winPct: number;
    runs: number;
    sixes: number;
    fours: number;
    tossWon: number;
    tossPct: number;
  };
  topBatter: { player: string; runs: number };
  topBowler: { player: string; wickets: number };
}

export interface BatterRecord {
  player: string;
  runs: number;
  balls: number;
  innings: number;
  avg: number;
  sr: number;
  fifties: number;
  hundreds: number;
  highest: number;
  sixes: number;
  fours: number;
  ducks: number;
  teams: string[];
  firstSeason: string;
  lastSeason: string;
}

export interface BowlerRecord {
  player: string;
  wickets: number;
  balls: number;
  overs: number;
  runs: number;
  economy: number;
  avg: number;
  sr: number;
  fourWickets: number;
  fiveWickets: number;
  bestInnings: number;
  dots: number;
  teams: string[];
  firstSeason: string;
  lastSeason: string;
}

export interface SeasonSummary {
  season: string;
  champion: string;
  totalMatches: number;
  totalRuns: number;
  totalWickets: number;
  totalSixes: number;
  totalFours: number;
  orangeCap: { player: string; runs: number };
  purpleCap: { player: string; wickets: number };
  mostPOM: string;
  final?: {
    runnerUp: string;
    venue: string;
    result: string;
    winnerScore: string;
    runnerUpScore: string;
    mom: string;
    winnerCaptain: string;
    runnerUpCaptain: string;
  };
}

export interface OverStat {
  over: number;
  runs: number;
  wickets: number;
  sixes: number;
  fours: number;
  dots: number;
  runRate: number;
  balls: number;
}

export interface VenueStat {
  venue: string;
  city: string;
  matches: number;
  totalRuns: number;
  avgScore: number;
  sixes: number;
  fours: number;
  batFirstWins: number;
  fieldFirstWins: number;
}

export interface H2HRecord {
  team1: string;
  team2: string;
  played: number;
  t1Wins: number;
  t2Wins: number;
  noResult: number;
}

export interface Records {
  mostRuns: { batter: string; runs: number }[];
  mostSixes: { batter: string; sixes: number }[];
  mostFours: { batter: string; fours: number }[];
  highestScore: { batter: string; highest: number }[];
  mostCenturies: { batter: string; hundreds: number }[];
  mostWickets: { bowler: string; wickets: number }[];
  allTimeSixes: number;
  allTimeFours: number;
  allTimeRuns: number;
  totalMatches: number;
  totalSeasons: number;
}

