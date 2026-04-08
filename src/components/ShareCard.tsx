import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { ArrowUpRight, Copy, Check } from '@phosphor-icons/react';

export interface ShareCardProps {
  // Core identity
  playerName?: string;
  teamShort?: string;
  teamColor?: string;
  teamLogo?: string;
  // Primary stat
  statLabel: string;
  statValue: string | number;
  statUnit?: string;
  // Supporting stats (up to 4)
  stats?: { label: string; value: string | number }[];
  // Context line
  context?: string;
  // Card type colours theme
  accent?: string;
}

// ── The card that gets screenshotted ─────────────────────────────────────────
function Card({ playerName, teamShort, teamColor, teamLogo, statLabel, statValue, statUnit, stats, context, accent }: ShareCardProps) {
  const a = accent || teamColor || '#f97316';

  return (
    <div style={{
      width: 360,
      background: '#ffffff',
      borderRadius: 16,
      overflow: 'hidden',
      fontFamily: '"Geist", system-ui, -apple-system, sans-serif',
      border: '1px solid #e4e4e7',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    }}>
      {/* Top accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${a}, ${a}99)` }} />

      {/* Header row */}
      <div style={{
        padding: '16px 20px 12px',
        background: `linear-gradient(135deg, ${a}0A 0%, #ffffff 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #f4f4f5',
      }}>
        <div>
          {playerName && (
            <div style={{ fontSize: 18, fontWeight: 800, color: '#09090b', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {playerName}
            </div>
          )}
          {teamShort && (
            <div style={{ fontSize: 12, fontWeight: 600, color: a, marginTop: 3, letterSpacing: '0.02em' }}>
              {teamShort}
            </div>
          )}
        </div>
        {teamLogo && (
          <img src={teamLogo} alt={teamShort || ''}
            style={{ width: 48, height: 48, objectFit: 'contain',
              background: '#fff', borderRadius: 10, padding: 4, border: '1px solid #e4e4e7' }} />
        )}
      </div>

      {/* Primary stat */}
      <div style={{ padding: '14px 20px 10px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          {statLabel}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 46, fontWeight: 900, color: a, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {typeof statValue === 'number' ? statValue.toLocaleString() : statValue}
          </span>
          {statUnit && (
            <span style={{ fontSize: 16, fontWeight: 600, color: '#71717a' }}>{statUnit}</span>
          )}
        </div>
      </div>

      {/* Supporting stats grid */}
      {stats && stats.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
          borderTop: '1px solid #f4f4f5', borderBottom: '1px solid #f4f4f5',
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              padding: '10px 0',
              textAlign: 'center',
              borderRight: i < stats.length - 1 ? '1px solid #f4f4f5' : 'none',
            }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#09090b', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Context tags row */}
      {context && (
        <div style={{ padding: '8px 20px', display: 'flex', flexWrap: 'wrap', gap: 6, borderTop: '1px solid #f4f4f5' }}>
          {context.split('·').map((part, i) => (
            <span key={i} style={{
              fontSize: 11, fontWeight: 500, color: '#52525b',
              background: '#f4f4f5', borderRadius: 4,
              padding: '2px 7px', whiteSpace: 'nowrap',
            }}>{part.trim()}</span>
          ))}
        </div>
      )}

      {/* Branding footer */}
      <div style={{
        padding: '8px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid #f4f4f5',
        background: '#fafafa',
      }}>
        <span style={{ fontSize: 10, color: '#a1a1aa', letterSpacing: '0.04em', textTransform: 'uppercase' }}>IPL Analytics Hub</span>
        <span style={{ fontSize: 10, color: '#a1a1aa' }}>2026</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ShareCard(props: ShareCardProps) {
  const [open, setOpen]       = useState(false);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied]   = useState(false);
  const cardRef               = useRef<HTMLDivElement>(null);

  async function handleCopy() {
    if (!cardRef.current) return;
    setCopying(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true,
      });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        // Try native share on mobile
        if (navigator.share && navigator.canShare && typeof navigator.canShare === 'function') {
          const file = new File([blob], 'ipl-stat.png', { type: 'image/png' });
          try {
            await navigator.share({ files: [file], title: `${props.playerName || props.statLabel} — IPL Stats` });
            setCopied(true);
            setTimeout(() => { setCopied(false); setCopying(false); }, 2500);
            return;
          } catch {}
        }
        // Clipboard fallback
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setCopied(true);
          setTimeout(() => { setCopied(false); }, 2500);
        } catch {
          // Download fallback
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'ipl-stat.png'; a.click();
          URL.revokeObjectURL(url);
        }
        setCopying(false);
      }, 'image/png');
    } catch (e) {
      console.error(e);
      setCopying(false);
    }
  }

  return (
    <>
      {/* Trigger */}
      <button onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
          border: '1px solid var(--border)', background: 'var(--bg)',
          color: 'var(--text-3)', cursor: 'pointer', transition: 'all .15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = props.accent || props.teamColor || 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = props.accent || props.teamColor || 'var(--accent)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-3)'; }}>
        <ArrowUpRight size={12} weight="bold" /> Share
      </button>

      {/* Modal */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, flexDirection: 'column', gap: 16,
        }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%', maxWidth: 380 }}>

            {/* Preview label */}
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Preview
            </div>

            {/* Card */}
            <div ref={cardRef} style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
              <Card {...props} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button onClick={handleCopy} disabled={copying}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: props.accent || props.teamColor || '#f97316',
                  color: '#fff', border: 'none', cursor: copying ? 'wait' : 'pointer',
                  opacity: copying ? 0.8 : 1, transition: 'all .15s',
                }}>
                {copying ? (
                  <>Generating…</>
                ) : copied ? (
                  <><Check size={16} weight="bold" /> Copied!</>
                ) : (
                  <><Copy size={16} weight="bold" /> Copy Image</>
                )}
              </button>
              <button onClick={() => setOpen(false)}
                style={{
                  padding: '12px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600,
                  background: 'rgba(255,255,255,0.12)', color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer',
                }}>
                Close
              </button>
            </div>

            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
              Tap Copy Image · paste to WhatsApp, Twitter, anywhere
            </div>
          </div>
        </div>
      )}
    </>
  );
}
