import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Cricket, Shield, User, CalendarBlank, Trophy,
  ChartBar, MagnifyingGlass, DotsThree, X,
} from '@phosphor-icons/react';

const LOGO_SRC = '/logo.png';

type PageId = 'home' | 'teams' | 'players' | 'seasons' | 'records' | 'analytics' | 'deepdives';

const ROUTES: Record<PageId, string> = {
  home:      '/',
  teams:     '/teams',
  players:   '/players',
  seasons:   '/seasons',
  records:   '/records',
  analytics: '/analytics',
  deepdives: '/deep-dives',
};

const ALL_PAGES: { id: PageId; label: string; Icon: React.ElementType }[] = [
  { id: 'home',      label: 'Home',       Icon: Cricket },
  { id: 'teams',     label: 'Teams',      Icon: Shield },
  { id: 'players',   label: 'Players',    Icon: User },
  { id: 'seasons',   label: 'Seasons',    Icon: CalendarBlank },
  { id: 'records',   label: 'Records',    Icon: Trophy },
  { id: 'analytics', label: 'Analytics',  Icon: ChartBar },
  { id: 'deepdives', label: 'Deep Dives', Icon: MagnifyingGlass },
];

const PRIMARY: PageId[] = ['home', 'teams', 'players', 'analytics', 'deepdives'];
const MORE: PageId[]    = ['seasons', 'records'];

function currentPage(pathname: string): PageId {
  for (const [id, path] of Object.entries(ROUTES)) {
    if (path === '/' ? pathname === '/' : pathname.startsWith(path)) return id as PageId;
  }
  return 'home';
}

export default function Nav() {
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const current = currentPage(location.pathname);
  const isMoreActive = MORE.includes(current);

  return (
    <>
      {/* ── Desktop top nav ─────────────────────────────────────────────── */}
      <nav aria-label="Main navigation" className="hidden md:flex fixed top-0 inset-x-0 z-50 h-12 items-center justify-center px-5"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>

        <Link to="/" className="absolute left-5 flex items-center gap-2" aria-label="IPL Analytics home">
          <img src={LOGO_SRC} alt="" width={32} height={32} style={{ display: 'block', borderRadius: 6 }} />
          <span className="hidden lg:inline" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            IPL Analytics
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          {ALL_PAGES.map(item => (
            <Link key={item.id} to={ROUTES[item.id]}
              aria-current={current === item.id ? 'page' : undefined}
              style={{
                padding: '4px 11px', borderRadius: 6, fontSize: 13, whiteSpace: 'nowrap',
                textDecoration: 'none',
                fontWeight: current === item.id ? 600 : 400, transition: 'all 0.15s',
                background: current === item.id ? 'var(--bg-muted)' : 'transparent',
                color: current === item.id ? 'var(--text)' : 'var(--text-3)',
              }}>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Mobile top header ───────────────────────────────────────────── */}
      <header aria-label="Site header" className="md:hidden fixed top-0 inset-x-0 z-50 h-12 flex items-center px-4"
        style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" aria-label="IPL Analytics home" className="flex items-center gap-2">
          <img src={LOGO_SRC} alt="" width={28} height={28} style={{ display: 'block', borderRadius: 6 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            IPL Analytics
          </span>
        </Link>
      </header>

      {/* ── Mobile bottom nav ──────────────────────────────────────────── */}
      <>
        {showMore && (
          <>
            <div onClick={() => setShowMore(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 48, background: 'rgba(0,0,0,0.15)' }} />
            <div style={{
              position: 'fixed', bottom: 'calc(56px + env(safe-area-inset-bottom))', left: 0, right: 0, zIndex: 49,
              background: 'var(--bg)', borderTop: '1px solid var(--border)',
              borderRadius: '12px 12px 0 0', padding: '12px 16px 12px',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                More Pages
              </div>
              {MORE.map(id => {
                const item = ALL_PAGES.find(p => p.id === id)!;
                return (
                  <button key={id} onClick={() => { navigate(ROUTES[id]); setShowMore(false); }}
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
                <button key={id} onClick={() => { navigate(ROUTES[id]); setShowMore(false); }}
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
                    {item.label === 'Deep Dives' ? 'Dives' : item.label}
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
