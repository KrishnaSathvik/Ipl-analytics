export default function HistoricalBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: '#fef3c7', color: '#92400e',
      fontSize: 11, fontWeight: 600,
      marginTop: 10,
      border: '1px solid #fde68a',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
      Historical data · 2008–2025 · not IPL 2026 live
    </div>
  );
}
