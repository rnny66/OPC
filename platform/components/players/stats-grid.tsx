const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  card: {
    padding: '1.25rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  value: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    display: 'block',
  } as React.CSSProperties,
  label: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    marginTop: '0.25rem',
    display: 'block',
  } as React.CSSProperties,
}

type PlayerStats = {
  total_points: number
  tournament_count: number
  win_count: number
  top3_count: number
  avg_finish: number | null
  best_finish: number | null
}

export function StatsGrid({ stats }: { stats: PlayerStats }) {
  const items = [
    { label: 'Total Points', value: stats.total_points.toLocaleString() },
    { label: 'Tournaments', value: stats.tournament_count },
    { label: 'Wins', value: stats.win_count },
    { label: 'Top 3', value: stats.top3_count },
    { label: 'Avg Finish', value: stats.avg_finish ? stats.avg_finish.toFixed(1) : '—' },
    { label: 'Best Finish', value: stats.best_finish ?? '—' },
  ]

  return (
    <div className="stats-grid" style={styles.grid}>
      {items.map(item => (
        <div key={item.label} style={styles.card}>
          <span style={styles.value}>{item.value}</span>
          <span style={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
