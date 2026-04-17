import { useState } from 'react';
import teamProfiles from '../data/team-profiles.json';
import h2hData from '../data/h2h-matrix.json';
import teamSeasons from '../data/team-seasons.json';
import rivalriesAll from '../data/rivalries-all.json';
import type { TeamProfile, H2HRecord } from '../types';
import TeamBadge from '../components/TeamBadge';
import HistoricalBadge from '../components/HistoricalBadge';
import PageSEO from '../components/PageSEO';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trophy } from '@phosphor-icons/react';

const allTeams = teamProfiles as TeamProfile[];
const active = allTeams.filter(t => t.active).sort((a, b) => b.stats.won - a.stats.won);
const historical = allTeams.filter(t => !t.active).sort((a, b) => b.stats.played - a.stats.played);
const h2h = h2hData as H2HRecord[];
const seasons = teamSeasons as Record<string, { season: string; won: number; lost: number; played: number; nr: number }[]>;
const rivalriesAllData = rivalriesAll as any[];

const TITLE_WINNERS: Record<string, string> = {
  '2008':'Rajasthan Royals','2009':'Deccan Chargers','2010':'Chennai Super Kings',
  '2011':'Chennai Super Kings','2012':'Kolkata Knight Riders','2013':'Mumbai Indians',
  '2014':'Kolkata Knight Riders','2015':'Mumbai Indians','2016':'Sunrisers Hyderabad',
  '2017':'Mumbai Indians','2018':'Chennai Super Kings','2019':'Mumbai Indians',
  '2020':'Mumbai Indians','2021':'Chennai Super Kings','2022':'Gujarat Titans',
  '2023':'Chennai Super Kings','2024':'Kolkata Knight Riders','2025':'Royal Challengers Bengaluru',
};

function getH2H(t1: string, t2: string) {
  const r = h2h.find(h => (h.team1===t1&&h.team2===t2)||(h.team1===t2&&h.team2===t1));
  if (!r) return null;
  const flipped = r.team1 === t2;
  return { played: r.played, t1Wins: flipped?r.t2Wins:r.t1Wins, t2Wins: flipped?r.t1Wins:r.t2Wins, nr: r.noResult };
}

function getRivalryRecord(t1: string, t2: string) {
  return rivalriesAllData.find((r: any) =>
    (r.team1 === t1 && r.team2 === t2) || (r.team1 === t2 && r.team2 === t1)
  ) || null;
}

function Tip({ active: a, payload, label }: any) {
  if (!a || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
      <div style={{ fontWeight:700, color:'var(--text)', marginBottom:4 }}>IPL {label}</div>
      {payload.map((p: any) => <div key={p.name} style={{ color:p.fill, marginTop:2 }}>{p.name}: <strong>{p.value}</strong></div>)}
    </div>
  );
}

