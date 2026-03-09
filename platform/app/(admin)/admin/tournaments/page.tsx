import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminTournamentTable, type TournamentRow } from '@/components/admin/admin-tournament-table'

export const metadata = { title: 'Tournament Oversight — OPC Europe' }

const headingStyle: React.CSSProperties = {
  fontSize: '1.75rem',
  fontWeight: 700,
  color: 'var(--color-text-primary, #f0f0f0)',
  marginBottom: '2rem',
}

const filterBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
}

const selectStyle: React.CSSProperties = {
  background: 'var(--color-bg-secondary, #13151a)',
  border: '1px solid var(--color-border, #23272f)',
  borderRadius: '0.375rem',
  color: 'var(--color-text-primary, #f0f0f0)',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
}

const buttonStyle: React.CSSProperties = {
  background: 'var(--color-brand, #1570ef)',
  color: '#fff',
  border: 'none',
  borderRadius: '0.375rem',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
}

export default async function AdminTournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; organizer_id?: string }>
}) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const params = await searchParams

  // Fetch organizers for filter dropdown
  const { data: organizers } = await supabase
    .from('profiles')
    .select('id, display_name')
    .in('role', ['organizer', 'admin'])
    .order('display_name')

  // Build tournament query
  let query = supabase
    .from('tournaments')
    .select('id, name, city, country, start_date, status, organizer_id, profiles!organizer_id(display_name), tournament_registrations(count)')
    .order('start_date', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }
  if (params.organizer_id) {
    query = query.eq('organizer_id', params.organizer_id)
  }

  const { data: tournaments } = await query

  const tableData: TournamentRow[] = (tournaments ?? []).map((t: Record<string, unknown>) => {
    const profileData = t.profiles as { display_name: string } | null
    const regsData = t.tournament_registrations as { count: number }[] | null
    return {
      id: t.id as string,
      name: t.name as string,
      city: t.city as string,
      country: t.country as string,
      start_date: t.start_date as string,
      status: t.status as TournamentRow['status'],
      organizer_name: profileData?.display_name ?? 'Unknown',
      registration_count: regsData?.[0]?.count ?? 0,
    }
  })

  return (
    <div>
      <h1 style={headingStyle}>Tournament Oversight</h1>

      <form method="GET" style={filterBarStyle}>
        <select name="status" defaultValue={params.status ?? ''} style={selectStyle}>
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select name="organizer_id" defaultValue={params.organizer_id ?? ''} style={selectStyle}>
          <option value="">All Organizers</option>
          {(organizers ?? []).map((o) => (
            <option key={o.id} value={o.id}>
              {o.display_name ?? o.id}
            </option>
          ))}
        </select>

        <button type="submit" style={buttonStyle}>
          Filter
        </button>
      </form>

      <AdminTournamentTable tournaments={tableData} />
    </div>
  )
}
