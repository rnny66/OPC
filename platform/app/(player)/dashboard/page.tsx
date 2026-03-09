import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CancelRegistrationButton } from '@/components/dashboard/cancel-registration-button'
import { VerificationStatus } from '@/components/auth/verification-status'

export const metadata = { title: 'Dashboard — OPC Europe' }

const styles = {
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
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
  empty: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    padding: '1.5rem 0',
  } as React.CSSProperties,
}

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('identity_verified, identity_verified_at')
    .eq('id', user.id)
    .single()

  // Fetch registrations with tournament data
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, tournaments(*)')
    .eq('player_id', user.id)
    .neq('status', 'cancelled')
    .order('registered_at', { ascending: false })

  const now = new Date().toISOString().split('T')[0]
  const upcoming = registrations?.filter(r => r.tournaments?.start_date >= now) || []
  const past = registrations?.filter(r => r.tournaments?.start_date < now) || []

  return (
    <div>
      <h2 style={styles.title}>Dashboard</h2>

      {!profile?.identity_verified && (
        <VerificationStatus
          isVerified={false}
          verifiedAt={null}
        />
      )}

      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Total Registrations</div>
          <div style={styles.statValue}>{registrations?.length || 0}</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statLabel}>Upcoming</div>
          <div style={styles.statValue}>{upcoming.length}</div>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Upcoming Tournaments</h3>
        {upcoming.length === 0 ? (
          <p style={styles.empty}>
            No upcoming tournaments.{' '}
            <Link href="/tournaments" style={styles.link}>Browse tournaments</Link>
          </p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tournament</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map(reg => (
                <tr key={reg.id}>
                  <td style={styles.td}>
                    <Link href={`/tournaments/${reg.tournament_id}`} style={styles.link}>
                      {reg.tournaments?.name}
                    </Link>
                  </td>
                  <td style={styles.td}>{reg.tournaments?.start_date}</td>
                  <td style={styles.td}>{reg.tournaments?.city}</td>
                  <td style={styles.td}>{reg.status}</td>
                  <td style={styles.td}>
                    <CancelRegistrationButton registrationId={reg.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Past Tournaments</h3>
        {past.length === 0 ? (
          <p style={styles.empty}>No past tournaments.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tournament</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>City</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {past.map(reg => (
                <tr key={reg.id}>
                  <td style={styles.td}>
                    <Link href={`/tournaments/${reg.tournament_id}`} style={styles.link}>
                      {reg.tournaments?.name}
                    </Link>
                  </td>
                  <td style={styles.td}>{reg.tournaments?.start_date}</td>
                  <td style={styles.td}>{reg.tournaments?.city}</td>
                  <td style={styles.td}>{reg.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
