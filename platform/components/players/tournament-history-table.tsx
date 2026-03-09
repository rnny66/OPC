import Link from 'next/link'

const styles = {
  section: {
    marginBottom: '2rem',
  } as React.CSSProperties,
  title: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: '1rem',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.875rem',
  } as React.CSSProperties,
  th: {
    padding: '0.75rem 0.5rem',
    textAlign: 'left' as const,
    color: 'var(--color-text-secondary)',
    fontWeight: 500,
    borderBottom: '1px solid var(--color-border)',
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  td: {
    padding: '0.75rem 0.5rem',
    borderBottom: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  } as React.CSSProperties,
  link: {
    color: 'var(--color-brand)',
    textDecoration: 'none',
  } as React.CSSProperties,
  empty: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
}

type ResultRow = {
  id: string
  placement: number
  points_awarded: number
  tournaments: {
    id: string
    name: string
    country: string | null
    start_date: string
  }
}

export function TournamentHistoryTable({ results }: { results: ResultRow[] }) {
  return (
    <div style={styles.section}>
      <h2 style={styles.title}>Tournament History</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Tournament</th>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Country</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Place</th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Points</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan={5} style={styles.empty}>
                No tournament history yet.
              </td>
            </tr>
          ) : (
            results.map(row => (
              <tr key={row.id}>
                <td style={styles.td}>
                  <Link href={`/tournaments/${row.tournaments.id}`} style={styles.link}>
                    {row.tournaments.name}
                  </Link>
                </td>
                <td style={styles.td}>
                  {new Date(row.tournaments.start_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
                <td style={styles.td}>{row.tournaments.country || '—'}</td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600 }}>
                  {row.placement}
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  {row.points_awarded.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
