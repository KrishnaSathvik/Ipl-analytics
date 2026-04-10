import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LOGO_CODE, TEAM_COLORS, ACTIVE_TEAMS, LOGO_URL, getTeamLogo } from '../lib/teams';

// ── Shared constants tests ─────────────────────────────────────────────────

describe('Shared team constants', () => {
  it('LOGO_CODE has all 10 active teams', () => {
    for (const team of ACTIVE_TEAMS) {
      expect(LOGO_CODE[team]).toBeDefined();
    }
  });

  it('TEAM_COLORS has all 10 active teams', () => {
    for (const team of ACTIVE_TEAMS) {
      expect(TEAM_COLORS[team]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('LOGO_URL has entries for all active team codes', () => {
    const activeCodes = ACTIVE_TEAMS.map(t => LOGO_CODE[t]);
    for (const code of activeCodes) {
      expect(LOGO_URL[code]).toBeDefined();
      expect(LOGO_URL[code]).toContain('.png');
    }
  });

  it('getTeamLogo returns logo path for known teams', () => {
    expect(getTeamLogo(['Mumbai Indians'])).toContain('MI.png');
    expect(getTeamLogo(['Chennai Super Kings'])).toContain('CSK.png');
  });

  it('getTeamLogo returns empty string for unknown teams', () => {
    expect(getTeamLogo(['Unknown Team FC'])).toBe('');
  });

  it('handles historical team name aliases', () => {
    expect(LOGO_CODE['Delhi Daredevils']).toBe('DC');
    expect(LOGO_CODE['Kings XI Punjab']).toBe('PBKS');
    expect(LOGO_CODE['Royal Challengers Bangalore']).toBe('RCB');
    expect(TEAM_COLORS['Delhi Daredevils']).toBe(TEAM_COLORS['Delhi Capitals']);
  });
});

// ── Component smoke tests ──────────────────────────────────────────────────

describe('ErrorBoundary', () => {
  it('renders children when no error', async () => {
    const { default: ErrorBoundary } = await import('../components/ErrorBoundary');
    render(
      <ErrorBoundary>
        <div>content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', async () => {
    const { default: ErrorBoundary } = await import('../components/ErrorBoundary');
    const ThrowError = () => { throw new Error('test'); };

    // Suppress console.error for expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    spy.mockRestore();

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });
});

describe('TeamBadge', () => {
  it('renders without crashing', async () => {
    const { default: TeamBadge } = await import('../components/TeamBadge');
    const { container } = render(<TeamBadge short="CSK" color="#F9CD05" />);
    expect(container.firstChild).toBeTruthy();
  });
});

// ── App smoke test ─────────────────────────────────────────────────────────

describe('StatCard', () => {
  it('renders label and value', async () => {
    const { default: StatCard } = await import('../components/StatCard');
    render(<StatCard label="Runs" value="5000" />);
    expect(screen.getByText('Runs')).toBeInTheDocument();
    expect(screen.getByText('5000')).toBeInTheDocument();
  });
});
