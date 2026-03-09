import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { PlayerProfileHeader } from '@/components/players/player-profile-header'
import { StatsGrid } from '@/components/players/stats-grid'
import { AchievementGrid } from '@/components/players/achievement-grid'
import { TournamentHistoryTable } from '@/components/players/tournament-history-table'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('slug', slug)
    .single()

  return {
    title: profile
      ? `${profile.display_name} — OPC Europe`
      : 'Player — OPC Europe',
  }
}

const pageStyles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem',
  } as React.CSSProperties,
}

const HISTORY_PAGE_SIZE = 10

export default async function PlayerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ history_page?: string }>
}) {
  const { slug } = await params
  const { history_page } = await searchParams
  const historyPage = Math.max(1, parseInt(history_page || '1', 10))

  const supabase = await createSupabaseServer()

  // Fetch profile by slug
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, home_country, nationality, created_at')
    .eq('slug', slug)
    .single()

  if (!profile) notFound()

  // Fetch stats, achievements, and tournament history in parallel
  const [statsRes, playerAchievementsRes, allAchievementsRes, historyRes] =
    await Promise.all([
      supabase
        .from('player_stats')
        .select('total_points, tournament_count, win_count, top3_count, avg_finish, best_finish, current_rank')
        .eq('player_id', profile.id)
        .single(),
      supabase
        .from('player_achievements')
        .select('achievement_id, awarded_at')
        .eq('player_id', profile.id),
      supabase
        .from('achievements')
        .select('id, name, description, icon')
        .order('name'),
      supabase
        .from('tournament_results')
        .select(`
          id,
          placement,
          points_awarded,
          tournaments (
            id,
            name,
            country,
            start_date
          )
        `)
        .eq('player_id', profile.id)
        .order('created_at', { ascending: false })
        .range(
          (historyPage - 1) * HISTORY_PAGE_SIZE,
          historyPage * HISTORY_PAGE_SIZE - 1
        ),
    ])

  const stats = statsRes.data
  const defaultStats = {
    total_points: 0,
    tournament_count: 0,
    win_count: 0,
    top3_count: 0,
    avg_finish: null,
    best_finish: null,
  }

  return (
    <div style={pageStyles.container}>
      <PlayerProfileHeader
        profile={profile}
        rank={stats?.current_rank ?? null}
      />

      <StatsGrid stats={stats || defaultStats} />

      <AchievementGrid
        allAchievements={allAchievementsRes.data || []}
        playerAchievements={playerAchievementsRes.data || []}
      />

      <TournamentHistoryTable results={(historyRes.data as any) || []} />
    </div>
  )
}
