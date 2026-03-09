import Link from 'next/link'

const styles = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--color-border)',
  } as React.CSSProperties,
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
  } as React.CSSProperties,
  nav: {
    display: 'flex',
    gap: '1.5rem',
  } as React.CSSProperties,
  link: {
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
  } as React.CSSProperties,
}

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>OPC Europe</h1>
        <nav style={styles.nav}>
          <Link href="/dashboard" style={styles.link}>Dashboard</Link>
          <Link href="/tournaments" style={styles.link}>Tournaments</Link>
          <Link href="/profile" style={styles.link}>Profile</Link>
        </nav>
      </header>
      {children}
    </div>
  )
}
