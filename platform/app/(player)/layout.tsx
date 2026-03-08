export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>OPC Europe</h1>
      </header>
      {children}
    </div>
  )
}
