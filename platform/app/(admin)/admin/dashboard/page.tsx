import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Admin Dashboard — OPC Europe' }

const styles = {
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #f0f0f0)',
    marginBottom: '2rem',
  } as React.CSSProperties,
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2.5rem',
  } as React.CSSProperties,
  stat: {
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
  empty: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    padding: '1.5rem 0',
  } as React.CSSProperties,
}

const roleBadgeColors: Record<string, { bg: string; color: string }> = {
  admin: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  organizer: { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' },
  player: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
}

function RoleBadge({ role }: { role: string }) {
  const colors = roleBadgeColors[role] || roleBadgeColors.player
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: colors.bg,
      color: colors.color,
    }}>
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, { bg: string; color: string }> = {
    confirmed: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    pending: { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' },
    waitlisted: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
    rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
  }
  const colors = colorMap[status] || colorMap.pending
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      backgroundColor: colors.bg,
      color: colors.color,
    }}>
      {status}
    </span>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  // Fetch all stats in parallel
  const [
    { count: totalUsers },
    { count: organizers },
    { count: verifiedUsers },
    { count: totalTournaments },
    { count: activeTournaments },
    { count: registrations },
    { data: recentSignups },
    { data: recentRegistrations },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'organizer'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('identity_verified', true),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }),
    supabase.from('tournaments').select('*', { count: 'exact', head: true }).in('status', ['upcoming', 'ongoing']),
    supabase.from('tournament_registrations').select('*', { count: 'exact', head: true }).neq('status', 'cancelled'),
    supabase
      .from('profiles')
      .select('id, display_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('tournament_registrations')
      .select('id, status, created_at, profiles(display_name), tournaments(name)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const statCards = [
    { label: 'Total Users', value: totalUsers ?? 0 },
    { label: 'Organizers', value: organizers ?? 0 },
    { label: 'Verified Users', value: verifiedUsers ?? 0 },
    { label: 'Total Tournaments', value: totalTournaments ?? 0 },
    { label: 'Active Tournaments', value: activeTournaments ?? 0 },
    { label: 'Registrations', value: registrations ?? 0 },
  ]

  return (
    <div>
      <h1 style={styles.title}>Admin Dashboard</h1>

      <div style={styles.statsGrid}>
        {statCards.map((stat) => (
          <div key={stat.label} style={styles.stat}>
            <div style={styles.statLabel}>{stat.label}</div>
            <div style={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Recent Signups</h3>
        {!recentSignups?.length ? (
          <p style={styles.empty}>No signups yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentSignups.map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.display_name || '—'}</td>
                  <td style={styles.td}>{p.email || '—'}</td>
                  <td style={styles.td}><RoleBadge role={p.role} /></td>
                  <td style={styles.td}>{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Recent Registrations</h3>
        {!recentRegistrations?.length ? (
          <p style={styles.empty}>No registrations yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Player</th>
                <th style={styles.th}>Tournament</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentRegistrations.map((r: any) => (
                <tr key={r.id}>
                  <td style={styles.td}>{r.profiles?.display_name || '—'}</td>
                  <td style={styles.td}>{r.tournaments?.name || '—'}</td>
                  <td style={styles.td}><StatusBadge status={r.status} /></td>
                  <td style={styles.td}>{formatDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
