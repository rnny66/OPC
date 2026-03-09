import { Suspense } from 'react'
import Link from 'next/link'
import { createSupabaseServer } from '@/lib/supabase/server'
import { RankBadge } from '@/components/rankings/rank-badge'
import { LeaderboardSearch } from '@/components/rankings/leaderboard-search'
import { Pagination } from '@/components/tournaments/pagination'

export const metadata = {
  title: 'Rankings — OPC Europe',
}

const PAGE_SIZE = 20

const pageStyles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  } as React.CSSProperties,
  header: {
    marginBottom: '2rem',
  } as React.CSSProperties,
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.95rem',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '2rem',
    alignItems: 'start',
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
  rowTop: {
    backgroundColor: 'rgba(21, 112, 239, 0.05)',
  } as React.CSSProperties,
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  } as React.CSSProperties,
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.75rem',
    flexShrink: 0,
    overflow: 'hidden',
  } as React.CSSProperties,
  playerLink: {
    color: 'var(--color-text-primary)',
    textDecoration: 'none',
    fontWeight: 500,
  } as React.CSSProperties,
  sidebar: {
    padding: '1.25rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
  } as React.CSSProperties,
  sidebarTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: '0.75rem',
  } as React.CSSProperties,
  sidebarText: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
  } as React.CSSProperties,
  empty: {
    padding: '2rem',
    textAlign: 'center' as const,
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
}

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; country?: string; page?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''
  const country = params.country || ''
  const page = Math.max(1, parseInt(params.page || '1', 10))

  const supabase = await createSupabaseServer()

  // Fetch countries for filter dropdown (needed before rankings query for name lookup)
  const { data: countryList } = await supabase
    .from('country_config')
    .select('country_code, country_name')
    .order('country_name')

  const countries = (countryList || []).map(c => ({
    code: c.country_code,
    name: c.country_name,
  }))

  // Build query
  let query = supabase
    .from('player_stats')
    .select(`
      player_id,
      total_points,
      tournament_count,
      current_rank,
      previous_rank,
      profiles!inner (
        id,
        display_name,
        avatar_url,
        home_country,
        nationality,
        slug
      )
    `, { count: 'exact' })
    .order('total_points', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (q) {
    query = query.ilike('profiles.display_name', `%${q}%`)
  }
  if (country) {
    // country param is a code (e.g. "NL"), but profiles.home_country stores full name
    const matchedCountry = countries.find(c => c.code === country)
    if (matchedCountry) {
      query = query.eq('profiles.home_country', matchedCountry.name)
    }
  }

  const { data: rankings, count } = await query

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <div style={pageStyles.container}>
      <div style={pageStyles.header}>
        <h1 style={pageStyles.title}>Rankings</h1>
        <p style={pageStyles.subtitle}>
          Live rankings of verified players across Europe
        </p>
      </div>

      <Suspense fallback={null}>
        <LeaderboardSearch countries={countries} />
      </Suspense>

      <div className="rankings-layout" style={pageStyles.layout}>
        <div>
          <table style={pageStyles.table}>
            <thead>
              <tr>
                <th style={{ ...pageStyles.th, width: '60px' }}>#</th>
                <th style={pageStyles.th}>Player</th>
                <th style={pageStyles.th}>Country</th>
                <th style={{ ...pageStyles.th, textAlign: 'right' }}>Points</th>
                <th style={{ ...pageStyles.th, textAlign: 'right' }}>Tournaments</th>
              </tr>
            </thead>
            <tbody>
              {(!rankings || rankings.length === 0) ? (
                <tr>
                  <td colSpan={5} style={pageStyles.empty}>
                    No ranked players found.
                  </td>
                </tr>
              ) : (
                rankings.map((row: any) => {
                  const profile = row.profiles
                  const isTop = row.current_rank <= 3
                  const initials = (profile.display_name || '?')
                    .split(' ')
                    .map((w: string) => w[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)

                  return (
                    <tr key={row.player_id} style={isTop ? pageStyles.rowTop : undefined}>
                      <td style={pageStyles.td}>
                        <RankBadge
                          currentRank={row.current_rank}
                          previousRank={row.previous_rank}
                        />
                      </td>
                      <td style={pageStyles.td}>
                        <div style={pageStyles.nameCell}>
                          <div style={pageStyles.avatar}>
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              initials
                            )}
                          </div>
                          <Link href={`/players/${profile.slug}`} style={pageStyles.playerLink}>
                            {profile.display_name || 'Unknown'}
                          </Link>
                        </div>
                      </td>
                      <td style={pageStyles.td}>{profile.home_country || '—'}</td>
                      <td style={{ ...pageStyles.td, textAlign: 'right', fontWeight: 600 }}>
                        {row.total_points.toLocaleString()}
                      </td>
                      <td style={{ ...pageStyles.td, textAlign: 'right' }}>
                        {row.tournament_count}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          <Suspense fallback={null}>
            <Pagination currentPage={page} totalPages={totalPages} />
          </Suspense>
        </div>

        <aside style={pageStyles.sidebar}>
          <h3 style={pageStyles.sidebarTitle}>How Rankings Work</h3>
          <div style={pageStyles.sidebarText}>
            <p>Rankings are based on points earned across all OPC tournaments.</p>
            <ul style={{ paddingLeft: '1rem', marginTop: '0.5rem' }}>
              <li>Points are awarded based on finishing position</li>
              <li>Tournament multipliers affect point values</li>
              <li>Country multipliers weight regional performance</li>
              <li>Rankings update after each tournament</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
