import { useState, useEffect } from 'react';
import { useIPL2026 } from '../hooks/useIPL2026';
import TeamBadge from '../components/TeamBadge';
import PageSEO from '../components/PageSEO';

import type { PointsTableEntry, MatchResult, Fixture } from '../types';
import { LOGO_CODE, TEAM_COLORS } from '../lib/teams';

const TAG_STYLE: Record<string, { bg: string; color: string }> = {
  'On Fire':        { bg: '#fff7ed', color: '#c2410c' },
  'Sensation':      { bg: '#f0fdf4', color: '#15803d' },
  'Crisis':         { bg: '#fef2f2', color: '#b91c1c' },
  'Breakout':       { bg: '#eff6ff', color: '#1d4ed8' },
  'Under Pressure': { bg: '#fef2f2', color: '#b91c1c' },
  'Historic':       { bg: '#f5f3ff', color: '#6d28d9' },
};

function FormPill({ r }: { r: string }) {
  return <span className={`form-pill ${r === 'W' ? 'form-w' : r === 'L' ? 'form-l' : 'form-n'}`}>{r}</span>;
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 12, paddingBottom: 10, borderBottom: '2px solid var(--accent)' }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-4)', margin: '2px 0 0', fontWeight: 400 }}>{sub}</p>}
    </div>
  );
}