export default function Teams() {
  const [sel, setSel] = useState<TeamProfile>(active[0]);
  const [tab, setTab] = useState<'overview'|'h2h'>('overview');
  const [showHistorical, setShowHistorical] = useState(false);

  const opponents = allTeams
    .filter(t => t.name !== sel.name)
    .map(t => ({ team: t, record: getH2H(sel.name, t.name) }))
    .filter(x => x.record)
    .sort((a, b) => b.record!.played - a.record!.played);

  const seasonData = seasons[sel.name] || [];
  const ipl18Years = Array.from({ length: 18 }, (_, i) => String(2008 + i));

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 14px 88px' }}>
      <PageSEO
        title="IPL Teams — Profiles, Rivalries & Head-to-Head"
        description="All 10 active IPL franchises: season-by-season stats, head-to-head records, and all-time rivalries across 18 seasons of IPL history."
        path="/teams"
      />
      <div style={{ paddingTop: 20, paddingBottom: 20 }}>
        <h1 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>IPL Teams</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>10 active franchises · {historical.length} historical</p>
        <HistoricalBadge />
      </div>

      {/* Team picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {active.map(t => (
          <button key={t.name} onClick={() => { setSel(t); setTab('overview'); }} style={{
            display:'flex', alignItems:'center', gap:6, padding:'5px 10px 5px 6px',
            borderRadius:8, cursor:'pointer', transition:'all 0.15s',
            border:`1.5px solid ${sel.name===t.name?t.color:'var(--border)'}`,
            background: sel.name===t.name?`${t.color}12`:'var(--bg)',
          }}>
            <TeamBadge short={t.short} color={t.color} size="xs" textColor={t.short==='CSK'||t.short==='SRH'?'#000':'#fff'} />
            <span style={{ fontSize:12, fontWeight:sel.name===t.name?700:400, color:sel.name===t.name?t.color:'var(--text-3)' }}>{t.short}</span>
          </button>
        ))}
      </div>

      {/* Historical teams toggle + picker */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setShowHistorical(v => !v)}
          aria-expanded={showHistorical}
          style={{
            display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px',
            borderRadius:999, border:'1px dashed var(--border)', background:'transparent',
            cursor:'pointer', fontSize:11, fontWeight:600, color:'var(--text-4)',
            letterSpacing:'0.02em',
          }}>
          <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--text-4)' }} />
          {showHistorical ? 'Hide' : 'Show'} historical teams ({historical.length})
        </button>

        {showHistorical && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
            {historical.map(t => (
              <button key={t.name} onClick={() => { setSel(t); setTab('overview'); }} style={{
                display:'flex', alignItems:'center', gap:6, padding:'5px 10px 5px 6px',
                borderRadius:8, cursor:'pointer', transition:'all 0.15s',
                border:`1.5px dashed ${sel.name===t.name?t.color:'var(--border)'}`,
                background: sel.name===t.name?`${t.color}12`:'var(--bg)',
                opacity: sel.name===t.name?1:0.85,
              }}>
                <TeamBadge short={t.short} color={t.color} size="xs" textColor={t.short==='CSK'||t.short==='SRH'?'#000':'#fff'} />
                <span style={{ fontSize:12, fontWeight:sel.name===t.name?700:400, color:sel.name===t.name?t.color:'var(--text-3)' }}>{t.short}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Header card */}
      <div style={{ border:'1px solid var(--border)', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
        <div style={{ borderTop:`3px solid ${sel.color}` }} />
        <div style={{ padding:'18px', background:`${sel.color}06` }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
            <TeamBadge short={sel.short} color={sel.color} size="lg" textColor={sel.short==='CSK'||sel.short==='SRH'?'#000':'#fff'} />
            <div style={{ flex:1, minWidth:140 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:2 }}>
                <h2 style={{ fontSize:'clamp(17px,3vw,22px)', fontWeight:800, letterSpacing:'-0.03em', color:'var(--text)' }}>{sel.name}</h2>
                {!sel.active && (
                  <span style={{
                    fontSize:9, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
                    padding:'2px 7px', borderRadius:999, background:'#fef3c7', color:'#92400e', border:'1px solid #fde68a',
                  }}>Defunct</span>
                )}
              </div>
              <p style={{ fontSize:12, color:'var(--text-3)' }}>
                {sel.city} · {sel.ground} · {sel.active ? `Est. ${sel.founded}` : `${sel.seasonsPlayed[0]}–${sel.seasonsPlayed[sel.seasonsPlayed.length-1]}`}
              </p>
            </div>
            {sel.titleCount>0 && (
              <div style={{ textAlign:'center', padding:'8px 14px', borderRadius:8, background:`${sel.color}15`, border:`1px solid ${sel.color}30` }}>
                <div style={{ fontSize:28, fontWeight:900, color:sel.color, lineHeight:1 }}>{sel.titleCount}</div>
                <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2, fontWeight:600 }}>TITLE{sel.titleCount>1?'S':''}</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderTop:'1px solid var(--border)' }}>
          {[{l:'Played',v:sel.stats.played,c:'var(--text)'},{l:'Won',v:sel.stats.won,c:'#16a34a'},{l:'Win %',v:`${sel.stats.winPct}%`,c:sel.color},{l:'Titles',v:sel.titleCount,c:sel.color}].map((s,i)=>( 
            <div key={s.l} style={{ padding:'12px 10px', textAlign:'center', borderRight:i<3?'1px solid var(--border)':'none' }}>
              <div style={{ fontSize:'clamp(14px,3vw,20px)', fontWeight:800, color:s.c, letterSpacing:'-0.02em', lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:10, color:'var(--text-4)', marginTop:3, textTransform:'uppercase', letterSpacing:'0.03em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', marginBottom:16, border:'1px solid var(--border)', borderRadius:8, overflow:'hidden', width:'fit-content' }}>
        {(['overview','h2h'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:'7px 18px', fontSize:13, fontWeight:tab===t?600:400, cursor:'pointer',
            border:'none', background:tab===t?'var(--text)':'var(--bg)',
            color:tab===t?'var(--bg)':'var(--text-3)', transition:'all 0.15s', textTransform:'capitalize',
          }}>{t==='h2h'?'Head-to-Head':'Overview'}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Season-by-season chart */}
          {seasonData.length > 0 ? (
            <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'14px', background:'var(--bg)' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:12 }}>Season-by-Season Record</div>
              <div style={{ height:170 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seasonData} margin={{top:0,right:0,bottom:0,left:-20}}>
                    <XAxis dataKey="season" tick={{fill:'var(--text-4)',fontSize:9}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill:'var(--text-4)',fontSize:9}} axisLine={false} tickLine={false} />
                    <Tooltip content={<Tip />} cursor={{fill:'var(--bg-muted)'}} />
                    <Bar dataKey="won" name="Won" fill="#16a34a" radius={[2,2,0,0]} stackId="a" />
                    <Bar dataKey="lost" name="Lost" fill="#ef4444" radius={[0,0,0,0]} stackId="a" />
                    <Legend iconType="square" iconSize={8} wrapperStyle={{fontSize:11,color:'var(--text-4)'}} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'14px', background:'var(--bg)' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:6 }}>Season-by-Season Record</div>
              <div style={{ fontSize:12, color:'var(--text-4)' }}>
                Played {sel.seasonsPlayed.length} season{sel.seasonsPlayed.length>1?'s':''} ({sel.seasonsPlayed[0]}–{sel.seasonsPlayed[sel.seasonsPlayed.length-1]}). Per-season breakdown unavailable for historical franchises.
              </div>
            </div>
          )}

          {/* Title Timeline */}
          <div style={{ border:'1px solid var(--border)', borderRadius:10, padding:'14px', background:'var(--bg)' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:10 }}>IPL Season Timeline</div>
            <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' as any }}>
              <div style={{ display:'flex', gap:4, paddingBottom:4, minWidth:'fit-content' }}>
                {ipl18Years.map(yr => {
                  const winner = TITLE_WINNERS[yr];
                  const isWinner = winner === sel.name;
                  return (
                    <div key={yr} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                      <div style={{
                        width:28, height:20, borderRadius:4,
                        background: isWinner ? sel.color : 'var(--bg-muted)',
                        border: isWinner ? `1px solid ${sel.color}` : '1px solid var(--border)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>
                        {isWinner && <Trophy size={10} weight="fill" color={sel.short==='CSK'||sel.short==='SRH'?'#000':'#fff'} />}
                      </div>
                      <span style={{ fontSize:8, color: isWinner ? sel.color : 'var(--text-4)', fontWeight: isWinner ? 700 : 400 }}>
                        '{yr.slice(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Seasons span */}
          <div style={{border:'1px solid var(--border)',borderRadius:10,padding:'14px',background:'var(--bg)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:4}}>IPL Seasons</div>
              <div style={{fontSize:22,fontWeight:800,color:'var(--text)',letterSpacing:'-0.03em',lineHeight:1}}>{sel.seasonsPlayed.length}</div>
            </div>
            <div style={{fontSize:13,color:'var(--text-4)'}}>{sel.seasonsPlayed[0]} – {sel.seasonsPlayed[sel.seasonsPlayed.length-1]}</div>
          </div>

        </div>
      )}

      {tab === 'h2h' && (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <p style={{fontSize:12,color:'var(--text-4)',marginBottom:4}}>All-time record vs each opponent (IPL only)</p>
          {opponents.map(({team:opp,record})=>{
            if (!record) return null;
            const pct = record.played>0?Math.round(record.t1Wins/record.played*100):0;
            const rivalry = getRivalryRecord(sel.name, opp.name);
            const recentResults = rivalry?.recentResults || [];
            return (
              <div key={opp.name} style={{border:'1px solid var(--border)',borderRadius:10,padding:'14px',background:'var(--bg)'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <TeamBadge short={sel.short} color={sel.color} size="sm" textColor={sel.short==='CSK'||sel.short==='SRH'?'#000':'#fff'} />
                    <span style={{fontSize:14,fontWeight:700,color:sel.color}}>{sel.short}</span>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:18,fontWeight:800,color:'var(--text)',letterSpacing:'-0.02em'}}>
                      {record.t1Wins} <span style={{color:'var(--text-4)',fontWeight:400,fontSize:13}}>–</span> {record.t2Wins}
                    </div>
                    <div style={{fontSize:10,color:'var(--text-4)'}}>{record.played} matches{record.nr>0?` · ${record.nr} NR`:''}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:14,fontWeight:700,color:opp.color}}>{opp.short}</span>
                    <TeamBadge short={opp.short} color={opp.color} size="sm" textColor={opp.short==='CSK'||opp.short==='SRH'?'#000':'#fff'} />
                  </div>
                </div>
                <div style={{height:6,borderRadius:3,background:`${opp.color}30`,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:sel.color,borderRadius:3,transition:'width 0.4s ease'}} />
                </div>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:10,color:'var(--text-4)'}}>
                  <span style={{color:sel.color}}>{pct}% win rate</span>
                  <span style={{color:opp.color}}>{100-pct}% win rate</span>
                </div>

                {/* Last 5 results */}
                {recentResults.length > 0 && (
                  <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid var(--border)'}}>
                    <div style={{fontSize:10,fontWeight:700,color:'var(--text-4)',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:6}}>Last 5 Results</div>
                    <div style={{display:'flex',flexDirection:'column',gap:3}}>
                      {recentResults.slice(0,5).map((r: any, ri: number) => {
                        const isSelWinner = r.winner === sel.name;
                        const isOppWinner = r.winner === opp.name;
                        const winnerShort = isSelWinner ? sel.short : isOppWinner ? opp.short : 'NR';
                        const winnerColor = isSelWinner ? sel.color : isOppWinner ? opp.color : 'var(--text-4)';
                        return (
                          <div key={ri} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{fontSize:11,color:'var(--text-4)'}}>IPL {r.season}</span>
                            <span style={{fontSize:11,fontWeight:700,color:winnerColor,padding:'1px 8px',borderRadius:4,background:`${winnerColor}15`}}>
                              {winnerShort}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
