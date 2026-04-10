import { useState, useMemo } from 'react';
import { Handshake, House, Sword, CalendarBlank, Star } from '@phosphor-icons/react';
import TeamBadge from '../components/TeamBadge';
import partnershipsData from '../data/partnerships.json';
import homeAdvData from '../data/home-advantage.json';
import rivalriesAllData from '../data/rivalries-all.json';
import otdData from '../data/on-this-day.json';
import venueAnalyticsData from '../data/venue-analytics.json';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Partnership {
  p1: string; p2: string; batting_team: string;
  total_runs: number; total_innings: number; avg_runs: number; best: number;
}
interface BestInnings {
  p1: string; p2: string; batting_team: string;
  runs: number; balls: number; sr: number; season_label: string; venue: string;
}
interface HomeAdv {
  team: string; short: string; color: string;
  home: { won: number; played: number; winPct: number };
  away: { won: number; played: number; winPct: number };
  advantage: number;
}
interface RivalryAll {
  team1: string; team2: string; short1: string; short2: string;
  color1: string; color2: string; played: number;
  t1Wins: number; t2Wins: number; noResult: number;
  recentResults: { season: string; winner: string }[];
}
interface OTDEntry {
  season: string; year: number; teams: string;
  winner: string; venue: string; pom: string; highlights: string[];
}

const partnerships = (partnershipsData as any).topPairs as Partnership[];
const bestInnings  = (partnershipsData as any).bestInnings as BestInnings[];
const homeAdv      = homeAdvData as HomeAdv[];
const rivalriesAll = rivalriesAllData as RivalryAll[];
const otd          = otdData as Record<string, OTDEntry[]>;
const venueAnalytics = venueAnalyticsData as any[];

type Tab = 'partnerships' | 'homeadvantage' | 'rivalries' | 'onthisday';

import { TEAM_COLORS as TEAM_COLOR, LOGO_CODE as TEAM_SHORT } from '../lib/teams';

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontSize:12, boxShadow:'0 4px 12px rgba(0,0,0,.06)' }}>
      <div style={{ fontWeight:700, color:'var(--text)', marginBottom:4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color:p.fill||'var(--text-3)', marginTop:2 }}>
          {p.name}: <strong>{p.value}%</strong>
        </div>
      ))}
    </div>
  );
}

