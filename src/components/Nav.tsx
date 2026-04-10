import { useState } from 'react';
import type { Page } from '../types';
import {
  Cricket, Shield, User, CalendarBlank, Trophy,
  ChartBar, MagnifyingGlass, DotsThree, X,
} from '@phosphor-icons/react';

const ALL_PAGES: { id: Page; label: string; Icon: React.ElementType }[] = [
  { id: 'home',      label: 'IPL 2026',   Icon: Cricket },
  { id: 'teams',     label: 'Teams',      Icon: Shield },
  { id: 'players',   label: 'Players',    Icon: User },
  { id: 'seasons',   label: 'Seasons',    Icon: CalendarBlank },
  { id: 'records',   label: 'Records',    Icon: Trophy },
  { id: 'analytics', label: 'Analytics',  Icon: ChartBar },
  { id: 'deepdives', label: 'Deep Dives', Icon: MagnifyingGlass },
];

const PRIMARY: Page[] = ['home', 'teams', 'players', 'analytics', 'deepdives'];
const MORE: Page[]    = ['seasons', 'records'];

export default function Nav({ current, onChange }: { current: Page; onChange: (p: Page) => void }) {
  const [showMore, setShowMore] = useState(false);
  const isMoreActive = MORE.includes(current);

  return (
    <>
      {/* ── Desktop top nav ─────────────────────────────────────────────── */}
      <nav aria-label="Main navigation" className="hidden md:flex fixed top-0 inset-x-0 z-50 h-12 items-center px-5 gap-0.5"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>

        <button onClick={() => onChange('home')} className="flex items-center gap-2 mr-4 flex-shrink-0" aria-label="IPL Hub home">
          <Cricket size={18} weight="fill" color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', letterSpacing: '-0.02em' }}>IPL Hub</span>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, fontWeight: 700,
            background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>2026</span>
        </button>

        {ALL_PAGES.map(item => (
          <button key={item.id} onClick={() => onChange(item.id)}
            aria-current={current === item.id ? 'page' : undefined}
            style={{
              padding: '4px 11px', borderRadius: 6, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
              fontWeight: current === item.id ? 600 : 400, border: 'none', transition: 'all 0.15s',
              background: current === item.id ? 'var(--bg-muted)' : 'transparent',
              color: current === item.id ? 'var(--text)' : 'var(--text-3)',
            }}>
            {item.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <span className="live-dot" />
          <span style={{ fontSize: 12, fontWeight: 500, color: '#16a34a', whiteSpace: 'nowrap' }}>Live Season</span>
        </div>
      </nav>

      {/* ── Mobile ─────────────────────────────────────────────────────── */}
      <>
        {showMore && (
          <>
            <div onClick={() => setShowMore(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 48, background: 'rgba(0,0,0,0.15)' }} />
            <div style={{
              position: 'fixed', bottom: 56, left: 0, right: 0, zIndex: 49,
              background: 'var(--bg)', borderTop: '1px solid var(--border)',
              borderRadius: '12px 12px 0 0', padding: '12px 16px 8px',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                More Pages
              </div>
              {MORE.map(id => {
                const item = ALL_PAGES.find(p => p.id === id)!;
                return (
                  <button key={id} onClick={() => { onChange(id); setShowMore(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', width: '100%',
                      borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: current === id ? 'var(--bg-muted)' : 'transparent',
                      color: current === id ? 'var(--text)' : 'var(--text-2)',
                      fontWeight: current === id ? 600 : 400, fontSize: 14,
                    }}>
                    <item.Icon size={20} weight={current === id ? 'fill' : 'regular'} color={current === id ? 'var(--accent)' : 'var(--text-3)'} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 inset-x-0 z-50"
          style={{
            background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
            borderTop: '1px solid var(--border)',
          }}>
          <div style={{ display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {PRIMARY.map(id => {
              const item = ALL_PAGES.find(p => p.id === id)!;
              const active = current === id;
              return (
                <button key={id} onClick={() => { onChange(id); setShowMore(false); }}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', padding: '10px 0 8px', gap: 3,
                    border: 'none', background: 'transparent', cursor: 'pointer', minHeight: 52,
                    color: active ? 'var(--accent)' : 'var(--text-3)',
                    WebkitTapHighlightColor: 'transparent',
                  }}>
                  <item.Icon size={20} weight={active ? 'fill' : 'regular'} />
                  <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, whiteSpace: 'nowrap', lineHeight: 1 }}>
                    {item.label === 'IPL 2026' ? '2026' : item.label === 'Deep Dives' ? 'Dives' : item.label}
                  </span>
                </button>
              );
            })}

            <button onClick={() => setShowMore(v => !v)}
              aria-label={showMore ? 'Close more pages menu' : 'More pages'}
              aria-expanded={showMore}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '10px 0 8px', gap: 3,
                border: 'none', background: 'transparent', cursor: 'pointer', minHeight: 52,
                color: isMoreActive || showMore ? 'var(--accent)' : 'var(--text-3)',
                WebkitTapHighlightColor: 'transparent',
              }}>
              {showMore ? <X size={20} weight="bold" /> : <DotsThree size={20} weight="bold" />}
              <span style={{ fontSize: 9, fontWeight: isMoreActive || showMore ? 700 : 400, lineHeight: 1 }}>More</span>
            </button>
          </div>
        </nav>
      </>
    </>
  );
}
