const styles = {
  badge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    textAlign: 'center' as const,
    transition: 'opacity 0.2s ease',
  } as React.CSSProperties,
  icon: {
    fontSize: '2rem',
  } as React.CSSProperties,
  name: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: 'var(--color-text-primary)',
  } as React.CSSProperties,
  description: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
  earned: {
    fontSize: '0.7rem',
    color: 'var(--color-brand)',
  } as React.CSSProperties,
}

export type AchievementData = {
  id: string
  name: string
  description: string | null
  icon: string | null
}

export function AchievementBadge({
  achievement,
  earned,
  awardedAt,
}: {
  achievement: AchievementData
  earned: boolean
  awardedAt?: string | null
}) {
  const earnedDate = awardedAt
    ? new Date(awardedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  return (
    <div
      style={{
        ...styles.badge,
        opacity: earned ? 1 : 0.4,
        filter: earned ? 'none' : 'grayscale(1)',
      }}
    >
      <span style={styles.icon}>{achievement.icon || '🎖️'}</span>
      <span style={styles.name}>{achievement.name}</span>
      <span style={styles.description}>{achievement.description}</span>
      {earned && earnedDate && (
        <span style={styles.earned}>Earned {earnedDate}</span>
      )}
    </div>
  )
}
