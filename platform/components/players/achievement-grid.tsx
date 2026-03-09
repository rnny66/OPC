import { AchievementBadge, type AchievementData } from './achievement-badge'

const styles = {
  section: {
    marginBottom: '2rem',
  } as React.CSSProperties,
  title: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    marginBottom: '1rem',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
  } as React.CSSProperties,
}

type PlayerAchievement = {
  achievement_id: string
  awarded_at: string
}

export function AchievementGrid({
  allAchievements,
  playerAchievements,
}: {
  allAchievements: AchievementData[]
  playerAchievements: PlayerAchievement[]
}) {
  const earnedMap = new Map(
    playerAchievements.map(pa => [pa.achievement_id, pa.awarded_at])
  )

  // Sort: earned first, then unearned
  const sorted = [...allAchievements].sort((a, b) => {
    const aEarned = earnedMap.has(a.id)
    const bEarned = earnedMap.has(b.id)
    if (aEarned && !bEarned) return -1
    if (!aEarned && bEarned) return 1
    return 0
  })

  return (
    <div style={styles.section}>
      <h2 style={styles.title}>Achievements</h2>
      <div style={styles.grid}>
        {sorted.map(achievement => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            earned={earnedMap.has(achievement.id)}
            awardedAt={earnedMap.get(achievement.id) || null}
          />
        ))}
      </div>
    </div>
  )
}
