interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  small?: boolean;
}

export default function StatCard({ label, value, sub, accent, small }: StatCardProps) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-1"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        {label}
      </span>
      <span className={`stat-number leading-none ${small ? 'text-2xl' : 'text-3xl md:text-4xl'}`}
        style={{ color: accent || 'var(--accent)' }}>
        {value}
      </span>
      {sub && <span className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>{sub}</span>}
    </div>
  );
}
