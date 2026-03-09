const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid var(--color-border)',
  } as React.CSSProperties,
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-brand)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.5rem',
    flexShrink: 0,
    overflow: 'hidden',
  } as React.CSSProperties,
  info: {
    flex: 1,
  } as React.CSSProperties,
  name: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  meta: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,
  rank: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--color-brand)',
    textAlign: 'right' as const,
  } as React.CSSProperties,
  rankLabel: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    textAlign: 'right' as const,
  } as React.CSSProperties,
}

type ProfileData = {
  display_name: string | null
  avatar_url: string | null
  home_country: string | null
  nationality: string[] | null
  created_at: string
}

export function PlayerProfileHeader({
  profile,
  rank,
}: {
  profile: ProfileData
  rank: number | null
}) {
  const initials = (profile.display_name || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const memberSince = new Date(profile.created_at).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div style={styles.header}>
      <div style={styles.avatar}>
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name || 'Player'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          initials
        )}
      </div>
      <div style={styles.info}>
        <h1 style={styles.name}>{profile.display_name || 'Unknown Player'}</h1>
        <div style={styles.meta}>
          {profile.home_country && <span>{profile.home_country}</span>}
          <span>Member since {memberSince}</span>
        </div>
      </div>
      {rank && (
        <div>
          <div style={styles.rank}>#{rank}</div>
          <div style={styles.rankLabel}>Global Rank</div>
        </div>
      )}
    </div>
  )
}
