import { useState, useMemo } from 'react';
import battersData from '../data/player-batters.json';
import bowlersData from '../data/player-bowlers.json';
import playerInnings from '../data/player-innings.json';
import bvbData from '../data/batter-vs-bowler.json';
import bowlerSeasonsData from '../data/bowler-seasons.json';
import batterSrSeasonsData from '../data/batter-sr-seasons.json';
import type { BatterRecord, BowlerRecord } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import ShareCard from '../components/ShareCard';
import { ArrowLeft } from '@phosphor-icons/react';

const batters = battersData as BatterRecord[];
const bowlers = bowlersData as BowlerRecord[];
const innings = playerInnings as Record<string, { season: string; runs: number; balls: number; sr: number }[]>;
const bvb = bvbData as { batter: string; bowler: string; runs: number; balls: number; dismissals: number; sr: number }[];
const bowlerSeasons = bowlerSeasonsData as Record<string, { season: string; wickets: number; economy: number }[]>;
const batterSrSeasons = batterSrSeasonsData as Record<string, { season: string; runs: number; sr: number }[]>;

type Tab = 'batters' | 'bowlers';
type View = 'list' | 'profile' | 'compare';
const PER = 25;

const ACTIVE_TEAMS = [
  'Chennai Super Kings', 'Mumbai Indians', 'Royal Challengers Bengaluru',
  'Kolkata Knight Riders', 'Delhi Capitals', 'Punjab Kings',
  'Rajasthan Royals', 'Sunrisers Hyderabad', 'Gujarat Titans', 'Lucknow Super Giants',
];

// Map team full name → logo short code
const LOGO_CODE: Record<string, string> = {
  'Chennai Super Kings':'CSK','Mumbai Indians':'MI',
  'Royal Challengers Bengaluru':'RCB','Royal Challengers Bangalore':'RCB',
  'Kolkata Knight Riders':'KKR','Delhi Capitals':'DC','Delhi Daredevils':'DC',
  'Punjab Kings':'PBKS','Kings XI Punjab':'PBKS',
  'Rajasthan Royals':'RR','Sunrisers Hyderabad':'SRH',
  'Gujarat Titans':'GT','Lucknow Super Giants':'LSG','Deccan Chargers':'DCH',
};
function getTeamLogo(teams: string[]): string {
  for (let i = teams.length-1; i >= 0; i--) {
    const code = LOGO_CODE[teams[i]];
    if (code) return `./logos/${code}.png`;
  }
  return '';
}

const TEAM_COLORS: Record<string, string> = {
  'Chennai Super Kings': '#F9CD05', 'Mumbai Indians': '#004BA0',
  'Royal Challengers Bengaluru': '#EC1C24', 'Royal Challengers Bangalore': '#EC1C24',
  'Kolkata Knight Riders': '#3A225D', 'Delhi Capitals': '#0078BC',
  'Delhi Daredevils': '#0078BC', 'Punjab Kings': '#ED1B24',
  'Kings XI Punjab': '#ED1B24', 'Rajasthan Royals': '#EA1A85',
  'Sunrisers Hyderabad': '#FF822A', 'Gujarat Titans': '#1C1C2B',
  'Lucknow Super Giants': '#A72056', 'Deccan Chargers': '#F7941D',
};

const TH = (right = false): React.CSSProperties => ({
  padding: '8px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)',
  textTransform: 'uppercase', letterSpacing: '0.03em',
  textAlign: right ? 'right' : 'left', whiteSpace: 'nowrap',
  background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)',
});
const TD = (right = false, accent?: string): React.CSSProperties => ({
  padding: '10px 4px', fontSize: 12, textAlign: right ? 'right' : 'left',
  color: accent || 'var(--text-3)', whiteSpace: 'nowrap',
});

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: 'var(--text)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color, marginTop: 2 }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
}

