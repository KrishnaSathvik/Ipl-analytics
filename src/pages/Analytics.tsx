import overData from '../data/over-analytics.json';
import venueData from '../data/venue-analytics.json';
import clutchBatters from '../data/clutch-batters.json';
import clutchBowlers from '../data/clutch-bowlers.json';
import tossAnalysis from '../data/toss-analysis.json';
import powerplayStats from '../data/powerplay-stats.json';
import type { OverStat, VenueStat } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartBar, MapPin, Lightning, ArrowsDownUp, Shuffle } from '@phosphor-icons/react';
import { useState } from 'react';
import TeamBadge from '../components/TeamBadge';
import HistoricalBadge from '../components/HistoricalBadge';

const overs = overData as OverStat[];
const allVenues = venueData as VenueStat[];

type Tab = 'overs' | 'venues' | 'clutch' | 'toss' | 'powerplay';

const PHASE_COLORS = {
  powerplay: '#3b82f6',
  middle: '#f97316',
  death: '#ef4444',
};

function phaseColor(over: number) {
  if (over <= 6) return PHASE_COLORS.powerplay;
  if (over <= 15) return PHASE_COLORS.middle;
  return PHASE_COLORS.death;
}

function OverTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Over {label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || 'var(--text-3)', marginTop: 2 }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed?.(2) ?? p.value : p.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ── Run Rate by Over ─────────────────────────────────────────────────────────
function OverRunRateChart() {
  const [showTable, setShowTable] = useState(false);
  const data = overs.map(o => ({
    over: o.over,
    runRate: o.runRate,
    sixes: o.sixes,
    wickets: o.wickets,
    phase: o.over <= 6 ? 'Powerplay' : o.over <= 15 ? 'Middle' : 'Death',
  }));

  const pp = overs.slice(0,6).reduce((s,o) => s + o.runs, 0);
  const mid = overs.slice(6,15).reduce((s,o) => s + o.runs, 0);
  const death = overs.slice(15,20).reduce((s,o) => s + o.runs, 0);
  const total = pp + mid + death;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Phase summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { label: 'Powerplay', sublabel: 'Overs 1–6', runs: pp, color: PHASE_COLORS.powerplay },
          { label: 'Middle', sublabel: 'Overs 7–15', runs: mid, color: PHASE_COLORS.middle },
          { label: 'Death', sublabel: 'Overs 16–20', runs: death, color: PHASE_COLORS.death },
        ].map(p => (
          <div key={p.label} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px 10px', textAlign: 'center', background: 'var(--bg)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: p.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontSize: 10, color: 'var(--text-4)', marginBottom: 6 }}>{p.sublabel}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{Math.round(p.runs/total*100)}%</div>
            <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>of all runs</div>
          </div>
        ))}
      </div>

      {/* Run rate chart */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px', background: 'var(--bg)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Run Rate by Over (all IPL matches)</div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="over" tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 14]} />
              <Tooltip content={<OverTip />} cursor={{ fill: 'var(--bg-muted)' }} />
              <Bar dataKey="runRate" name="Run Rate" radius={[3,3,0,0]}>
                {data.map(d => <Cell key={d.over} fill={phaseColor(d.over)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 11 }}>
          {Object.entries(PHASE_COLORS).map(([k,c]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
              <span style={{ color: 'var(--text-4)', textTransform: 'capitalize' }}>{k}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sixes + Wickets by over */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { title: 'Sixes by Over', key: 'sixes', color: '#3b82f6' },
          { title: 'Wickets by Over', key: 'wickets', color: '#ef4444' },
        ].map(chart => (
          <div key={chart.key} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '12px', background: 'var(--bg)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>{chart.title}</div>
            <div style={{ height: 130 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overs} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                  <XAxis dataKey="over" tick={{ fill: 'var(--text-4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-4)', fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<OverTip />} cursor={{ fill: 'var(--bg-muted)' }} />
                  <Bar dataKey={chart.key} name={chart.title} fill={chart.color} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Over-by-over table — collapsible */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
        <button onClick={()=>setShowTable(v=>!v)} style={{
          width:'100%', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center',
          background:'var(--bg-subtle)', border:'none', cursor:'pointer',
          borderBottom: showTable ? '1px solid var(--border)' : 'none',
        }}>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>Over-by-Over Breakdown</span>
          <span style={{ fontSize:11, color:'var(--text-4)' }}>{showTable ? 'Hide ▴' : 'Show table ▾'}</span>
        </button>
        {showTable && <>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 60 }} />
            <col style={{ width: 70 }} />
            <col />
            <col />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              {['Over','Phase','Runs','Run Rate','6s','Wkts'].map(h => (
                <th scope="col" key={h} style={{ padding: '8px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textAlign: h==='Over'||h==='Phase'?'left':'center', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {overs.map((o, i) => {
              const phase = o.over <= 6 ? 'PP' : o.over <= 15 ? 'MID' : 'DEATH';
              const pc = phaseColor(o.over);
              return (
                <tr key={o.over} style={{ borderBottom: i < overs.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '9px 6px', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{o.over}</td>
                  <td style={{ padding: '9px 6px' }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: `${pc}15`, color: pc }}>{phase}</span>
                  </td>
                  <td style={{ padding: '9px 6px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>{o.runs.toLocaleString()}</td>
                  <td style={{ padding: '9px 6px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: pc }}>{o.runRate}</td>
                  <td style={{ padding: '9px 6px', textAlign: 'center', fontSize: 12, color: '#3b82f6' }}>{o.sixes}</td>
                  <td style={{ padding: '9px 6px', textAlign: 'center', fontSize: 12, color: '#ef4444' }}>{o.wickets}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </>}
      </div>
    </div>
  );
}

// ── Venue Analytics ──────────────────────────────────────────────────────────
function VenueTab() {
  type SortKey = 'matches' | 'sixes' | 'avgScore';
  const [sortBy, setSortBy] = useState<SortKey>('matches');

  const sortedVenues = [...allVenues].sort((a, b) => {
    if (sortBy === 'matches') return b.matches - a.matches;
    if (sortBy === 'sixes') return b.sixes - a.sixes;
    return b.avgScore - a.avgScore;
  });

  const sortConfig: Record<SortKey, { label: string; icon: string; getValue: (v: typeof allVenues[0]) => string | number }> = {
    matches: { label: 'Most Matches', icon: '🏟', getValue: v => `${v.matches} matches` },
    sixes:   { label: 'Most Sixes',   icon: '💥', getValue: v => `${v.sixes.toLocaleString()} sixes` },
    avgScore:{ label: 'Highest Run Rate', icon: '📈', getValue: v => `${v.avgScore} r/ov` },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Sort controls */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 600, flexShrink: 0 }}>Sort:</span>
        {(Object.keys(sortConfig) as SortKey[]).map(key => (
          <button key={key} onClick={() => setSortBy(key)} style={{
            padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: sortBy === key ? 700 : 500,
            cursor: 'pointer',
            border: `1.5px solid ${sortBy === key ? 'var(--accent)' : 'var(--border)'}`,
            background: sortBy === key ? 'var(--accent)' : 'var(--bg)',
            color: sortBy === key ? '#fff' : 'var(--text-3)',
            transition: 'all 0.15s',
          }}>{sortConfig[key].label}</button>
        ))}
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-4)' }}>
        Showing {sortedVenues.length} venues · sorted by <strong style={{ color: 'var(--accent)' }}>{sortConfig[sortBy].label}</strong>
      </div>

      {sortedVenues.map((v, idx) => {
        const total = v.batFirstWins + v.fieldFirstWins;
        const batPct = total > 0 ? Math.round(v.batFirstWins / total * 100) : 50;
        const sortVal = sortConfig[sortBy].getValue(v);
        return (
          <div key={v.venue} style={{ border: `1px solid ${idx === 0 ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, padding: '14px', background: 'var(--bg)' }}>
            {/* Venue name + rank badge + primary stat */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
                <span style={{
                  flexShrink: 0, width: 22, height: 22, borderRadius: 6, fontSize: 11, fontWeight: 800,
                  background: idx < 3 ? 'var(--accent)' : 'var(--bg-muted)',
                  color: idx < 3 ? '#fff' : 'var(--text-4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>#{idx + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {v.venue}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 1 }}>{v.city}</div>
                </div>
              </div>
              {/* Primary sort stat highlighted */}
              <span style={{
                fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 700, flexShrink: 0, marginLeft: 8,
                background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)',
              }}>
                {sortVal}
              </span>
            </div>

            {/* Stats row — all 4 stats, highlight active sort */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 10 }}>
              {[
                { key: 'matches' as SortKey, l: 'Matches', val: v.matches },
                { key: 'avgScore' as SortKey, l: 'Run Rate', val: `${v.avgScore}` },
                { key: 'sixes' as SortKey, l: 'Sixes', val: v.sixes.toLocaleString() },
                { key: 'fours' as string, l: 'Fours', val: v.fours.toLocaleString() },
              ].map(s => {
                const isActive = s.key === sortBy;
                return (
                  <div key={s.l} style={{
                    textAlign: 'center', padding: '6px 4px', borderRadius: 6,
                    background: isActive ? 'var(--accent-bg)' : 'var(--bg-subtle)',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: isActive ? 'var(--accent)' : 'var(--text)', lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: 9, color: isActive ? 'var(--accent)' : 'var(--text-4)', marginTop: 2, fontWeight: isActive ? 700 : 400 }}>{s.l}</div>
                  </div>
                );
              })}
            </div>

            {/* Bat vs field bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-4)', marginBottom: 4 }}>
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>Bat first {batPct}%</span>
                <span style={{ color: '#f97316', fontWeight: 600 }}>Field first {100-batPct}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#f9731620', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${batPct}%`, background: '#3b82f6', borderRadius: 3 }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 10, color: 'var(--text-4)' }}>
                <span>{v.batFirstWins} bat-first wins</span>
                <span>{v.fieldFirstWins} field-first wins</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Clutch Tab ────────────────────────────────────────────────────────────────
function ClutchTab() {
  const [view, setView] = useState<'bat'|'bowl'>('bat');
  const battersClutch = clutchBatters as any[];
  const bowlersClutch = clutchBowlers as any[];

  const top10Batters = battersClutch.slice(0, 10);
  const maxRuns = Math.max(...top10Batters.map((b: any) => b.runs), 1);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
          Performance in <strong>overs 16–20</strong> only — the death overs where games are won and lost.
        </p>
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', width: 'fit-content' }}>
          {(['bat','bowl'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '7px 20px', fontSize: 13, fontWeight: view===v?600:400, cursor: 'pointer',
              border: 'none', background: view===v ? 'var(--text)' : 'var(--bg)',
              color: view===v ? 'var(--bg)' : 'var(--text-3)', transition: 'all 0.15s',
            }}>{v === 'bat' ? 'Clutch Batters' : 'Clutch Bowlers'}</button>
          ))}
        </div>
      </div>

      {view === 'bat' ? (
        <>
          {/* Horizontal bar chart for top 10 */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px', background: 'var(--bg)', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Top 10 Clutch Batters (runs in overs 16–20)</div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top10Batters} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 80 }}>
                  <XAxis type="number" tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="batter" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip content={<OverTip />} cursor={{ fill: 'var(--bg-muted)' }} />
                  <Bar dataKey="runs" name="Runs" fill="var(--accent)" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Most Runs in Overs 16–20</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup><col style={{width:24}}/><col/><col style={{width:44}}/><col style={{width:36}}/><col style={{width:32}}/><col style={{width:28}}/></colgroup>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  {['#','Player','Runs','SR','6s','Inns'].map(h => (
                    <th scope="col" key={h} style={{ padding: '8px 5px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textAlign: h==='#'||h==='Player'?'left':'center', textTransform: 'uppercase', paddingLeft: h==='#'?10:5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {battersClutch.slice(0,20).map((b: any, i: number) => (
                  <tr key={b.batter} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-subtle)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='var(--bg)')}>
                    <td style={{ padding:'9px 5px 9px 10px', fontSize:11, color:'var(--text-4)', fontWeight:700 }}>{i+1}</td>
                    <td style={{ padding:'9px 5px', fontSize:12, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.batter}</td>
                    <td style={{ padding:'9px 5px', textAlign:'center', fontSize:13, fontWeight:800, color:'var(--accent)' }}>{b.runs}</td>
                    <td style={{ padding:'9px 5px', textAlign:'center', fontSize:12, color:'var(--text-3)' }}>{b.sr}</td>
                    <td style={{ padding:'9px 5px', textAlign:'center', fontSize:12, color:'#3b82f6' }}>{b.sixes}</td>
                    <td style={{ padding:'9px 5px', textAlign:'center', fontSize:12, color:'var(--text-3)' }}>{b.innings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Most Wickets in Overs 16–20</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup><col style={{width:24}}/><col/><col style={{width:36}}/><col style={{width:44}}/><col style={{width:44}}/></colgroup>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                {['#','Player','Wkts','Economy','Overs'].map(h => (
                  <th scope="col" key={h} style={{ padding: '8px 5px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textAlign: h==='#'||h==='Player'?'left':'center', textTransform: 'uppercase', paddingLeft: h==='#'?10:5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bowlersClutch.slice(0,20).map((b: any, i: number) => (
                <tr key={b.bowler} style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-subtle)')}
                  onMouseLeave={e=>(e.currentTarget.style.background='var(--bg)')}>
                  <td style={{ padding:'9px 5px 9px 10px', fontSize:11, color:'var(--text-4)', fontWeight:700 }}>{i+1}</td>
                  <td style={{ padding:'9px 5px', fontSize:12, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.bowler}</td>
                  <td style={{ padding:'9px 5px', textAlign:'center', fontSize:13, fontWeight:800, color:'var(--purple)' }}>{b.wickets}</td>
                  <td style={{ padding:'9px 5px', textAlign:'center', fontSize:12, color:'var(--text-3)' }}>{b.economy}</td>
                  <td style={{ padding:'9px 5px', textAlign:'center', fontSize:12, color:'var(--text-3)' }}>{b.overs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suppress unused var warning */}
      {maxRuns > 0 && null}
    </div>
  );
}

// ── Toss Analysis Tab ─────────────────────────────────────────────────────────
function TossTab() {
  const toss = tossAnalysis as any;
  const overall = toss.overall;
  const byTeam = toss.byTeam as any[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary card */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '20px', background: 'var(--bg)', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Toss Winner Match Win Rate</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1 }}>{overall.tossWinPct}%</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>
          Across {overall.totalMatches.toLocaleString()} IPL matches (2008–2025)
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 4 }}>
          Winning the toss gives only a small advantage — the game matters more.
        </div>
      </div>

      {/* Bat first vs Field first cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px', background: 'var(--bg)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Bat First</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#3b82f6', letterSpacing: '-0.04em', lineHeight: 1 }}>{overall.batFirst.winPct}%</div>
          <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 6 }}>win rate</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{overall.batFirst.wins}W from {overall.batFirst.matches} games</div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px', background: 'var(--bg)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>Field First</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#16a34a', letterSpacing: '-0.04em', lineHeight: 1 }}>{overall.fieldFirst.winPct}%</div>
          <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 6 }}>win rate</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 2 }}>{overall.fieldFirst.wins}W from {overall.fieldFirst.matches} games</div>
        </div>
      </div>

      {/* Team table */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Toss Stats by Team</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 40 }} /><col /><col style={{ width: 80 }} /><col style={{ width: 80 }} />
          </colgroup>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              {['', 'Team', 'Toss Win%', 'Win After Toss%'].map(h => (
                <th scope="col" key={h} style={{ padding: '8px 8px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textAlign: h === 'Team' ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byTeam.sort((a: any, b: any) => b.tossWinPct - a.tossWinPct).map((t: any, i: number) => (
              <tr key={t.team} style={{ borderBottom: i < byTeam.length - 1 ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}>
                <td style={{ padding: '9px 8px', textAlign: 'center' }}>
                  <TeamBadge short={t.short} color={t.color} size="xs" textColor={t.short === 'CSK' || t.short === 'SRH' ? '#000' : '#fff'} />
                </td>
                <td style={{ padding: '9px 8px', fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{t.team}</td>
                <td style={{ padding: '9px 8px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: t.color }}>{t.tossWinPct}%</td>
                <td style={{ padding: '9px 8px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>{t.tossToMatchWinPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Powerplay Tab ─────────────────────────────────────────────────────────────
function PowerplayTab() {
  const pp = powerplayStats as any;
  const byTeam: any[] = pp.byTeam;
  const byOver: any[] = pp.byOver;
  const overall = pp.overall;

  const sortedTeams = [...byTeam].sort((a, b) => b.avgPPScore - a.avgPPScore);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px', background: 'var(--bg)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Avg PP Score</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#3b82f6', letterSpacing: '-0.04em', lineHeight: 1 }}>{overall.avgPPScore}</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>runs in overs 1–6</div>
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px', background: 'var(--bg)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Avg Run Rate</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1 }}>{overall.avgRunRate}</div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>in powerplay</div>
        </div>
      </div>

      {/* Bar chart: avg PP score per team */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px', background: 'var(--bg)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Average Powerplay Score by Team</div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedTeams} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="short" tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} domain={[40, 55]} />
              <Tooltip content={<OverTip />} cursor={{ fill: 'var(--bg-muted)' }} />
              <Bar dataKey="avgPPScore" name="Avg PP Score" radius={[3,3,0,0]}>
                {sortedTeams.map((t: any) => (
                  <Cell key={t.short} fill={t.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Over-by-over breakdown */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Powerplay — Over by Over</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 60 }} /><col /><col style={{ width: 60 }} /><col style={{ width: 60 }} /><col style={{ width: 60 }} />
          </colgroup>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
              {['Over', 'Run Rate', 'Runs', 'Sixes', 'Wickets'].map(h => (
                <th scope="col" key={h} style={{ padding: '8px 6px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textAlign: h === 'Over' ? 'left' : 'center', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byOver.map((o: any, i: number) => (
              <tr key={o.over} style={{ borderBottom: i < byOver.length - 1 ? '1px solid var(--border)' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg)')}>
                <td style={{ padding: '9px 6px', fontWeight: 700, fontSize: 13, color: '#3b82f6' }}>{o.over}</td>
                <td style={{ padding: '9px 6px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{o.runRate}</td>
                <td style={{ padding: '9px 6px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>{o.runs.toLocaleString()}</td>
                <td style={{ padding: '9px 6px', textAlign: 'center', fontSize: 12, color: '#3b82f6' }}>{o.sixes}</td>
                <td style={{ padding: '9px 6px', textAlign: 'center', fontSize: 12, color: '#ef4444' }}>{o.wickets}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [tab, setTab] = useState<Tab>('overs');

  const tabConfig: { id: Tab; label: string; Icon: React.ElementType }[] = [
    { id: 'overs', label: 'Overs', Icon: ChartBar },
    { id: 'venues', label: 'Venues', Icon: MapPin },
    { id: 'clutch', label: 'Clutch', Icon: Lightning },
    { id: 'toss', label: 'Toss', Icon: Shuffle },
    { id: 'powerplay', label: 'Powerplay', Icon: ArrowsDownUp },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 14px 88px' }}>
      <div style={{ paddingTop: 20, paddingBottom: 20 }}>
        <h1 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
          Analytics
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Deep dives — over patterns, venue stats, clutch performers, toss & powerplay</p>
        <HistoricalBadge />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabConfig.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display:'flex', alignItems:'center', gap:6,
            padding: '7px 14px', fontSize: 12, fontWeight: tab===id?700:400, cursor: 'pointer',
            border: `1.5px solid ${tab===id?'var(--text)':'var(--border)'}`,
            borderRadius: 8,
            background: tab===id ? 'var(--text)' : 'var(--bg)',
            color: tab===id ? 'var(--bg)' : 'var(--text-3)', transition: 'all 0.15s',
          }}><Icon size={13} weight={tab===id?'fill':'regular'} />{label}</button>
        ))}
      </div>

      {tab === 'overs'     && <OverRunRateChart />}
      {tab === 'venues'    && <VenueTab />}
      {tab === 'clutch'    && <ClutchTab />}
      {tab === 'toss'      && <TossTab />}
      {tab === 'powerplay' && <PowerplayTab />}
    </div>
  );
}
