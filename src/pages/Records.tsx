import { useState } from 'react';
import recordsData from '../data/records.json';
import seasonRecordsData from '../data/season-records.json';
import type { Records } from '../types';
import ShareCard from '../components/ShareCard';
import { Trophy } from '@phosphor-icons/react';
import TeamBadge from '../components/TeamBadge';

const R = recordsData as Records;
const SR = seasonRecordsData as any;

/* ── Team helpers (same maps as Home.tsx) ─────────────────────────── */
const LOGO_CODE: Record<string, string> = {
  'Chennai Super Kings': 'CSK', 'Mumbai Indians': 'MI',
  'Royal Challengers Bengaluru': 'RCB', 'Royal Challengers Bangalore': 'RCB',
  'Kolkata Knight Riders': 'KKR', 'Delhi Capitals': 'DC', 'Delhi Daredevils': 'DC',
  'Punjab Kings': 'PBKS', 'Kings XI Punjab': 'PBKS',
  'Rajasthan Royals': 'RR', 'Sunrisers Hyderabad': 'SRH',
  'Gujarat Titans': 'GT', 'Lucknow Super Giants': 'LSG',
  'Deccan Chargers': 'DCH',
};

const TEAM_COLORS: Record<string, string> = {
  'Chennai Super Kings': '#F9CD05', 'Mumbai Indians': '#004BA0',
  'Royal Challengers Bengaluru': '#EC1C24', 'Royal Challengers Bangalore': '#EC1C24',
  'Kolkata Knight Riders': '#3A225D', 'Delhi Capitals': '#0078BC',
  'Punjab Kings': '#ED1B24', 'Rajasthan Royals': '#EA1A85',
  'Sunrisers Hyderabad': '#FF822A', 'Gujarat Titans': '#1C1C2B',
  'Lucknow Super Giants': '#A72056', 'Deccan Chargers': '#F7941D',
};

