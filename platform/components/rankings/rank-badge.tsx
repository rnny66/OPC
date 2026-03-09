const styles = {
  wrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--color-text-primary)',
  } as React.CSSProperties,
  up: {
    color: '#22c55e',
    fontSize: '0.75rem',
  } as React.CSSProperties,
  down: {
    color: '#ef4444',
    fontSize: '0.75rem',
  } as React.CSSProperties,
  same: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.75rem',
  } as React.CSSProperties,
}

export function RankBadge({
  currentRank,
  previousRank,
}: {
  currentRank: number
  previousRank: number | null
}) {
  const improved = previousRank !== null && currentRank < previousRank
  const dropped = previousRank !== null && currentRank > previousRank

  return (
    <span style={styles.wrapper}>
      <span>{currentRank}</span>
      {improved ? (
        <span style={styles.up} aria-label="Rank improved">▲</span>
      ) : dropped ? (
        <span style={styles.down} aria-label="Rank dropped">▼</span>
      ) : (
        <span style={styles.same} aria-label="Rank unchanged">—</span>
      )}
    </span>
  )
}
