import Link from 'next/link'
import type { Tournament } from '@/test-utils/factories'

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  const startStr = s.toLocaleDateString('en-US', opts)
  const endStr = e.toLocaleDateString('en-US', { ...opts, year: 'numeric' })
  return `${startStr} \u2013 ${endStr}`
}

function formatEntryFee(fee: number): string {
  if (fee === 0) return 'Free entry'
  return `\u20AC${fee / 100} buy-in`
}

const styles = {
  card: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    transition: 'border-color 0.2s ease',
  } as React.CSSProperties,
  body: {
    padding: '1rem',
  } as React.CSSProperties,
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.375rem',
  } as React.CSSProperties,
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  link: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  } as React.CSSProperties,
}

export function TournamentCard({
  tournament,
  isRegistered = false,
}: {
  tournament: Tournament
  isRegistered?: boolean
}) {
  return (
    <Link href={`/tournaments/${tournament.id}`} style={styles.link}>
      <div style={styles.card}>
        <div style={styles.body}>
          {isRegistered && <span style={styles.badge}>Registered</span>}
          <h3 style={styles.title}>{tournament.name}</h3>
          <div style={styles.row}>
            <span>{tournament.club_name}, {tournament.city}</span>
          </div>
          <div style={styles.row}>
            <span>{formatDateRange(tournament.start_date, tournament.end_date)}</span>
          </div>
          <div style={styles.row}>
            <span>{formatEntryFee(tournament.entry_fee)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
