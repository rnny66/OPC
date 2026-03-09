import { TournamentCard } from './tournament-card'
import type { Tournament } from '@/test-utils/factories'

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  } as React.CSSProperties,
  empty: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
  } as React.CSSProperties,
}

export function TournamentGrid({
  tournaments,
  registeredIds = [],
}: {
  tournaments: Tournament[]
  registeredIds?: string[]
}) {
  if (tournaments.length === 0) {
    return <p style={styles.empty}>No tournaments found matching your filters.</p>
  }
  return (
    <div style={styles.grid}>
      {tournaments.map(t => (
        <TournamentCard
          key={t.id}
          tournament={t}
          isRegistered={registeredIds.includes(t.id)}
        />
      ))}
    </div>
  )
}
