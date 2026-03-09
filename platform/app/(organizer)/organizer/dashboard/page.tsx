import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Organizer Dashboard — OPC Europe' }

const styles = {
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
  } as React.CSSProperties,
  createButton: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 600,
  } as React.CSSProperties,
  stats: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  } as React.CSSProperties,
  stat: {
    flex: 1,
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
  } as React.CSSProperties,
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
  } as React.CSSProperties,
  section: {
    marginBottom: '2rem',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: 'var(--color-text-primary)',
  } as React.CSSProperties,
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  } as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    padding: '0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    borderBottom: '1px solid var(--color-border)',
  } as React.CSSProperties,
  td: {
    padding: '0.75rem',
    fontSize: '0.875rem',
    color: 'var(--color-text-primary)',
    borderBottom: '1px solid var(--color-border)',
  } as React.CSSProperties,
  link: {
    color: 'var(--color-brand)',
    textDecoration: 'none',
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    gap: '1rem',
  } as React.CSSProperties,
  empty: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    padding: '1.5rem 0',
  } as React.CSSProperties,
}

export default async function OrganizerDashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, tournament_registrations(count)')
    .eq('organizer_id', user.id)
    .order('start_date', { ascending: true })

  const now = new Date().toISOString().split('T')[0]
  const totalTournaments = tournaments?.length || 0
  const totalRegistrations = tournaments?.reduce(
    (sum, t) => sum + (t.tournament_registrations?.[0]?.count || 0),
    0
  ) || 0
  const upcomingCount = tournaments?.filter(t => t.start_date >= now).length || 0

  return (
    <div>
      <div style={styles.titleRow}>
        <h2 style={styles.title}>Organizer Dashboard</h2>
        <Link href="/organizer/tournaments/new" style={styles.createButton}>
          Create Tournament
        </Link>
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Total Tournaments</div>
          <div style={styles.statValue}>{totalTournaments}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Total Registrations</div>
          <div style={styles.statValue}>{totalRegistrations}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Upcoming</div>
          <div style={styles.statValue}>{upcomingCount}</div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Your Tournaments</h3>
        {totalTournaments === 0 ? (
          <p style={styles.empty}>
            No tournaments yet.{' '}
            <Link href="/organizer/tournaments/new" style={styles.link}>Create your first tournament</Link>
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Registrations</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments?.map(tournament => (
                <tr key={tournament.id}>
                  <td style={styles.td}>
                    <Link href={`/organizer/tournaments/${tournament.id}`} style={styles.link}>
                      {tournament.name}
                    </Link>
                  </td>
                  <td style={styles.td}>{tournament.start_date}</td>
                  <td style={styles.td}>{tournament.city}</td>
                  <td style={styles.td}>{tournament.status}</td>
                  <td style={styles.td}>{tournament.tournament_registrations?.[0]?.count || 0}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <Link href={`/organizer/tournaments/${tournament.id}`} style={styles.link}>
                        Edit
                      </Link>
                      <Link href={`/organizer/tournaments/${tournament.id}/registrations`} style={styles.link}>
                        Registrations
                      </Link>
                      <Link href={`/organizer/tournaments/${tournament.id}/results`} style={styles.link}>
                        Results
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