// ── Points Table ──────────────────────────────────────────────────────────────
function PointsTable({ rows }: { rows: PointsTableEntry[] }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: 22 }} />
          <col />
          <col style={{ width: 24 }} />
          <col style={{ width: 24 }} />
          <col style={{ width: 24 }} />
          <col style={{ width: 50 }} />
          <col style={{ width: 26 }} />
          <col style={{ width: 64 }} />
        </colgroup>
        <thead>
          <tr style={{ background: '#f8f8f8', borderBottom: '1px solid var(--border)' }}>
            {['#', 'Team', 'P', 'W', 'L', 'NRR', 'Pts', 'Form'].map(h => (
              <th scope="col" key={h} style={{
                padding: '9px 3px', fontSize: 10, fontWeight: 700, color: 'var(--text-4)',
                textAlign: h === '#' || h === 'Team' ? 'left' : 'center',
                textTransform: 'uppercase', letterSpacing: '0.04em',
                paddingLeft: h === '#' ? 10 : 3,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.team}
              style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none', background: i < 4 ? `${row.color}04` : 'transparent' }}>
              <td style={{ padding: '10px 3px 10px 10px', fontWeight: 800, fontSize: 12, color: i < 4 ? row.color : 'var(--text-4)' }}>{row.rank}</td>
              <td style={{ padding: '10px 3px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TeamBadge short={row.short} color={row.color} size="xs"
                    textColor={row.short === 'CSK' || row.short === 'SRH' ? '#000' : '#fff'} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.short}</div>
                    {i < 4 && <div style={{ fontSize: 8, color: row.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>playoff</div>}
                  </div>
                </div>
              </td>
              <td style={{ padding: '10px 3px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>{row.played}</td>
              <td style={{ padding: '10px 3px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{row.won}</td>
              <td style={{ padding: '10px 3px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--red)' }}>{row.lost}</td>
              <td style={{ padding: '10px 3px', textAlign: 'center', fontSize: 10, fontFamily: 'monospace', color: row.nrr.startsWith('+') ? '#16a34a' : row.nrr.startsWith('-') ? 'var(--red)' : 'var(--text-3)' }}>{row.nrr}</td>
              <td style={{ padding: '10px 3px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: row.points > 0 ? 'var(--text)' : 'var(--text-4)' }}>{row.points}</td>
              <td style={{ padding: '10px 3px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  {row.form.slice(-3).map((f, fi) => <FormPill key={fi} r={f} />)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: '7px 10px', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-4)', background: '#f8f8f8', display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, fontWeight: 700, background: 'var(--accent-bg)', color: 'var(--accent)' }}>Q</span>
        Top 4 qualify for playoffs · Updated {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
      </div>
    </div>
  );
}

// ── Cap leaderboard ───────────────────────────────────────────────────────────
function CapList({ entries, statKey, color, icon }: { entries: any[]; statKey: 'runs' | 'wickets'; color: string; icon: string }) {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: '#f8f8f8', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{statKey === 'runs' ? 'Orange Cap' : 'Purple Cap'}</span>
      </div>
      {entries.slice(0, 5).map((e, i) => (
        <div key={e.player} style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
          background: i === 0 ? `${color}06` : 'var(--bg)',
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', background: i === 0 ? color : 'var(--bg-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: i === 0 ? '#fff' : 'var(--text-4)', flexShrink: 0,
          }}>{i + 1}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: i === 0 ? 700 : 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.player}</div>
            <div style={{ fontSize: 10, color: 'var(--text-4)' }}>{e.team} · {e.innings} inns</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: 17, fontWeight: 900, color, letterSpacing: '-0.02em' }}>{e[statKey]}</span>
            <span style={{ fontSize: 10, color: 'var(--text-4)', marginLeft: 2 }}>{statKey === 'runs' ? 'runs' : 'wkts'}</span>
            {statKey === 'runs' && e.sr != null && (
              <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>SR {e.sr}</div>
            )}
            {statKey === 'wickets' && e.economy != null && (
              <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>Econ {e.economy}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Match card ────────────────────────────────────────────────────────────────
function MatchCard({ m }: { m: MatchResult }) {
  const abandoned = m.result.toLowerCase().includes('abandon') || m.result.toLowerCase().includes('rain');
  const t1 = (m as any).t1Score;
  const t2 = (m as any).t2Score;
  const t1Short = LOGO_CODE[m.team1];
  const t2Short = LOGO_CODE[m.team2];
  const t1Color = TEAM_COLORS[m.team1] || 'var(--accent)';
  const t2Color = TEAM_COLORS[m.team2] || 'var(--accent)';
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
      <div style={{ padding: '8px 12px', background: '#f8f8f8', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 500 }}>
          Match {m.matchNo} · {new Date(m.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {m.venue.split(',')[0]}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: abandoned ? 'var(--text-3)' : 'var(--accent)' }}>
          {abandoned ? 'Abandoned' : 'Result'}
        </span>
      </div>
      <div style={{ padding: '12px' }}>
        {/* Team logos + names side by side */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {t1Short && <TeamBadge short={t1Short} color={t1Color} size="xs" textColor={t1Short === 'CSK' || t1Short === 'SRH' ? '#000' : '#fff'} />}
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t1Short || m.team1}</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 400 }}>vs</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t2Short || m.team2}</span>
            {t2Short && <TeamBadge short={t2Short} color={t2Color} size="xs" textColor={t2Short === 'CSK' || t2Short === 'SRH' ? '#000' : '#fff'} />}
          </div>
        </div>
        {!abandoned && t1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-3)' }}>{t1}</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-3)' }}>{t2}</span>
          </div>
        )}
        <div style={{ fontSize: 12, fontWeight: 700, color: abandoned ? 'var(--text-3)' : 'var(--accent)', paddingTop: 6, borderTop: '1px solid var(--border)' }}>
          {m.result}
        </div>
        {m.highlight && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5, lineHeight: 1.4 }}>{m.highlight}</div>}
      </div>
    </div>
  );
}

// ── Fixture card ──────────────────────────────────────────────────────────────
function FixtureCard({ f }: { f: Fixture }) {
  const today = new Date().toLocaleDateString('en-CA');
  const isToday = f.date === today;
  const t1Short = LOGO_CODE[f.team1];
  const t2Short = LOGO_CODE[f.team2];
  const t1Color = TEAM_COLORS[f.team1] || 'var(--accent)';
  const t2Color = TEAM_COLORS[f.team2] || 'var(--accent)';
  return (
    <div style={{ border: `1px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', background: isToday ? 'var(--accent-bg)' : 'var(--bg)' }}>
      <div style={{ padding: '7px 12px', background: isToday ? 'var(--accent)' : '#f8f8f8', borderBottom: `1px solid ${isToday ? 'transparent' : 'var(--border)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: isToday ? '#fff' : 'var(--text-4)' }}>
          {isToday ? '⚡ TODAY' : new Date(f.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: isToday ? '#fff' : 'var(--text-4)' }}>{f.time}</span>
      </div>
      <div style={{ padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {t1Short && <TeamBadge short={t1Short} color={t1Color} size="xs" textColor={t1Short === 'CSK' || t1Short === 'SRH' ? '#000' : '#fff'} />}
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t1Short || f.team1}</span>
          </div>
          <span style={{ color: 'var(--text-4)', fontWeight: 400, fontSize: 11 }}>vs</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t2Short || f.team2}</span>
            {t2Short && <TeamBadge short={t2Short} color={t2Color} size="xs" textColor={t2Short === 'CSK' || t2Short === 'SRH' ? '#000' : '#fff'} />}
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.venue}</div>
      </div>
    </div>
  );
}

// ── Today's Match Spotlight ───────────────────────────────────────────────────
function TodaySpotlight({ fixture }: { fixture: Fixture }) {
  const t1Short = LOGO_CODE[fixture.team1];
  const t2Short = LOGO_CODE[fixture.team2];
  const t1Color = TEAM_COLORS[fixture.team1] || 'var(--accent)';
  const t2Color = TEAM_COLORS[fixture.team2] || 'var(--accent)';
  return (
    <div style={{
      border: '2px solid var(--accent)', borderRadius: 12, overflow: 'hidden',
      background: 'var(--accent-bg)', marginBottom: 16,
    }}>
      <div style={{ padding: '8px 14px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>⚡ Next Match</span>
        <span style={{ fontSize: 11, color: '#fff', opacity: 0.85 }}>{fixture.time}</span>
      </div>
      <div style={{ padding: '18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {t1Short && <TeamBadge short={t1Short} color={t1Color} size="md" textColor={t1Short === 'CSK' || t1Short === 'SRH' ? '#000' : '#fff'} />}
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{t1Short || fixture.team1}</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)', letterSpacing: '-0.04em' }}>VS</div>
            <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>Match {fixture.matchNo}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {t2Short && <TeamBadge short={t2Short} color={t2Color} size="md" textColor={t2Short === 'CSK' || t2Short === 'SRH' ? '#000' : '#fff'} />}
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>{t2Short || fixture.team2}</span>
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-4)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fixture.venue}</div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const { data, loading, error } = useIPL2026();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => { const fn = () => setIsMobile(window.innerWidth < 640); window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ fontSize: 13, color: 'var(--text-4)', fontWeight: 500 }}>Loading live data…</div>
    </div>
  );
  if (error || !data) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 8 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Could not load live data</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{error || 'Unknown error'}</div>
      <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 20px', fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Retry</button>
    </div>
  );
  const { meta, pointsTable, recentResults, upcomingFixtures, orangeCap, purpleCap, storylines, auctionHighlights, captains } = data;

  // Check for today's match
  const today = new Date().toLocaleDateString('en-CA');
  const todayFixture = upcomingFixtures.find(f => f.date === today);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '56px 0 88px' : '60px 24px 48px' }}>
      <PageSEO
        title="IPL 2026 Live"
        description={`Live IPL 2026 points table, recent results, Orange Cap, Purple Cap and upcoming fixtures. Match ${meta.matchesPlayed} of ${meta.totalMatches}.`}
        path="/"
      />

      {/* ── Matchday Hero Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #09090b 0%, #1a0a00 50%, #09090b 100%)',
        padding: isMobile ? '24px 16px 20px' : '32px 32px 28px',
        marginBottom: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: '#71717a' }}>Match {meta.matchesPlayed} of {meta.totalMatches}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 32 : 52, fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1, marginBottom: 8 }}>
              TATA IPL <span style={{ color: '#f97316' }}>2026</span>
            </h1>
            <p style={{ fontSize: 13, color: '#a1a1aa', margin: 0 }}>
              Edition 19 · Defending champions: <span style={{ color: '#f0f0f0', fontWeight: 600 }}>{meta.defendingChampion}</span>
            </p>
          </div>

          {/* Season progress ring */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: 72, height: 72 }}>
              <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r="30" fill="none" stroke="#27272a" strokeWidth="6" />
                <circle cx="36" cy="36" r="30" fill="none" stroke="#f97316" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 30 * meta.matchesPlayed / meta.totalMatches} ${2 * Math.PI * 30}`}
                  strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{meta.matchesPlayed}</span>
                <span style={{ fontSize: 9, color: '#71717a', fontWeight: 500 }}>matches</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: '#52525b', marginTop: 4 }}>{meta.totalMatches - meta.matchesPlayed} left</div>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ padding: isMobile ? '0 14px' : '0' }}>

        {/* ── Points Table ── */}
        <div style={{ paddingTop: 24, marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, alignItems: 'start' }}>
            <div>
              <SectionHeader title="Points Table" sub="IPL 2026 standings" />
              <PointsTable rows={pointsTable} />
            </div>
          </div>
        </div>

        {/* ── Cap Leaders ── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHeader title="Cap Leaders" sub="Season-to-date" />
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            <CapList entries={orangeCap} statKey="runs" color="var(--accent)" icon="🟠" />
            <CapList entries={purpleCap} statKey="wickets" color="var(--purple)" icon="🟣" />
          </div>
        </div>

        {/* ── Results ── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHeader title="Recent Results" sub={`Last ${Math.min(5, recentResults.length)} matches`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...recentResults].reverse().slice(0, 5).map(m => <MatchCard key={m.matchNo} m={m} />)}
          </div>
        </div>

        {/* ── Fixtures ── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHeader title="Upcoming Fixtures" sub="Next matches" />
          {todayFixture && <TodaySpotlight fixture={todayFixture} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcomingFixtures.filter(f => f.matchNo !== todayFixture?.matchNo).slice(0, 6).map(f => <FixtureCard key={f.matchNo} f={f} />)}
          </div>
        </div>

        {/* ── Storylines ── */}
        <div style={{ marginBottom: 28 }}>
          <SectionHeader title="2026 Storylines" sub="What's happening right now" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {storylines.map(s => {
              const ts = TAG_STYLE[s.tag] || { bg: 'var(--bg-muted)', color: 'var(--text-3)' };
              return (
                <div key={s.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', background: 'var(--bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999, flexShrink: 0, background: ts.bg, color: ts.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.tag}</span>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, margin: '0 0 6px' }}>{s.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.65, margin: 0 }}>{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Captains grid ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, borderBottom: '2px solid var(--accent)', paddingBottom: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', margin: 0 }}>2026 Captains</h2>
              <p style={{ fontSize: 11, color: 'var(--text-4)', margin: '2px 0 0' }}>First-ever all-Indian captains in IPL history</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: 10 }}>
            {pointsTable.map(t => (
              <div key={t.team} style={{ border: `1px solid ${t.color}30`, borderRadius: 10, padding: '12px 10px', textAlign: 'center', background: `${t.color}05` }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <TeamBadge short={t.short} color={t.color} size="md" textColor={t.short === 'CSK' || t.short === 'SRH' ? '#000' : '#fff'} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: t.color, marginBottom: 3, letterSpacing: '0.02em' }}>{t.short}</div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.4, fontWeight: 500 }}>{captains[t.short] || '—'}</div>

              </div>
            ))}
          </div>
        </div>

        {/* ── Auction ── */}
        <div>
          <SectionHeader title="Mega Auction Highlights" sub="Key buys from the 2025 mega auction" />
          <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--bg)' }}>
                  {auctionHighlights.map((a, i) => {
                    const teamColor = pointsTable.find(t => t.short === a.team)?.color || '#888';
                    return (
                      <div key={a.player} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 14px', borderBottom: i < auctionHighlights.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        {/* Rank */}
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)', flexShrink: 0, minWidth: 18, paddingTop: 1 }}>#{i+1}</span>
                        {/* Player + note */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{a.player}</div>
                          {a.note ? <div style={{ fontSize: 11, color: 'var(--text-4)', lineHeight: 1.4 }}>{a.note}</div> : null}
                        </div>
                        {/* Team + price */}
                        <div style={{ flexShrink: 0, textAlign: 'right' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${teamColor}18`, color: teamColor, display: 'inline-block', marginBottom: 3 }}>{a.team}</span>
                          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>{a.price}</div>
                        </div>
                      </div>
                    );
                  })}
          </div>
        </div>

      </div>
    </div>
  );
}