// ── Career runs chart per season ─────────────────────────────────────────────
function CareerChart({ player, color }: { player: string; color: string }) {
  const inn = innings[player];
  if (!inn?.length) return null;

  const byseason = inn.reduce((acc, r) => {
    if (!acc[r.season]) acc[r.season] = { season: r.season, runs: 0, innings: 0, hs: 0 };
    acc[r.season].runs += r.runs;
    acc[r.season].innings++;
    if (r.runs > acc[r.season].hs) acc[r.season].hs = r.runs;
    return acc;
  }, {} as Record<string, { season: string; runs: number; innings: number; hs: number }>);

  const data = Object.values(byseason).sort((a, b) => parseInt(a.season) - parseInt(b.season));

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px', background: 'var(--bg)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Runs per Season</div>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="season" tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} cursor={{ fill: 'var(--bg-muted)' }} />
            <Bar dataKey="runs" name="Runs" fill={color} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── SR trend line chart ───────────────────────────────────────────────────────
function SRChart({ player, color }: { player: string; color: string }) {
  const srData = batterSrSeasons[player];
  if (!srData?.length) return null;
  const data = [...srData].sort((a, b) => parseInt(a.season) - parseInt(b.season));
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px', background: 'var(--bg)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Strike Rate by Season</div>
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="season" tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} cursor={{ stroke: 'var(--border)' }} />
            <Line type="monotone" dataKey="sr" name="SR" stroke={color} strokeWidth={2}
              strokeDasharray="4 2" dot={{ r: 3, fill: color }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Bowler career wickets chart ───────────────────────────────────────────────
function BowlerCareerChart({ player, color }: { player: string; color: string }) {
  const bsData = bowlerSeasons[player];
  if (!bsData?.length) return null;
  const data = [...bsData].sort((a, b) => parseInt(a.season) - parseInt(b.season));
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px', background: 'var(--bg)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Wickets per Season</div>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <XAxis dataKey="season" tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<Tip />} cursor={{ fill: 'var(--bg-muted)' }} />
            <Bar dataKey="wickets" name="Wickets" fill={color} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Player profile card ───────────────────────────────────────────────────────
function BatterProfile({ player, onBack, onCompare }: {
  player: BatterRecord;
  onBack: () => void;
  onCompare: (p: BatterRecord) => void;
}) {
  const teamColor = TEAM_COLORS[player.teams[player.teams.length-1]] || TEAM_COLORS[player.teams[0]] || 'var(--accent)';

  // BvB matchups — bowlers who dismissed this batter most
  const matchups = bvb
    .filter(r => r.batter === player.player)
    .sort((a, b) => b.dismissals - a.dismissals)
    .slice(0, 5);

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 13, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <ArrowLeft size={14} weight="bold" /> Back to list
      </button>

      {/* Header */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ borderTop: `3px solid ${teamColor}` }} />
        <div style={{ padding: '16px', background: `${teamColor}08` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(18px,4vw,26px)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>{player.player}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {player.teams.map(t => (
                  <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 700,
                    background: `${TEAM_COLORS[t] || '#888'}18`, color: TEAM_COLORS[t] || 'var(--text-3)' }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              <ShareCard
                playerName={player.player}
                teamShort={player.teams[player.teams.length-1]}
                teamColor={TEAM_COLORS[player.teams[player.teams.length-1]] || TEAM_COLORS[player.teams[0]] || '#f97316'}
                teamLogo={getTeamLogo(player.teams)}
                statLabel="IPL Career Runs"
                statValue={player.runs.toLocaleString()}
                stats={[
                  { label: 'Innings', value: player.innings },
                  { label: 'Average', value: player.avg },
                  { label: 'SR', value: player.sr },
                  { label: '100s', value: player.hundreds },
                ]}
                context={`HS ${player.highest} · ${player.fifties} fifties · ${player.sixes} sixes · ${player.firstSeason}–${player.lastSeason}`}
                accent={TEAM_COLORS[player.teams[player.teams.length-1]] || TEAM_COLORS[player.teams[0]]}
              />
              <button onClick={() => onCompare(player)} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
                flexShrink: 0,
              }}>Compare →</button>
            </div>
          </div>
        </div>

        {/* Career span */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 11, color: 'var(--text-4)' }}>
          IPL Career: {player.firstSeason} – {player.lastSeason}
        </div>
      </div>

      {/* Hero stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { l: 'Total Runs', v: player.runs.toLocaleString(), c: 'var(--accent)' },
          { l: 'Innings', v: player.innings, c: 'var(--text)' },
          { l: 'Batting Average', v: player.avg, c: 'var(--text)' },
          { l: 'Strike Rate', v: player.sr, c: player.sr > 140 ? '#16a34a' : player.sr > 120 ? 'var(--text)' : 'var(--red)' },
          { l: 'Highest Score', v: player.highest, c: 'var(--text)' },
          { l: 'Fifties / Hundreds', v: `${player.fifties} / ${player.hundreds}`, c: 'var(--blue)' },
          { l: 'Sixes', v: player.sixes, c: 'var(--blue)' },
          { l: 'Ducks', v: player.ducks, c: 'var(--red)' },
        ].map(s => (
          <div key={s.l} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', background: 'var(--bg)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 'clamp(16px,3vw,22px)', fontWeight: 800, color: s.c, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Career chart */}
      <div style={{ marginBottom: 14 }}>
        <CareerChart player={player.player} color={teamColor} />
      </div>

      {/* SR trend chart */}
      <div style={{ marginBottom: 14 }}>
        <SRChart player={player.player} color={teamColor} />
      </div>

      {/* Batter vs Bowler matchups */}
      {matchups.length > 0 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Career Matchups — Most Dismissed By</span>
          </div>
          {matchups.map((m, i) => (
            <div key={m.bowler} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: i < matchups.length-1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: 'var(--text-4)', flexShrink: 0 }}>{i+1}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.bowler}</span>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--red)' }}>{m.dismissals}</span>
                <span style={{ fontSize: 10, color: 'var(--text-4)', marginLeft: 3 }}>dismissals</span>
                <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 8 }}>{m.runs} runs / {m.balls} balls</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Bowler profile card ───────────────────────────────────────────────────────
