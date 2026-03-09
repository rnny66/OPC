import { createSupabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { RegistrationButton } from '@/components/tournaments/registration-button'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('name')
    .eq('id', id)
    .single()
  return { title: tournament ? `${tournament.name} — OPC Europe` : 'Tournament — OPC Europe' }
}

const styles = {
  container: {
    maxWidth: '720px',
  } as React.CSSProperties,
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    marginBottom: '1rem',
  } as React.CSSProperties,
  meta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
  } as React.CSSProperties,
  label: {
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    minWidth: '120px',
  } as React.CSSProperties,
  description: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  capacity: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  notice: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    color: '#f59e0b',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
}

function formatDate(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatEntryFee(fee: number): string {
  if (fee === 0) return 'Free entry'
  return `€${fee / 100}`
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServer()

  const { data: tournament } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (!tournament) notFound()

  // Count registrations
  const { count: registrationCount } = await supabase
    .from('tournament_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', id)
    .neq('status', 'cancelled')

  // Check if user is registered
  let userRegistration = null
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: reg } = await supabase
      .from('tournament_registrations')
      .select('*')
      .eq('tournament_id', id)
      .eq('player_id', user.id)
      .neq('status', 'cancelled')
      .maybeSingle()
    userRegistration = reg
  }

  // Get user profile for onboarding/verification checks
  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_complete, identity_verified')
      .eq('id', user.id)
      .single()
    userProfile = profile
  }

  const isFull = tournament.capacity ? (registrationCount || 0) >= tournament.capacity : false
  const isPastDeadline = tournament.registration_deadline
    ? new Date() > new Date(tournament.registration_deadline)
    : false

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{tournament.name}</h2>

      <div style={styles.meta}>
        <div style={styles.row}>
          <span style={styles.label}>Venue</span>
          <span>{tournament.club_name}, {tournament.city}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Dates</span>
          <span>{formatDate(tournament.start_date)} – {formatDate(tournament.end_date)}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Entry Fee</span>
          <span>{formatEntryFee(tournament.entry_fee)}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Series</span>
          <span>{tournament.series}</span>
        </div>
        {tournament.venue_address && (
          <div style={styles.row}>
            <span style={styles.label}>Address</span>
            <span>{tournament.venue_address}</span>
          </div>
        )}
        {tournament.contact_email && (
          <div style={styles.row}>
            <span style={styles.label}>Contact</span>
            <span>{tournament.contact_email}</span>
          </div>
        )}
      </div>

      {tournament.description && (
        <p style={styles.description}>{tournament.description}</p>
      )}

      {tournament.capacity && (
        <div style={styles.capacity}>
          <div style={styles.row}>
            <span style={styles.label}>Capacity</span>
            <span>{registrationCount || 0} / {tournament.capacity} registered</span>
          </div>
        </div>
      )}

      {tournament.requires_verification && (
        <div style={styles.notice}>
          This tournament requires identity verification to register.
        </div>
      )}

      <RegistrationButton
        tournamentId={tournament.id}
        isLoggedIn={!!user}
        isRegistered={!!userRegistration}
        isOnboarded={userProfile?.onboarding_complete || false}
        isVerified={userProfile?.identity_verified || false}
        requiresVerification={tournament.requires_verification}
        registrationOpen={tournament.registration_open}
        isFull={isFull}
        isPastDeadline={isPastDeadline}
      />
    </div>
  )
}
