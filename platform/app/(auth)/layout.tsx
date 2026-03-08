export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}>
            OPC Europe
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
          }}>
            European Open Poker Championship
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