function BowlerProfile({ player, onBack, onCompare }: {
  player: BowlerRecord;
  onBack: () => void;
  onCompare: (p: BowlerRecord) => void;
}) {
  const teamColor = TEAM_COLORS[player.teams[player.teams.length-1]] || TEAM_COLORS[player.teams[0]] || 'var(--purple)';

  // BvB: batters this bowler dismissed most
  const matchups = bvb
    .filter(r => r.bowler === player.player)
    .sort((a, b) => b.dismissals - a.dismissals)
    .slice(0, 5);

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 13, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <ArrowLeft size={14} weight="bold" /> Back to list
      </button>

      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ borderTop: `3px solid ${teamColor}` }} />
        <div style={{ padding: '16px', background: `${teamColor}08` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(18px,4vw,26px)', fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>{player.player}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {player.teams.map(t => (
                  <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, fontWeight: 700,
                    background: `${TEAM_COLORS[t] || '#888'}18`, color: TEAM_COLORS[t] || 'var(--text-3)' }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              <ShareCard
                playerName={player.player}
                teamShort={player.teams[player.teams.length-1]}
                teamColor={TEAM_COLORS[player.teams[player.teams.length-1]] || TEAM_COLORS[player.teams[0]] || '#8b5cf6'}
                teamLogo={getTeamLogo(player.teams)}
                statLabel="IPL Career Wickets"
                statValue={player.wickets}
                statUnit="wickets"
                stats={[
                  { label: 'Overs', value: player.overs },
                  { label: 'Economy', value: player.economy },
                  { label: 'Average', value: player.avg },
                  { label: '5Ws', value: player.fiveWickets },
                ]}
                context={`Best ${player.bestInnings}W · SR ${player.sr} · ${player.dots.toLocaleString()} dots · ${player.firstSeason}–${player.lastSeason}`}
                accent={TEAM_COLORS[player.teams[0]] || '#8b5cf6'}
              />
              <button onClick={() => onCompare(player)} style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', flexShrink: 0,
              }}>Compare →</button>
            </div>
          </div>
        </div>
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)', fontSize: 11, color: 'var(--text-4)' }}>
          IPL Career: {player.firstSeason} – {player.lastSeason}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
        {[
          { l: 'Wickets', v: player.wickets, c: 'var(--purple)' },
          { l: 'Overs Bowled', v: player.overs, c: 'var(--text)' },
          { l: 'Economy Rate', v: player.economy, c: player.economy < 7.5 ? '#16a34a' : player.economy < 9 ? 'var(--text)' : 'var(--red)' },
          { l: 'Bowling Average', v: player.avg, c: 'var(--text)' },
          { l: 'Bowling SR', v: player.sr, c: 'var(--text)' },
          { l: 'Best Innings', v: `${player.bestInnings}W`, c: 'var(--purple)' },
          { l: '5-Wicket Hauls', v: player.fiveWickets, c: 'var(--accent)' },
          { l: 'Dot Balls', v: player.dots.toLocaleString(), c: 'var(--text)' },
        ].map(s => (
          <div key={s.l} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', background: 'var(--bg)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{s.l}</div>
            <div style={{ fontSize: 'clamp(16px,3vw,22px)', fontWeight: 800, color: s.c, letterSpacing: '-0.02em', lineHeight: 1 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Bowler career chart */}
      <div style={{ marginBottom: 14 }}>
        <BowlerCareerChart player={player.player} color={teamColor} />
      </div>

      {matchups.length > 0 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Career Matchups — Most Dismissed</span>
          </div>
          {matchups.map((m, i) => (
            <div key={m.batter} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: i < matchups.length-1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ width: 20, fontSize: 12, fontWeight: 700, color: 'var(--text-4)', flexShrink: 0 }}>{i+1}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.batter}</span>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--purple)' }}>{m.dismissals}</span>
                <span style={{ fontSize: 10, color: 'var(--text-4)', marginLeft: 3 }}>dismissals</span>
                <span style={{ fontSize: 11, color: 'var(--text-4)', marginLeft: 8 }}>{m.runs} runs / {m.balls} balls</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Compare mode ──────────────────────────────────────────────────────────────
function CompareView({ p1, tab, onBack }: { p1: BatterRecord | BowlerRecord; tab: Tab; onBack: () => void }) {
  const [search, setSearch] = useState('');
  const [p2, setP2] = useState<BatterRecord | BowlerRecord | null>(null);

  const list = tab === 'batters' ? batters : bowlers;
  const filtered = search.length > 1
    ? list.filter(p => p.player.toLowerCase().includes(search.toLowerCase()) && p.player !== p1.player).slice(0, 8)
    : [];

  function statRows(p: BatterRecord | BowlerRecord) {
    if (tab === 'batters') {
      const b = p as BatterRecord;
      return [
        { l: 'Runs', v: b.runs.toLocaleString(), raw: b.runs },
        { l: 'Innings', v: b.innings, raw: b.innings },
        { l: 'Average', v: b.avg, raw: b.avg },
        { l: 'Strike Rate', v: b.sr, raw: b.sr },
        { l: 'Highest', v: b.highest, raw: b.highest },
        { l: 'Fifties', v: b.fifties, raw: b.fifties },
        { l: 'Hundreds', v: b.hundreds, raw: b.hundreds },
        { l: 'Sixes', v: b.sixes, raw: b.sixes },
      ];
    } else {
      const b = p as BowlerRecord;
      return [
        { l: 'Wickets', v: b.wickets, raw: b.wickets },
        { l: 'Overs', v: b.overs, raw: b.overs },
        { l: 'Economy', v: b.economy, raw: -b.economy }, // lower is better
        { l: 'Average', v: b.avg, raw: -b.avg },
        { l: 'SR', v: b.sr, raw: -b.sr },
        { l: 'Best Innings', v: `${b.bestInnings}W`, raw: b.bestInnings },
        { l: '5Ws', v: b.fiveWickets, raw: b.fiveWickets },
        { l: 'Dots', v: b.dots.toLocaleString(), raw: b.dots },
      ];
    }
  }

  const rows1 = statRows(p1);
  const rows2 = p2 ? statRows(p2) : null;

  const p1Color = TEAM_COLORS[p1.teams[0]] || 'var(--accent)';
  const p2Color = p2 ? (TEAM_COLORS[p2.teams[0]] || 'var(--purple)') : 'var(--purple)';

  return (
    <div>
      <button onClick={onBack} style={{ display:'flex',alignItems:'center',gap:6,marginBottom:16,fontSize:13,color:'var(--text-3)',background:'none',border:'none',cursor:'pointer',padding:0 }}>
        <ArrowLeft size={14} weight="bold" /> Back
      </button>

      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.02em' }}>Compare Players</h3>

      {/* Player 2 search */}
      {!p2 && (
        <div style={{ marginBottom: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search second player to compare…"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13,
              border: '1px solid var(--border)', outline: 'none', background: 'var(--bg)', color: 'var(--text)' }} />
          {filtered.length > 0 && (
            <div style={{ marginTop: 6, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg)' }}>
              {filtered.map(p => (
                <div key={p.player} onClick={() => { setP2(p); setSearch(''); }}
                  style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', borderBottom: '1px solid var(--border)', color: 'var(--text)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}>
                  {p.player}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comparison table */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
        {/* Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: p1Color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p1.player}</div>
            <div style={{ fontSize: 10, color: 'var(--text-4)' }}>{p1.teams[0]}</div>
          </div>
          <div style={{ padding: '12px 0', textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Stat</div>
          </div>
          <div style={{ padding: '12px 14px', textAlign: 'right' }}>
            {p2 ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: p2Color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p2.player}</div>
                <div style={{ fontSize: 10, color: 'var(--text-4)' }}>{p2.teams[0]}</div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-4)' }}>Select player →</div>
            )}
          </div>
        </div>

        {rows1.map((r, i) => {
          const r2 = rows2?.[i];
          const p1Better = r2 && r.raw !== r2.raw ? r.raw > r2.raw : null;
          const p2Better = r2 && r.raw !== r2.raw ? r2.raw > r.raw : null;
          return (
            <div key={r.l} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: i < rows1.length-1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ padding: '11px 14px', fontSize: 13, fontWeight: p1Better ? 700 : 400,
                color: p1Better ? p1Color : 'var(--text)' }}>{r.v}</div>
              <div style={{ padding: '11px 0', textAlign: 'center', fontSize: 10, fontWeight: 600,
                color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.03em',
                borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
                background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {r.l}
              </div>
              <div style={{ padding: '11px 14px', textAlign: 'right', fontSize: 13, fontWeight: p2Better ? 700 : 400,
                color: p2Better ? p2Color : r2 ? 'var(--text)' : 'var(--text-4)' }}>
                {r2 ? r2.v : '—'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar chart comparison */}
      {p2 && (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px', background: 'var(--bg)', marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Visual Comparison</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows1.map((r, i) => {
              const r2 = rows2![i];
              const v1 = typeof r.raw === 'number' ? Math.abs(r.raw) : 0;
              const v2 = typeof r2.raw === 'number' ? Math.abs(r2.raw) : 0;
              const maxVal = Math.max(v1, v2, 1);
              const w1 = Math.round((v1 / maxVal) * 140);
              const w2 = Math.round((v2 / maxVal) * 140);
              return (
                <div key={r.l}>
                  <div style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 4 }}>{r.l}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', width: 140 }}>
                      <div style={{ height: 16, width: w1, background: p1Color, borderRadius: 3, opacity: 0.85 }} />
                    </div>
                    <div style={{ width: 64, textAlign: 'center', fontSize: 9, color: 'var(--text-4)' }}>{r.v} / {r2.v}</div>
                    <div style={{ width: 140 }}>
                      <div style={{ height: 16, width: w2, background: p2Color, borderRadius: 3, opacity: 0.85 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 11 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: p1Color }} />
              <span style={{ color: 'var(--text-3)' }}>{p1.player}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: p2Color }} />
              <span style={{ color: 'var(--text-3)' }}>{p2.player}</span>
            </div>
          </div>
        </div>
      )}

      {p2 && (
        <button onClick={() => setP2(null)} style={{ marginTop: 12, fontSize: 12, color: 'var(--text-3)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer' }}>
          Change player
        </button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Players() {
  const [tab, setTab] = useState<Tab>('batters');
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [page, setPage] = useState(0);
  const [view, setView] = useState<View>('list');
  const [selectedBatter, setSelectedBatter] = useState<BatterRecord | null>(null);
  const [selectedBowler, setSelectedBowler] = useState<BowlerRecord | null>(null);
  const [comparePivot, setComparePivot] = useState<BatterRecord | BowlerRecord | null>(null);

  const list = useMemo(() => {
    const src = tab === 'batters' ? batters : bowlers;
    const q = search.toLowerCase();
    let result = q ? src.filter(b => b.player.toLowerCase().includes(q)) : src;
    if (teamFilter) {
      result = result.filter(b => b.teams.includes(teamFilter));
    }
    return result;
  }, [tab, search, teamFilter]);

  const paged = list.slice(page * PER, (page + 1) * PER);
  function goTab(t: Tab) { setTab(t); setPage(0); setSearch(''); setTeamFilter(''); setView('list'); }

  // Show profile — key on TAB to prevent stale state from the other tab bleeding through
  if (view === 'profile' && tab === 'batters' && selectedBatter) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '70px 14px 88px' }}>
        <BatterProfile player={selectedBatter} onBack={() => setView('list')}
          onCompare={(p) => { setComparePivot(p); setView('compare'); }} />
      </div>
    );
  }
  if (view === 'profile' && tab === 'bowlers' && selectedBowler) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '70px 14px 88px' }}>
        <BowlerProfile player={selectedBowler} onBack={() => setView('list')}
          onCompare={(p) => { setComparePivot(p); setView('compare'); }} />
      </div>
    );
  }
  if (view === 'compare' && comparePivot) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 14px 88px', paddingTop: 70 }}>
        <CompareView p1={comparePivot} tab={tab} onBack={() => setView('list')} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 14px 88px' }}>
      <div style={{ paddingTop: 20, paddingBottom: 20 }}>
        <h1 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
          Player Stats
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>703 batters · 550 bowlers · tap any player for full profile</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
          {(['batters', 'bowlers'] as Tab[]).map(t => (
            <button key={t} onClick={() => goTab(t)} style={{
              padding: '7px 18px', fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer',
              border: 'none', background: tab === t ? 'var(--text)' : 'var(--bg)',
              color: tab === t ? 'var(--bg)' : 'var(--text-3)', transition: 'all 0.15s', textTransform: 'capitalize',
            }}>{t}</button>
          ))}
        </div>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search player…"
          style={{ flex: 1, minWidth: 120, padding: '7px 12px', borderRadius: 8, fontSize: 13,
            border: '1px solid var(--border)', outline: 'none', background: 'var(--bg)', color: 'var(--text)' }} />
        <select value={teamFilter} onChange={e => { setTeamFilter(e.target.value); setPage(0); }}
          style={{ padding: '7px 10px', borderRadius: 8, fontSize: 12, border: '1px solid var(--border)',
            background: 'var(--bg)', color: 'var(--text)', cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
          <option value="">All Teams</option>
          {ACTIVE_TEAMS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
          {tab === 'batters' ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 320 }}>
              <colgroup>
                <col style={{ width: 24 }} /><col />
                <col style={{ width: 46 }} /><col style={{ width: 36 }} /><col style={{ width: 36 }} />
                <col style={{ width: 30 }} /><col style={{ width: 28 }} /><col style={{ width: 28 }} /><col style={{ width: 28 }} />
              </colgroup>
              <thead>
                <tr>
                  {['#', 'Player', 'Runs', 'Avg', 'SR', 'HS', '50s', '100s', '6s'].map(h => (
                    <th key={h} style={{ ...TH(h !== '#' && h !== 'Player'), paddingLeft: h === '#' ? 10 : 4 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(paged as BatterRecord[]).map((b, i) => (
                  <tr key={b.player} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => { setSelectedBatter(b); setSelectedBowler(null); setView('profile'); }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}>
                    <td style={{ ...TD(), color: 'var(--text-4)', fontSize: 11, paddingLeft: 10 }}>{page * PER + i + 1}</td>
                    <td style={{ padding: '10px 4px', overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: 'underline', textDecorationColor: 'transparent' }}>{b.player}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-4)' }}>{b.teams[b.teams.length-1]}</div>
                    </td>
                    <td style={{ ...TD(true, 'var(--accent)'), fontWeight: 700 }}>{b.runs.toLocaleString()}</td>
                    <td style={TD(true)}>{b.avg}</td>
                    <td style={TD(true)}>{b.sr}</td>
                    <td style={TD(true)}>{b.highest}</td>
                    <td style={TD(true)}>{b.fifties}</td>
                    <td style={{ ...TD(true, 'var(--blue)'), fontWeight: 700 }}>{b.hundreds}</td>
                    <td style={TD(true)}>{b.sixes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: 320 }}>
              <colgroup>
                <col style={{ width: 24 }} /><col /><col style={{ width: 34 }} />
                <col style={{ width: 40 }} /><col style={{ width: 32 }} /><col style={{ width: 34 }} />
                <col style={{ width: 30 }} /><col style={{ width: 24 }} /><col style={{ width: 44 }} />
              </colgroup>
              <thead>
                <tr>
                  {['#', 'Player', 'Wkts', 'Overs', 'Econ', 'Avg', 'SR', '5W', 'Dots'].map(h => (
                    <th key={h} style={{ ...TH(h !== '#' && h !== 'Player'), paddingLeft: h === '#' ? 10 : 4 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(paged as BowlerRecord[]).map((b, i) => (
                  <tr key={b.player} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                    onClick={() => { setSelectedBowler(b); setSelectedBatter(null); setView('profile'); }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}>
                    <td style={{ ...TD(), color: 'var(--text-4)', fontSize: 11, paddingLeft: 10 }}>{page * PER + i + 1}</td>
                    <td style={{ padding: '10px 4px', overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--purple)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.player}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-4)' }}>{b.teams[b.teams.length-1]}</div>
                    </td>
                    <td style={{ ...TD(true, 'var(--purple)'), fontWeight: 700 }}>{b.wickets}</td>
                    <td style={TD(true)}>{b.overs}</td>
                    <td style={TD(true)}>{b.economy}</td>
                    <td style={TD(true)}>{b.avg}</td>
                    <td style={TD(true)}>{b.sr}</td>
                    <td style={{ ...TD(true, 'var(--accent)'), fontWeight: 700 }}>{b.fiveWickets}</td>
                    <td style={TD(true)}>{b.dots.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-4)' }}>
          {page * PER + 1}–{Math.min((page + 1) * PER, list.length)} of {list.length}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {([['← Prev', page > 0, () => setPage(p => p - 1)],
            ['Next →', (page + 1) * PER < list.length, () => setPage(p => p + 1)]] as any[]).map(([label, enabled, fn]: any) => (
            <button key={label} onClick={fn} disabled={!enabled} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 13, cursor: enabled ? 'pointer' : 'not-allowed',
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: enabled ? 'var(--text)' : 'var(--text-4)', opacity: enabled ? 1 : 0.4,
            }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
