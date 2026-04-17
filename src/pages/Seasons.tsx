import seasonData from '../data/season-summary.json';
import type { SeasonSummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Baseball, Star, Users, MapPin, Medal } from '@phosphor-icons/react';
import TeamBadge from '../components/TeamBadge';
import HistoricalBadge from '../components/HistoricalBadge';

const seasons = seasonData as SeasonSummary[];

import { TEAM_COLORS, LOGO_CODE, TEAM_TEXT_COLOR } from '../lib/teams';

const CHAMP_COLOR = TEAM_COLORS;

const TEAM_META: Record<string, { color: string; short: string; textColor?: string }> =
  Object.fromEntries(
    Object.entries(LOGO_CODE).map(([name, short]) => [
      name,
      { color: TEAM_COLORS[name] || '#6366f1', short, textColor: TEAM_TEXT_COLOR[name] },
    ])
  );

const TITLE_COUNT: Record<string, number> = {};
seasons.forEach(s => {
  if (s.champion) TITLE_COUNT[s.champion] = (TITLE_COUNT[s.champion] || 0) + 1;
});

function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
      padding: '8px 12px', fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <strong style={{ color: 'var(--text)' }}>IPL {label}</strong>
      <div style={{ color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>{payload[0].value.toLocaleString()} runs</div>
    </div>
  );
}

export default function Seasons() {
  const sorted = [...seasons].reverse();

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '56px 14px 88px' }}>
      <div style={{ paddingTop: 20, paddingBottom: 20 }}>
        <h1 style={{ fontSize: 'clamp(22px,4vw,36px)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
          Season History
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)' }}>18 seasons · 1,169 matches</p>
        <HistoricalBadge />
      </div>

      {/* Chart */}
      <div style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '16px 16px 10px', marginBottom: 20, background: 'var(--bg)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Total Runs per Season</div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasons} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="season" tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<Tip />} cursor={{ fill: 'var(--bg-muted)' }} />
              <Bar dataKey="totalRuns" radius={[3, 3, 0, 0]}>
                {seasons.map(s => <Cell key={s.season} fill={CHAMP_COLOR[s.champion] || '#d4d4d8'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          {Object.entries(CHAMP_COLOR).map(([team, color]) => (
            <div key={team} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-4)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
              {team.split(' ').slice(-1)[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Season cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map((s) => {
          const c = CHAMP_COLOR[s.champion] || '#6366f1';
          const champMeta = TEAM_META[s.champion];
          const runnerMeta = s.final ? TEAM_META[s.final.runnerUp] : null;
          return (
            <div key={s.season} style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg)' }}>

              {/* Season header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: `${c}10`, borderBottom: `1px solid ${c}30` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: c, letterSpacing: '-0.04em', lineHeight: 1 }}>IPL {s.season}</span>
                  {champMeta && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <TeamBadge short={champMeta.short} color={champMeta.color} size="xs" textColor={champMeta.textColor} />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Trophy size={11} weight="fill" color={c} />
                          <span style={{ fontSize: 13, fontWeight: 800, color: c }}>{s.champion}</span>
                        </div>
                        {s.final && (
                          <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 1 }}>Capt: {s.final.winnerCaptain}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, fontWeight: 600, background: `${c}20`, color: c, flexShrink: 0 }}>{s.totalMatches} matches</span>
              </div>

              {/* Final result block */}
              {s.final && (
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Final</div>

                  {/* Teams face-off */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {/* Winner */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                      {champMeta && <TeamBadge short={champMeta.short} color={champMeta.color} size="sm" textColor={champMeta.textColor} />}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{champMeta?.short || s.champion}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{s.final.winnerScore}</div>
                      </div>
                    </div>

                    {/* Result badge */}
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 700, background: c, color: c === '#F9CD05' ? '#000' : '#fff', whiteSpace: 'nowrap' }}>
                        {s.final.result}
                      </div>
                    </div>

                    {/* Runner-up */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: runnerMeta?.color || 'var(--text-3)' }}>{runnerMeta?.short || s.final.runnerUp}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)' }}>{s.final.runnerUpScore}</div>
                      </div>
                      {runnerMeta && <TeamBadge short={runnerMeta.short} color={runnerMeta.color} size="sm" textColor={runnerMeta.textColor} />}
                    </div>
                  </div>

                  {/* Final meta: venue + MOM + runner-up captain */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 11, color: 'var(--text-4)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} weight="fill" color="var(--text-4)" />
                      <span>{s.final.venue}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Medal size={11} weight="fill" color="#f59e0b" />
                      <span>MOM: <strong style={{ color: 'var(--text)' }}>{s.final.mom}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={11} weight="fill" color="var(--text-4)" />
                      <span>Runners-up capt: <strong style={{ color: 'var(--text)' }}>{s.final.runnerUpCaptain}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Season stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid var(--border)' }}>
                {[
                  { l: 'Runs', v: s.totalRuns.toLocaleString() },
                  { l: 'Wickets', v: s.totalWickets },
                  { l: 'Sixes', v: s.totalSixes },
                  { l: 'Fours', v: s.totalFours },
                ].map((st, i) => (
                  <div key={st.l} style={{ padding: '10px 8px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{st.v}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>{st.l}</div>
                  </div>
                ))}
              </div>

              {/* Cap winners */}
              {s.orangeCap.player && (
                <div style={{ padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Baseball size={14} weight="fill" color="var(--accent)" />
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-4)' }}>Orange Cap</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                        {s.orangeCap.player} <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{s.orangeCap.runs} runs</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Baseball size={14} weight="fill" color="var(--purple)" />
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-4)' }}>Purple Cap</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                        {s.purpleCap.player} <span style={{ color: 'var(--purple)', fontWeight: 800 }}>{s.purpleCap.wickets} wickets</span>
                      </div>
                    </div>
                  </div>
                  {s.mostPOM && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={13} weight="fill" color="#f59e0b" />
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-4)' }}>Most POM</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{s.mostPOM}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
