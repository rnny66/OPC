import { createSupabaseServer } from '@/lib/supabase/server'
import { TournamentGrid } from '@/components/tournaments/tournament-grid'
import { FilterBar } from '@/components/tournaments/filter-bar'
import { Pagination } from '@/components/tournaments/pagination'
import { Suspense } from 'react'

export const metadata = { title: 'Tournaments — OPC Europe' }

const PAGE_SIZE = 16

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; series?: string; sort?: string; page?: string }>
}) {
  const params = await searchParams
  const country = params.country || ''
  const series = params.series || ''
  const sort = params.sort || 'soonest'
  const page = Math.max(1, parseInt(params.page || '1', 10))

  const supabase = await createSupabaseServer()

  // Build query
  let query = supabase
    .from('tournaments')
    .select('*', { count: 'exact' })

  if (country) query = query.eq('country', country)
  if (series) query = query.eq('series', series)

  // Sort
  if (sort === 'latest') {
    query = query.order('start_date', { ascending: false })
  } else if (sort === 'cheapest') {
    query = query.order('entry_fee', { ascending: true })
  } else {
    query = query.order('start_date', { ascending: true })
  }

  // Pagination
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  query = query.range(from, to)

  const { data: tournaments, count } = await query
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  // Get distinct countries and series for filter options
  const { data: countryRows } = await supabase
    .from('tournaments')
    .select('country')
  const { data: seriesRows } = await supabase
    .from('tournaments')
    .select('series')

  const countries = [...new Set(countryRows?.map(r => r.country) || [])].sort()
  const seriesList = [...new Set(seriesRows?.map(r => r.series) || [])].sort()

  // Check user registrations if logged in
  let registeredIds: string[] = []
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: regs } = await supabase
      .from('tournament_registrations')
      .select('tournament_id')
      .eq('player_id', user.id)
      .neq('status', 'cancelled')
    registeredIds = regs?.map(r => r.tournament_id) || []
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Find your next tournament
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Discover OPC certified tournaments across Europe
        </p>
      </div>

      <Suspense fallback={null}>
        <FilterBar countries={countries} seriesList={seriesList} />
      </Suspense>

      <TournamentGrid
        tournaments={tournaments || []}
        registeredIds={registeredIds}
      />

      <Suspense fallback={null}>
        <Pagination currentPage={page} totalPages={totalPages} />
      </Suspense>
    </div>
  )
}
