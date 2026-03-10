import Link from 'next/link'

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid var(--color-border, #1f242f)',
    backgroundColor: 'var(--color-bg-primary, #0c0e12)',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--color-text-primary, #f5f5f6)',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary, #94969c)',
    textDecoration: 'none',
  },
  activeLink: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: 'var(--color-text-primary, #f5f5f6)',
    textDecoration: 'none',
  },
}

interface PublicHeaderProps {
  activePath?: string
}

export default function PublicHeader({ activePath }: PublicHeaderProps) {
  const links = [
    { href: '/news', label: 'News' },
    { href: '/blog', label: 'Blog' },
    { href: '/events', label: 'Events' },
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/rankings', label: 'Rankings' },
  ]

  return (
    <header style={styles.header}>
      <Link href="/" style={styles.logo}>
        OPC Europe
      </Link>
      <nav style={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={activePath === link.href ? styles.activeLink : styles.link}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