// ── PARTNERSHIPS ──────────────────────────────────────────────────────────────
function Partnerships() {
  const [view, setView] = useState<'total'|'innings'>('total');
  const [teamFilter, setTeamFilter] = useState('All');

  const teams = useMemo(() => {
    const t = new Set(partnerships.map(p => p.batting_team));
    return ['All', ...Array.from(t).sort()];
  }, []);

  const filteredPairs = useMemo(() =>
    partnerships.filter(p => teamFilter === 'All' || p.batting_team === teamFilter),
    [teamFilter]
  );
  const filteredInnings = useMemo(() =>
    bestInnings.filter(p => teamFilter === 'All' || p.batting_team === teamFilter),
    [teamFilter]
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Controls */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', flexShrink:0 }}>
          {([['total','All-Time Totals'],['innings','Best Innings']] as const).map(([v,l]) => (
            <button key={v} onClick={()=>setView(v)} style={{
              padding:'6px 14px', fontSize:12, fontWeight:view===v?600:400, cursor:'pointer',
              border:'none', background:view===v?'var(--text)':'var(--bg)',
              color:view===v?'var(--bg)':'var(--text-3)', transition:'all .15s',
            }}>{l}</button>
          ))}
        </div>
        <select value={teamFilter} onChange={e=>setTeamFilter(e.target.value)} style={{
          padding:'6px 10px', borderRadius:8, fontSize:12, border:'1px solid var(--border)',
          background:'var(--bg)', color:'var(--text)', cursor:'pointer', outline:'none',
        }}>
          {teams.map((t,i) => <option key={i} value={t}>{t === 'All' ? 'All Teams' : TEAM_SHORT[t]||t}</option>)}
        </select>
      </div>

      {view === 'total' ? (
        <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', background:'var(--bg)' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'var(--bg-subtle)' }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>Most Partnership Runs (all-time)</span>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
            <colgroup>
              <col style={{width:24}}/><col/><col style={{width:52}}/><col style={{width:40}}/><col style={{width:40}}/><col style={{width:40}}/>
            </colgroup>
            <thead>
              <tr style={{ background:'var(--bg-subtle)', borderBottom:'1px solid var(--border)' }}>
                {['#','Partnership','Runs','Inns','Avg','Best'].map(h=>(
                  <th scope="col" key={h} style={{ padding:'8px 5px', fontSize:10, fontWeight:700, color:'var(--text-4)',
                    textAlign:h==='#'||h==='Partnership'?'left':'center', textTransform:'uppercase',
                    letterSpacing:'0.03em', paddingLeft:h==='#'?10:5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPairs.slice(0,20).map((p,idx)=>{ const i=idx;
                const c = TEAM_COLOR[p.batting_team]||'var(--accent)';
                return (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-subtle)')}
                    onMouseLeave={e=>(e.currentTarget.style.background='var(--bg)')}>
                    <td style={{ padding:'10px 5px 10px 10px', fontSize:11, color:'var(--text-4)', fontWeight:700 }}>{i+1}</td>
                    <td style={{ padding:'10px 5px', overflow:'hidden' }}>
                      <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {p.p1} & {p.p2}
                      </div>
                      <div style={{ fontSize:10, color:c, fontWeight:600, marginTop:1 }}>{TEAM_SHORT[p.batting_team]||p.batting_team}</div>
                    </td>
                    <td style={{ padding:'10px 5px', textAlign:'center', fontSize:14, fontWeight:800, color:'var(--accent)' }}>{p.total_runs.toLocaleString()}</td>
                    <td style={{ padding:'10px 5px', textAlign:'center', fontSize:12, color:'var(--text-3)' }}>{p.total_innings}</td>
                    <td style={{ padding:'10px 5px', textAlign:'center', fontSize:12, color:'var(--text-3)' }}>{p.avg_runs}</td>
                    <td style={{ padding:'10px 5px', textAlign:'center', fontSize:12, fontWeight:700, color:'var(--blue)' }}>{p.best}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', background:'var(--bg)' }}>
          <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'var(--bg-subtle)' }}>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>Highest Partnership Innings</span>
          </div>
          {filteredInnings.slice(0,20).map((p,idx)=>{ const i=idx;
            const c = TEAM_COLOR[p.batting_team]||'var(--accent)';
            return (
              <div key={i} style={{ padding:'12px 14px', borderBottom:i<19?'1px solid var(--border)':'none' }}
                onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-subtle)')}
                onMouseLeave={e=>(e.currentTarget.style.background='var(--bg)')}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {p.p1} & {p.p2}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-4)', marginTop:2 }}>
                      <span style={{ color:c, fontWeight:600 }}>{TEAM_SHORT[p.batting_team]||p.batting_team}</span>
                      {' · '}{p.season_label}{' · '}{(p.venue||'').split(',')[0]}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:18, fontWeight:800, color:'var(--accent)', lineHeight:1 }}>{p.runs}</div>
                    <div style={{ fontSize:10, color:'var(--text-4)', marginTop:2 }}>{p.balls}b · SR {p.sr}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── HOME ADVANTAGE INDEX ──────────────────────────────────────────────────────
function HomeAdvantage() {
  const chartData = homeAdv.map(h => ({
    name: h.short,
    Home: h.home.winPct,
    Away: h.away.winPct,
    color: h.color,
  }));

  // Best home grounds — venues with most bat-first wins (as proxy for home advantage)
  const topGrounds = [...venueAnalytics]
    .sort((a, b) => b.batFirstWins - a.batFirstWins)
    .slice(0, 5);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <p style={{ fontSize:13, color:'var(--text-3)', lineHeight:1.6 }}>
        How much does playing at home matter? Home Advantage Index = Home Win% minus Away Win%.
        Positive = stronger at home. Negative = road warriors.
      </p>

      {/* Bar chart — home vs away */}
      <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'16px', background:'var(--bg)' }}>
        <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:14 }}>Home vs Away Win % — All Teams</div>
        <div style={{ height:220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{top:0,right:0,bottom:0,left:-20}} barCategoryGap="20%">
              <XAxis dataKey="name" tick={{ fill:'var(--text-4)', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-4)', fontSize:10 }} axisLine={false} tickLine={false} domain={[0,80]} />
              <Tooltip content={<Tip />} cursor={{fill:'var(--bg-muted)'}} />
              <Bar dataKey="Home" name="Home" fill="#16a34a" radius={[3,3,0,0]} />
              <Bar dataKey="Away" name="Away" fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display:'flex', gap:14, justifyContent:'center', marginTop:6, fontSize:11 }}>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{width:10,height:10,borderRadius:2,background:'#16a34a'}}/><span style={{color:'var(--text-4)'}}>Home</span></div>
          <div style={{ display:'flex', alignItems:'center', gap:4 }}><div style={{width:10,height:10,borderRadius:2,background:'#ef4444'}}/><span style={{color:'var(--text-4)'}}>Away</span></div>
        </div>
      </div>

      {/* Cards sorted by advantage */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {homeAdv.map((h) => {
          const isPositive = h.advantage >= 0;
          return (
            <div key={h.team} style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', background:'var(--bg)' }}>
              <div style={{ padding:'12px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:`${h.color}06` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <TeamBadge short={h.short} color={h.color} textColor={h.short==='CSK'||h.short==='SRH'?'#000':'#fff'} size="sm" />
                  <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{h.team}</span>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:16, fontWeight:800, color:isPositive?'#16a34a':'var(--red)', letterSpacing:'-0.02em' }}>
                    {isPositive?'+':''}{h.advantage}%
                  </div>
                  <div style={{ fontSize:10, color:'var(--text-4)' }}>advantage</div>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:'1px solid var(--border)' }}>
                {[
                  {label:'Home',won:h.home.won,played:h.home.played,pct:h.home.winPct,color:'#16a34a'},
                  {label:'✈️ Away',won:h.away.won,played:h.away.played,pct:h.away.winPct,color:'var(--red)'},
                ].map((s,si)=>(
                  <div key={s.label} style={{ padding:'10px 14px', borderRight:si===0?'1px solid var(--border)':'none' }}>
                    <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:4 }}>{s.label}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:s.color, letterSpacing:'-0.02em', lineHeight:1 }}>{s.pct}%</div>
                    <div style={{ fontSize:11, color:'var(--text-4)', marginTop:2 }}>{s.won}W / {s.played}M</div>
                  </div>
                ))}
              </div>
              {/* Bar */}
              <div style={{ padding:'8px 14px 12px' }}>
                <div style={{ height:6, borderRadius:3, background:'var(--bg-muted)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:3,
                    width:`${Math.min(h.home.winPct, 100)}%`,
                    background:'#16a34a', transition:'width .4s ease' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Best Home Grounds */}
      <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', background:'var(--bg)' }}>
        <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', background:'var(--bg-subtle)' }}>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>Best Home Grounds (most bat-first wins)</span>
        </div>
        {topGrounds.map((v, i) => {
          const total = v.batFirstWins + v.fieldFirstWins;
          const batPct = total > 0 ? Math.round(v.batFirstWins / total * 100) : 50;
          return (
            <div key={v.venue} style={{ padding:'12px 14px', borderBottom:i<topGrounds.length-1?'1px solid var(--border)':'none',
              display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}
              onMouseEnter={e=>(e.currentTarget.style.background='var(--bg-subtle)')}
              onMouseLeave={e=>(e.currentTarget.style.background='var(--bg)')}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.venue}</div>
                <div style={{ fontSize:11, color:'var(--text-4)', marginTop:1 }}>{v.city} · {v.matches} matches</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:15, fontWeight:800, color:'#3b82f6' }}>{v.batFirstWins}W</div>
                <div style={{ fontSize:10, color:'var(--text-4)' }}>bat first · {batPct}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── RIVALRIES ─────────────────────────────────────────────────────────────────
function Rivalries() {
  const [selected, setSelected] = useState<RivalryAll>(rivalriesAll[0]);
  const [showAll, setShowAll] = useState(false);

  const displayedRivalries = showAll ? rivalriesAll : rivalriesAll.slice(0, 10);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Rivalry picker */}
      <div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {displayedRivalries.map(r => (
            <button key={`${r.team1}-${r.team2}`} onClick={()=>setSelected(r)} style={{
              padding:'5px 10px', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer',
              border:`1.5px solid ${selected===r?r.color1:'var(--border)'}`,
              background:selected===r?`${r.color1}12`:'var(--bg)',
              color:selected===r?r.color1:'var(--text-3)',
              transition:'all .15s',
            }}>{r.short1} vs {r.short2}</button>
          ))}
        </div>
        {!showAll && rivalriesAll.length > 10 && (
          <button onClick={() => setShowAll(true)} style={{
            marginTop:8, padding:'5px 12px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer',
            border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text-3)',
          }}>Show all {rivalriesAll.length} rivalries ▾</button>
        )}
        {showAll && (
          <button onClick={() => setShowAll(false)} style={{
            marginTop:8, padding:'5px 12px', borderRadius:6, fontSize:11, fontWeight:600, cursor:'pointer',
            border:'1px solid var(--border)', background:'var(--bg)', color:'var(--text-3)',
          }}>Show fewer ▴</button>
        )}
      </div>

      {/* Main rivalry card */}
      <div style={{ border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', background:'var(--bg)' }}>
        {/* Header */}
        <div style={{ padding:'18px', borderBottom:'1px solid var(--border)',
          background:`linear-gradient(135deg, ${selected.color1}10, ${selected.color2}10)` }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <TeamBadge short={selected.short1} color={selected.color1} textColor={selected.short1==='CSK'||selected.short1==='SRH'?'#000':'#fff'} size="lg" />
              <div>
                <div style={{ fontSize:12, color:'var(--text-4)' }}>All-time</div>
                <div style={{ fontSize:26, fontWeight:900, color:'var(--text)', letterSpacing:'-0.04em', lineHeight:1 }}>
                  {selected.t1Wins} <span style={{color:'var(--text-4)',fontWeight:300,fontSize:18}}>–</span> {selected.t2Wins}
                </div>
                <div style={{ fontSize:11, color:'var(--text-4)' }}>{selected.played} matches{selected.noResult>0?` · ${selected.noResult} NR`:''}</div>
              </div>
            </div>
            <TeamBadge short={selected.short2} color={selected.color2} textColor={selected.short2==='CSK'||selected.short2==='SRH'?'#000':'#fff'} size="lg" />
          </div>

          {/* Win bar */}
          <div style={{ height:8, borderRadius:4, display:'flex', overflow:'hidden' }}>
            <div style={{ flex:selected.t1Wins, background:selected.color1, transition:'flex .5s ease' }} />
            <div style={{ flex:selected.t2Wins, background:selected.color2, transition:'flex .5s ease' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:5, fontSize:11 }}>
            <span style={{ color:selected.color1, fontWeight:700 }}>{Math.round(selected.t1Wins/selected.played*100)}%</span>
            <span style={{ color:'var(--text-4)' }}>{selected.played} matches played</span>
            <span style={{ color:selected.color2, fontWeight:700 }}>{Math.round(selected.t2Wins/selected.played*100)}%</span>
          </div>
        </div>

        {/* Recent Results */}
        <div style={{ padding:'14px 18px' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:10 }}>Last 5 Results</div>
          {selected.recentResults.slice(0, 5).map((r, i) => {
            const isT1 = r.winner === selected.team1;
            const isT2 = r.winner === selected.team2;
            const winnerShort = isT1 ? selected.short1 : isT2 ? selected.short2 : 'NR';
            const color = isT1 ? selected.color1 : isT2 ? selected.color2 : 'var(--text-4)';
            return (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 0', borderBottom:i<Math.min(selected.recentResults.length,5)-1?'1px solid var(--border)':'none' }}>
                <span style={{ fontSize:11, color:'var(--text-4)' }}>IPL {r.season}</span>
                <span style={{ fontSize:11, fontWeight:700, color, padding:'2px 8px', borderRadius:4, background:`${color}15` }}>{winnerShort}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── ON THIS DAY ───────────────────────────────────────────────────────────────
function OnThisDay() {
  const today = new Date();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  const todayKey = `${mm}-${dd}`;

  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [highlightFilter, setHighlightFilter] = useState<'all'|'centuries'|'fivewickets'>('all');

  // Available dates sorted
  const availableDates = useMemo(()=>
    Object.keys(otd).sort(),
  []);

  // Find nearest date with data
  const nearestKey = useMemo(() => {
    if (otd[todayKey]) return todayKey;
    // Try nearby dates
    for (let delta = 1; delta <= 7; delta++) {
      for (const sign of [1,-1]) {
        const d = new Date(today);
        d.setDate(d.getDate() + delta * sign);
        const k = `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if (otd[k]) return k;
      }
    }
    return availableDates[0];
  }, [todayKey]);

  const displayKey = otd[selectedDate] ? selectedDate : nearestKey;
  const allEvents = otd[displayKey] || [];

  // Apply highlight filter
  const events = useMemo(() => {
    if (highlightFilter === 'all') return allEvents;
    if (highlightFilter === 'centuries') {
      return allEvents.filter(ev => ev.highlights.some(h => h.toLowerCase().includes('century') || h.toLowerCase().includes('100')));
    }
    if (highlightFilter === 'fivewickets') {
      return allEvents.filter(ev => ev.highlights.some(h => h.toLowerCase().includes('5-wicket') || h.toLowerCase().includes('5 wicket') || h.toLowerCase().includes('five wicket')));
    }
    return allEvents;
  }, [allEvents, highlightFilter]);

  function fmtDate(key: string) {
    const [m,d] = key.split('-');
    return new Date(2024, parseInt(m)-1, parseInt(d)).toLocaleDateString('en-IN',{day:'numeric',month:'long'});
  }

  const isToday = displayKey === todayKey;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Date selector */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:20, fontWeight:900, color:'var(--text)', letterSpacing:'-0.03em' }}>
              {isToday ? '⚡ Today —' : ''} {fmtDate(displayKey)}
            </span>
            {isToday && <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, fontWeight:600, background:'var(--accent-bg)', color:'var(--accent)', border:'1px solid var(--accent-border)' }}>Live</span>}
          </div>
          <p style={{ fontSize:13, color:'var(--text-4)', margin:0 }}>
            {allEvents.length > 0
              ? `${allEvents.length} IPL match${allEvents.length>1?'es':''} played on this date across the years`
              : 'No IPL matches recorded on this date'}
          </p>
        </div>
        <select value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={{
          padding:'7px 10px', borderRadius:8, fontSize:12, border:'1px solid var(--border)',
          background:'var(--bg)', color:'var(--text)', cursor:'pointer', outline:'none', flexShrink:0,
        }}>
          {availableDates.map(k=>(
            <option key={k} value={k}>{fmtDate(k)}</option>
          ))}
        </select>
      </div>

      {/* Filter buttons */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {([['all','All'],['centuries','Centuries'],['fivewickets','5-Wickets']] as const).map(([v,l]) => (
          <button key={v} onClick={() => setHighlightFilter(v)} style={{
            padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:highlightFilter===v?700:400, cursor:'pointer',
            border:`1px solid ${highlightFilter===v?'var(--accent)':'var(--border)'}`,
            background:highlightFilter===v?'var(--accent-bg)':'var(--bg)',
            color:highlightFilter===v?'var(--accent)':'var(--text-3)', transition:'all .15s',
          }}>{l}</button>
        ))}
      </div>

      {events.length === 0 ? (
        <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'32px', textAlign:'center', background:'var(--bg-subtle)' }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🏏</div>
          <div style={{ fontSize:14, color:'var(--text-3)' }}>
            {allEvents.length === 0
              ? `No IPL matches on ${fmtDate(displayKey)}`
              : `No matches match the "${highlightFilter}" filter for this date`}
          </div>
          <div style={{ fontSize:12, color:'var(--text-4)', marginTop:4 }}>Try a date between late March and late May</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {events.map((ev,i)=>(
            <div key={i} style={{ border:'1px solid var(--border)', borderRadius:10, padding:'14px', background:'var(--bg)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                <div>
                  <span style={{ fontSize:11, padding:'2px 8px', borderRadius:999, fontWeight:700,
                    background:'var(--bg-muted)', color:'var(--text-3)', marginRight:6 }}>IPL {ev.season}</span>
                  <span style={{ fontSize:12, color:'var(--text-4)' }}>{ev.year}</span>
                </div>
                {ev.pom && (
                  <span style={{ fontSize:10, padding:'2px 8px', borderRadius:999, fontWeight:600,
                    background:'var(--accent-bg)', color:'var(--accent)', border:'1px solid var(--accent-border)', flexShrink:0 }}>
                    {ev.pom}
                  </span>
                )}
              </div>

              <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:4, lineHeight:1.4 }}>
                {ev.teams}
              </div>

              <div style={{ fontSize:13, fontWeight:700, color:'var(--accent)', marginBottom:ev.highlights.length>0?8:0 }}>
                {ev.winner !== 'No Result' && ev.winner !== 'NR' ? `${TEAM_SHORT[ev.winner]||ev.winner} won` : 'No Result'}
              </div>

              {ev.highlights.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                  {ev.highlights.map((h,hi)=>(
                    <div key={hi} style={{ fontSize:12, color:'var(--text-3)', display:'flex', alignItems:'flex-start', gap:6 }}>
                      <Star size={11} weight="fill" color="var(--blue)" style={{flexShrink:0, marginTop:2}} />
                      {h}
                    </div>
                  ))}
                </div>
              )}

              {ev.venue && (
                <div style={{ fontSize:11, color:'var(--text-4)', marginTop:8 }}>{ev.venue.split(',')[0]}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id:'partnerships',  label:'Partnerships', Icon: Handshake },
  { id:'homeadvantage', label:'Home Advantage', Icon: House },
  { id:'rivalries',     label:'Rivalries', Icon: Sword },
  { id:'onthisday',     label:'On This Day', Icon: CalendarBlank },
];

export default function DeepDives() {
  const [tab, setTab] = useState<Tab>('partnerships');

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', padding:'56px 14px 88px' }}>
      <div style={{ paddingTop:20, paddingBottom:20 }}>
        <h1 style={{ fontSize:'clamp(22px,4vw,36px)', fontWeight:800, letterSpacing:'-0.04em', color:'var(--text)', marginBottom:4 }}>
          Deep Dives
        </h1>
        <p style={{ fontSize:13, color:'var(--text-3)' }}>Partnerships · Home advantage · Rivalries · On This Day</p>
      </div>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'7px 14px', borderRadius:8, fontSize:12, fontWeight:tab===t.id?700:400, cursor:'pointer',
            border:`1.5px solid ${tab===t.id?'var(--text)':'var(--border)'}`,
            background:tab===t.id?'var(--text)':'var(--bg)',
            color:tab===t.id?'var(--bg)':'var(--text-3)',
            transition:'all .15s',
          }}>
            <t.Icon size={14} weight={tab===t.id?'fill':'regular'} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'partnerships'  && <Partnerships />}
      {tab === 'homeadvantage' && <HomeAdvantage />}
      {tab === 'rivalries'     && <Rivalries />}
      {tab === 'onthisday'     && <OnThisDay />}
    </div>
  );
}
