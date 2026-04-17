// Shared team constants — single source of truth for all team mappings.
// Includes all 10 active + historical/defunct franchises.

/** Team full name → logo short code */
export const LOGO_CODE: Record<string, string> = {
  'Chennai Super Kings': 'CSK',
  'Mumbai Indians': 'MI',
  'Royal Challengers Bengaluru': 'RCB',
  'Royal Challengers Bangalore': 'RCB',
  'Kolkata Knight Riders': 'KKR',
  'Delhi Capitals': 'DC',
  'Delhi Daredevils': 'DC',
  'Punjab Kings': 'PBKS',
  'Kings XI Punjab': 'PBKS',
  'Rajasthan Royals': 'RR',
  'Sunrisers Hyderabad': 'SRH',
  'Gujarat Titans': 'GT',
  'Lucknow Super Giants': 'LSG',
  'Deccan Chargers': 'DCH',
  'Rising Pune Supergiant': 'RPS',
  'Pune Warriors': 'PWI',
  'Kochi Tuskers Kerala': 'KTK',
};

/** Team full name → brand hex color */
export const TEAM_COLORS: Record<string, string> = {
  'Chennai Super Kings': '#F9CD05',
  'Mumbai Indians': '#004BA0',
  'Royal Challengers Bengaluru': '#EC1C24',
  'Royal Challengers Bangalore': '#EC1C24',
  'Kolkata Knight Riders': '#3A225D',
  'Delhi Capitals': '#0078BC',
  'Delhi Daredevils': '#0078BC',
  'Punjab Kings': '#ED1B24',
  'Kings XI Punjab': '#ED1B24',
  'Rajasthan Royals': '#EA1A85',
  'Sunrisers Hyderabad': '#FF822A',
  'Gujarat Titans': '#1C1C2B',
  'Lucknow Super Giants': '#A72056',
  'Deccan Chargers': '#F7941D',
  'Rising Pune Supergiant': '#6F2E81',
  'Pune Warriors': '#1A4FA0',
  'Kochi Tuskers Kerala': '#8B2C8B',
};

/** Logo short code → local logo path */
export const LOGO_URL: Record<string, string> = {
  CSK:  './logos/CSK.png',
  MI:   './logos/MI.png',
  RCB:  './logos/RCB.png',
  KKR:  './logos/KKR.png',
  DC:   './logos/DC.png',
  PBKS: './logos/PBKS.png',
  RR:   './logos/RR.png',
  SRH:  './logos/SRH.png',
  GT:   './logos/GT.png',
  LSG:  './logos/LSG.png',
  DCH:  './logos/DCH.png',
  RPS:  './logos/RPS.png',
  PWI:  './logos/PWI.png',
  KTK:  './logos/KTK.png',
};

/** Teams with light brand colors that need dark text */
export const TEAM_TEXT_COLOR: Record<string, string> = {
  'Chennai Super Kings': '#000',
  'Sunrisers Hyderabad': '#000',
};

/** Current 10 active franchise names */
export const ACTIVE_TEAMS = [
  'Chennai Super Kings', 'Mumbai Indians', 'Royal Challengers Bengaluru',
  'Kolkata Knight Riders', 'Delhi Capitals', 'Punjab Kings',
  'Rajasthan Royals', 'Sunrisers Hyderabad', 'Gujarat Titans', 'Lucknow Super Giants',
] as const;

/** Get logo URL from a player's team history (uses most recent team) */
export function getTeamLogo(teams: string[]): string {
  for (let i = teams.length - 1; i >= 0; i--) {
    const code = LOGO_CODE[teams[i]];
    if (code) return `./logos/${code}.png`;
  }
  return '';
}
