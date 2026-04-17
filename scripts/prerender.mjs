/**
 * Lightweight prerender script.
 *
 * After `vite build`, this reads dist/index.html and creates per-route
 * copies with the correct <title>, <meta description>, <link canonical>,
 * and OG tags stamped in. No Puppeteer — just string replacement.
 *
 * Crawlers that don't execute JS (Facebook, Twitter, WhatsApp, LinkedIn,
 * Slack, iMessage) will see the right metadata for each route. Google's
 * JS-rendering crawler will hydrate react-helmet-async on top.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const SITE = 'https://iplanalyticsapp.vercel.app';

const ROUTES = [
  {
    path: '/teams',
    title: 'IPL Teams — Profiles, Rivalries & Head-to-Head — IPL Analytics Hub',
    description: 'All 10 active IPL franchises: season-by-season stats, head-to-head records, and all-time rivalries across 18 seasons of IPL history.',
  },
  {
    path: '/players',
    title: 'Player Stats — Batters & Bowlers — IPL Analytics Hub',
    description: 'Deep IPL career stats for 703 batters and 550 bowlers across 18 seasons. Compare runs, strike rates, wickets, economy, batter-vs-bowler matchups.',
  },
  {
    path: '/seasons',
    title: 'IPL Seasons History — All 18 Editions (2008–2025) — IPL Analytics Hub',
    description: 'Every IPL season from 2008 to 2025 — champions, runners-up, Orange Cap, Purple Cap, run totals and standout moments across 1,169 matches.',
  },
  {
    path: '/records',
    title: 'IPL All-Time Records — Highest, Lowest, Milestones — IPL Analytics Hub',
    description: 'Every IPL record that matters: most runs, most wickets, highest team totals (SRH 287), lowest totals (RCB 49), biggest margins, player milestones and championship tally.',
  },
  {
    path: '/analytics',
    title: 'IPL Analytics — Over Patterns, Venue Stats, Clutch Players — IPL Analytics Hub',
    description: 'Deep IPL analytics: over-by-over scoring, venue-specific stats, clutch batting & bowling, toss trends and powerplay breakdowns across 18 seasons.',
  },
  {
    path: '/deep-dives',
    title: 'IPL Deep Dives — Partnerships, Rivalries, On This Day — IPL Analytics Hub',
    description: 'Hidden-gem IPL analytics: best partnerships, home-advantage trends, team rivalries and On This Day match history going back to 2008.',
  },
];

const template = readFileSync(join(DIST, 'index.html'), 'utf-8');

for (const route of ROUTES) {
  const url = `${SITE}${route.path}`;

  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${route.title}</title>`)
    .replace(
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${route.description}" />`
    )
    .replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${url}" />`
    )
    .replace(
      /<meta property="og:title"\s+content="[^"]*" \/>/,
      `<meta property="og:title"       content="${route.title}" />`
    )
    .replace(
      /<meta property="og:description"\s+content="[^"]*" \/>/,
      `<meta property="og:description" content="${route.description}" />`
    )
    .replace(
      /<meta property="og:url"\s+content="[^"]*" \/>/,
      `<meta property="og:url"         content="${url}" />`
    )
    .replace(
      /<meta name="twitter:title"\s+content="[^"]*" \/>/,
      `<meta name="twitter:title"       content="${route.title}" />`
    )
    .replace(
      /<meta name="twitter:description"\s+content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${route.description}" />`
    );

  const dir = join(DIST, route.path.slice(1));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  console.log(`  ${route.path}/index.html`);
}

console.log(`\nPrerendered ${ROUTES.length} routes.`);
