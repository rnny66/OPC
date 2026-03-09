import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { ResultsEntryForm } from '@/components/organizer/results-entry-form'
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
      ? `Results: ${tournament.name} — OPC Europe`
      : 'Results — OPC Europe',
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
  empty: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    padding: '1.5rem 0',
  } as React.CSSProperties,
}

export default async function ResultsPage({
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

  // Fetch non-cancelled registrations with player profiles
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('player_id, profiles(id, display_name, nationality)')
    .eq('tournament_id', id)
    .neq('status', 'cancelled')
    .order('registered_at', { ascending: true })

  const regs = registrations || []

  // Fetch existing results for this tournament
  const { data: existingResults } = await supabase
    .from('tournament_results')
    .select('player_id, placement, points_awarded')
    .eq('tournament_id', id)

  const players = regs.map((reg: any) => ({
    id: reg.player_id,
    displayName: reg.profiles?.display_name || '—',
    nationality: reg.profiles?.nationality?.[0] || null,
  }))

  const results = (existingResults || []).map((r: any) => ({
    playerId: r.player_id,
    placement: r.placement,
    pointsAwarded: r.points_awarded,
  }))

  return (
    <div>
      <Link href={`/organizer/tournaments/${id}`} style={styles.backLink}>
        &larr; Back to tournament
      </Link>

      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>{tournament.name} — Results</h2>
          <span style={styles.subtitle}>
            {players.length} registered player{players.length === 1 ? '' : 's'}
            {' · '}
            Points multiplier: {tournament.points_multiplier}x
          </span>
        </div>
      </div>

      {players.length === 0 ? (
        <p style={styles.empty}>No registered players to enter results for.</p>
      ) : (
        <ResultsEntryForm
          tournamentId={id}
          pointsMultiplier={tournament.points_multiplier}
          players={players}
          existingResults={results}
        />
      )}
    </div>
  )
}
