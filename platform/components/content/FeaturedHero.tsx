import Link from 'next/link'

interface FeaturedHeroProps {
  title: string
  excerpt?: string | null
  href: string
  coverImageUrl?: string | null
  coverImageAlt?: string
  badge?: string
  date: string
  author?: string | null
}

const styles = {
  wrapper: {
    position: 'relative' as const,
    borderRadius: 'var(--radius-lg, 12px)',
    overflow: 'hidden' as const,
    marginBottom: '2rem',
    border: '1px solid var(--color-border, #1f242f)',
    minHeight: '320px',
    display: 'flex',
    alignItems: 'flex-end',
  },
  image: {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  overlay: {
    position: 'absolute' as const,
    inset: 0,
    background: 'linear-gradient(to top, rgba(12, 14, 18, 0.95) 0%, rgba(12, 14, 18, 0.3) 100%)',
  },
  content: {
    position: 'relative' as const,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    maxWidth: '640px',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: 'var(--radius-sm, 6px)',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    backgroundColor: 'var(--color-brand, #1570ef)',
    color: '#fff',
    width: 'fit-content',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.2,
  },
  excerpt: {
    fontSize: '1rem',
    color: 'var(--color-text-secondary, #94969c)',
    lineHeight: 1.5,
  },
  meta: {
    fontSize: '0.875rem',
    color: 'var(--color-text-tertiary, #6b7280)',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    alignItems: 'flex-end',
    width: '100%',
    minHeight: '320px',
  },
}

export default function FeaturedHero({
  title,
  excerpt,
  href,
  coverImageUrl,
  coverImageAlt,
  badge,
  date,
  author,
}: FeaturedHeroProps) {
  return (
    <article style={styles.wrapper}>
      {coverImageUrl && (
        <img src={coverImageUrl} alt={coverImageAlt || title} style={styles.image} />
      )}
      <div style={styles.overlay} />
      <Link href={href} style={styles.link}>
        <div style={styles.content}>
          {badge && <span style={styles.badge}>{badge}</span>}
          <h2 style={styles.title}>{title}</h2>
          {excerpt && <p style={styles.excerpt}>{excerpt}</p>}
          <div style={styles.meta}>
            <time>
              {new Date(date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </time>
            {author && <span> · {author}</span>}
          </div>
        </div>
      </Link>
    </article>
  )
}
