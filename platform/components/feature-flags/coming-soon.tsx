interface ComingSoonProps {
  title?: string
  description?: string
}

export function ComingSoon({
  title = 'Coming Soon',
  description = 'This feature is currently being prepared and will be available shortly.',
}: ComingSoonProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '0.75rem',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.95rem',
          maxWidth: '400px',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </div>
  )
}
