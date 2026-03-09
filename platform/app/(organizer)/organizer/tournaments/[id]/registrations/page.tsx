import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { RegistrationStatusSelect } from '@/components/organizer/registration-status-select'
import { ExportCSVButton } from '@/components/organizer/export-csv-button'
import Link from 'next/link'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('name')
    .eq('id', id)
    .single()

  return {
    title: tournament
      ? `Registrations: ${tournament.name} — OPC Europe`
      : 'Registrations — OPC Europe',
  }
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  titleRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  } as React.CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
  backLink: {
    color: 'var(--color-brand)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    marginBottom: '1rem',
    display: 'inline-block',
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

export default async function RegistrationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (!tournament) notFound()
  if (tournament.organizer_id !== user.id) redirect('/organizer/dashboard')

  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*, profiles(display_name, nationality)')
    .eq('tournament_id', id)
    .neq('status', 'cancelled')
    .order('registered_at', { ascending: false })

  const regs = registrations || []

  return (
    <div>
      <Link href={`/organizer/tournaments/${id}`} style={styles.backLink}>
        &larr; Back to tournament
      </Link>

      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>{tournament.name} — Registrations</h2>
          <span style={styles.subtitle}>
            {regs.length} / {tournament.capacity ?? '—'} registered
          </span>
        </div>
        <ExportCSVButton registrations={regs} tournamentName={tournament.name} />
      </div>

      {regs.length === 0 ? (
        <p style={styles.empty}>No registrations yet.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Player</th>
              <th style={styles.th}>Nationality</th>
              <th style={styles.th}>Registered</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {regs.map((reg: any) => (
              <tr key={reg.id}>
                <td style={styles.td}>
                  {reg.profiles?.display_name || '—'}
                </td>
                <td style={styles.td}>
                  {reg.profiles?.nationality?.[0] || '—'}
                </td>
                <td style={styles.td}>
                  {new Date(reg.registered_at).toLocaleDateString()}
                </td>
                <td style={styles.td}>
                  <RegistrationStatusSelect
                    registrationId={reg.id}
                    tournamentId={id}
                    currentStatus={reg.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