const BOARDS = [
  { title: 'Most Runs',      items: R.mostRuns,       nameKey: 'batter', statKey: 'runs',     unit: 'runs', color: 'var(--accent)' },
  { title: 'Most Wickets',   items: R.mostWickets,    nameKey: 'bowler', statKey: 'wickets',  unit: 'wickets', color: 'var(--purple)' },
  { title: 'Most Sixes',     items: R.mostSixes,      nameKey: 'batter', statKey: 'sixes',    unit: '6s',   color: 'var(--blue)' },
  { title: 'Most Fours',     items: R.mostFours,      nameKey: 'batter', statKey: 'fours',    unit: '4s',   color: '#16a34a' },
  { title: 'Highest Score',  items: R.highestScore,   nameKey: 'batter', statKey: 'highest',  unit: 'runs', color: 'var(--red)' },
  { title: 'Most Centuries', items: R.mostCenturies,  nameKey: 'batter', statKey: 'hundreds', unit: '100s', color: 'var(--accent)' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

function Board({ title, items, nameKey, statKey, unit, color }: typeof BOARDS[0]) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
        <span style={{ fontSize: 11, color: 'var(--text-4)' }}>Top 10</span>
      </div>
      {items.slice(0, 10).map((item: any, i: number) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          borderBottom: i < 9 ? '1px solid var(--border)' : 'none',
          transition: 'background 0.1s',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}>
          <span style={{ width: 20, textAlign: 'center', fontSize: i < 3 ? 14 : 12, flexShrink: 0,
            color: i < 3 ? color : 'var(--text-4)', fontWeight: 700 }}>
            {i < 3 ? MEDALS[i] : i + 1}
          </span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item[nameKey]}
          </span>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <span style={{ fontSize: 15, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
              {typeof item[statKey] === 'number' ? item[statKey].toLocaleString() : item[statKey]}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-4)', marginLeft: 3 }}>{unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Season Records sub-tabs ────────────────────────────────────────── */
type SeasonTab = 'highest' | 'margins' | 'milestones';

function HighestTotalsTab() {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase',
        letterSpacing: '0.04em', marginBottom: 8, padding: '0 2px' }}>
        Top Innings Totals
      </div>
      {SR.highestTotals.slice(0, 10).map((row: any, i: number) => {
        const short = LOGO_CODE[row.team] || row.team.slice(0, 3).toUpperCase();
        const color = TEAM_COLORS[row.team] || 'var(--accent)';
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
            borderBottom: i < 9 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 700, width: 18, flexShrink: 0, textAlign: 'center' }}>
              {i + 1}
            </span>
            <TeamBadge short={short} color={color} size="xs" />
            <span style={{ flex: 1, fontSize: 13, color: 'var(--text)', fontWeight: 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.team}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-4)', flexShrink: 0, marginRight: 6 }}>
              {row.season}
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
              {row.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MarginsTab() {
  const [view, setView] = useState<'runs' | 'wickets'>('runs');
  const list = view === 'runs' ? SR.biggestMarginRuns : SR.biggestMarginWickets;
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['runs', 'wickets'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
            border: '1px solid var(--border)', cursor: 'pointer',
            background: view === v ? 'var(--accent)' : 'var(--bg-subtle)',
            color: view === v ? '#fff' : 'var(--text-4)',
            transition: 'all 0.15s',
          }}>
            By {v}
          </button>
        ))}
      </div>
      {list.slice(0, 8).map((row: any, i: number) => {
        const short = LOGO_CODE[row.match_won_by] || row.match_won_by.slice(0, 3).toUpperCase();
        const color = TEAM_COLORS[row.match_won_by] || 'var(--accent)';
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0',
            borderBottom: i < list.slice(0, 8).length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-4)', fontWeight: 700, width: 18, flexShrink: 0, textAlign: 'center' }}>
              {i + 1}
            </span>
            <TeamBadge short={short} color={color} size="xs" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.match_won_by}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-4)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.venue} · {row.season_label}
              </div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color, flexShrink: 0,
              fontVariantNumeric: 'tabular-nums' }}>
              {row.win_outcome}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MilestonesTab() {
  const runs5000: { player: string; runs: number }[] = SR.milestones.runs5000;
  const wickets100: { player: string; wickets: number }[] = SR.milestones.wickets100;
  const maxRuns = Math.max(...runs5000.map(p => p.runs));
  const maxWkts = Math.max(...wickets100.map(p => p.wickets));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 5000+ run batters */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase',
          letterSpacing: '0.04em', marginBottom: 10 }}>
          5000+ Run Club ({runs5000.length} batters)
        </div>
        {runs5000.map((p, i) => (
          <div key={p.player} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{p.player}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)',
                fontVariantNumeric: 'tabular-nums' }}>
                {p.runs.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${(p.runs / maxRuns) * 100}%`,
                background: i === 0 ? 'var(--accent)' : `rgba(var(--accent-rgb, 59,130,246),0.55)`,
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* 100+ wicket bowlers */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)', textTransform: 'uppercase',
          letterSpacing: '0.04em', marginBottom: 10 }}>
          100+ Wicket Club ({wickets100.length} bowlers)
        </div>
        {wickets100.map((p, i) => (
          <div key={p.player} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{p.player}</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple)',
                fontVariantNumeric: 'tabular-nums' }}>
                {p.wickets} wkts
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3,
                width: `${(p.wickets / maxWkts) * 100}%`,
                background: i === 0 ? 'var(--purple)' : 'rgba(139,92,246,0.5)',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeasonRecordsSection() {
  const [tab, setTab] = useState<SeasonTab>('highest');

  const tabs: { key: SeasonTab; label: string }[] = [
    { key: 'highest', label: 'Highest Totals' },
    { key: 'margins', label: 'Biggest Margins' },
    { key: 'milestones', label: 'Player Milestones' },
  ];

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg)', marginBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Season Records</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              fontSize: 11, fontWeight: 700, padding: '4px 11px', borderRadius: 20,
              border: '1px solid var(--border)', cursor: 'pointer',
              background: tab === t.key ? 'var(--accent)' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--text-4)',
              transition: 'all 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '14px' }}>
        {tab === 'highest' && <HighestTotalsTab />}
        {tab === 'margins' && <MarginsTab />}
        {tab === 'milestones' && <MilestonesTab />}
      </div>
    </div>
  );
}

/* ── IPL Firsts section ─────────────────────────────────────────────── */
function IPLFirstsSection() {
  const { firstCentury, first5Wickets } = SR.firsts as {
    firstCentury: { player: string; season: string; runs: number };
    first5Wickets: { player: string; season: string; wickets: number };
  };

  const cards = [
    {
      label: 'First IPL Century',
      player: firstCentury.player,
      detail: `${firstCentury.runs} runs`,
      season: firstCentury.season,
      color: 'var(--accent)',
      icon: '🏏',
    },
    {
      label: 'First 5-Wicket Haul',
      player: first5Wickets.player,
      detail: `${first5Wickets.wickets} wickets`,
      season: first5Wickets.season,
      color: 'var(--purple)',
      icon: '🎳',
    },
    {
      label: 'All-Time Centuries',
      player: `${R.mostCenturies[0].batter} leads`,
      detail: `${(R as any).mostCenturies[0].hundreds} centuries`,
      season: '2008–2025',
      color: 'var(--blue)',
      icon: '💯',
    },
    {
      label: 'All-Time Sixes',
      player: `${R.mostSixes[0].batter} leads`,
      detail: `${R.mostSixes[0].sixes.toLocaleString()} sixes`,
      season: '2008–2025',
      color: '#16a34a',
      icon: '💥',
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '2px solid var(--accent)' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: 0 }}>IPL Firsts & Milestones</h2>
        <p style={{ fontSize: 11, color: 'var(--text-4)', margin: '2px 0 0', fontWeight: 400 }}>
          Historic landmarks from the world's premier T20 league
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
        {cards.map(c => (
          <div key={c.label} style={{
            border: '1px solid var(--border)', borderRadius: 10, padding: '14px',
            background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{c.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)',
                textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {c.label}
              </span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: c.color, letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums' }}>
              {c.detail}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.player}</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{c.season}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function RecordsPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 14px 88px' }}>
      <div style={{ paddingTop: 20, paddingBottom: 20 }}>
        <h1 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
          All-Time Records
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{R.totalSeasons} seasons · {R.totalMatches.toLocaleString()} matches · 2008–2025</p>
      </div>

      {/* Hero stats — 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Total Runs Scored', value: R.allTimeRuns.toLocaleString(), sub: 'across all 18 seasons', color: 'var(--accent)' },
          { label: 'Total Sixes Hit', value: R.allTimeSixes.toLocaleString(), sub: 'in valid deliveries', color: 'var(--blue)' },
          { label: 'Total Fours Hit', value: R.allTimeFours.toLocaleString(), sub: 'boundaries across IPL', color: '#16a34a' },
          { label: 'Total Matches', value: R.totalMatches.toLocaleString(), sub: '2008 to 2025', color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px', background: 'var(--bg)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* NEW: Season Records section (before leaderboards) */}
      <SeasonRecordsSection />

      {/* NEW: IPL Firsts section */}
      <IPLFirstsSection />

      {/* Championship tally */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 24, background: 'var(--bg)' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display:'flex', alignItems:'center', gap:6 }}><Trophy size={15} weight="fill" color="var(--accent)" /> Championship Tally</span>
        </div>
        <div style={{ padding: '14px' }}>
          {[
            { team: 'Mumbai Indians', short: 'MI', color: '#004BA0', titles: 5, years: '2013, 2015, 2017, 2019, 2020' },
            { team: 'Chennai Super Kings', short: 'CSK', color: '#F9CD05', titles: 5, years: '2010, 2011, 2018, 2021, 2023', textColor: '#000' },
            { team: 'Kolkata Knight Riders', short: 'KKR', color: '#3A225D', titles: 3, years: '2012, 2014, 2024' },
            { team: 'Royal Challengers Bengaluru', short: 'RCB', color: '#EC1C24', titles: 1, years: '2025' },
            { team: 'Sunrisers Hyderabad', short: 'SRH', color: '#FF822A', titles: 1, years: '2016' },
            { team: 'Gujarat Titans', short: 'GT', color: '#1C1C2B', titles: 1, years: '2022' },
            { team: 'Rajasthan Royals', short: 'RR', color: '#EA1A85', titles: 1, years: '2008' },
            { team: 'Deccan Chargers', short: 'DCH', color: '#F7941D', titles: 1, years: '2009' },
          ].map((t, i) => (
            <div key={t.team} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
              borderBottom: i < 7 ? '1px solid var(--border)' : 'none',
            }}>
              <TeamBadge short={t.short} color={t.color} textColor={t.textColor || '#fff'} size="sm" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.team}</div>
                <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{t.years}</div>
              </div>
              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                {Array.from({ length: t.titles }).map((_, ti) => (
                  <Trophy key={ti} size={15} weight="fill" color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: t.color, width: 20, textAlign: 'right', flexShrink: 0 }}>{t.titles}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share stat cards */}
      <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'14px 16px', marginBottom:20, background:'var(--bg)' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:12 }}>Share a Stat</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
          <ShareCard playerName="V Kohli" teamLogo="./logos/RCB.png" teamShort="Royal Challengers Bengaluru" teamColor="#EC1C24" statLabel="All-Time Most Runs" statValue="8,671" statUnit="runs" stats={[{label:'Innings',value:261},{label:'Average',value:'33.22'},{label:'SR',value:'132.93'},{label:'100s',value:8}]} context="IPL all-time run leader · 2008–2025" accent="#EC1C24" />
          <ShareCard playerName="YS Chahal" teamLogo="./logos/RR.png" teamShort="Rajasthan Royals" teamColor="#EA1A85" statLabel="All-Time Most Wickets" statValue="221" statUnit="wickets" stats={[{label:'Matches',value:148},{label:'Economy',value:'7.73'},{label:'Average',value:'22.51'},{label:'5Ws',value:1}]} context="IPL all-time wicket leader · 2013–2025" accent="#EA1A85" />
          <ShareCard statLabel="IPL All-Time Sixes" statValue="14,259" statUnit="sixes" stats={[{label:'Matches',value:'1,169'},{label:'Seasons',value:18},{label:'Fours',value:'32,113'},{label:'Total Runs',value:'355K'}]} context="Across 18 IPL seasons · 2008–2025" accent="#3b82f6" />
        </div>
      </div>

      {/* Leaderboards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {BOARDS.map(board => (
          <Board key={board.title} {...board} />
        ))}
      </div>
    </div>
  );
}
