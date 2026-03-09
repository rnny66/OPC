import Link from 'next/link'

const statusStyles = {
  container: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  verified: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
  } as React.CSSProperties,
  unverified: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.3)',
  } as React.CSSProperties,
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  } as React.CSSProperties,
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
  } as React.CSSProperties,
  verifiedText: {
    color: '#22c55e',
  } as React.CSSProperties,
  unverifiedText: {
    color: '#f59e0b',
  } as React.CSSProperties,
  date: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
  link: {
    display: 'inline-block',
    padding: '0.4rem 0.75rem',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    fontSize: '0.8rem',
    fontWeight: 600,
  } as React.CSSProperties,
}

export function VerificationStatus({
  isVerified,
  verifiedAt,
}: {
  isVerified: boolean
  verifiedAt: string | null
}) {
  if (isVerified) {
    return (
      <div style={{ ...statusStyles.container, ...statusStyles.verified }}>
        <div style={statusStyles.row}>
          <span style={{ ...statusStyles.badge, ...statusStyles.verifiedText }}>
            Identity Verified
          </span>
          {verifiedAt && (
            <span style={statusStyles.date}>
              Verified {new Date(verifiedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...statusStyles.container, ...statusStyles.unverified }}>
      <div style={statusStyles.row}>
        <span style={{ ...statusStyles.badge, ...statusStyles.unverifiedText }}>
          Identity Not Verified
        </span>
        <Link href="/verify-identity" style={statusStyles.link}>
          Verify Now
        </Link>
      </div>
    </div>
  )
}
