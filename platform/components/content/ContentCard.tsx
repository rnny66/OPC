import Link from 'next/link'

interface ContentCardProps {
  title: string
  excerpt?: string | null
  slug: string
  href: string
  coverImageUrl?: string | null
  coverImageAlt?: string
  badge?: string
  date: string
  author?: string | null
}

const styles = {
  card: {
    backgroundColor: 'var(--color-bg-card, #161b26)',
    borderRadius: 'var(--radius-lg, 12px)',
    overflow: 'hidden' as const,
    border: '1px solid var(--color-border, #1f242f)',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  },
  imageWrapper: {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: '16/10',
    overflow: 'hidden' as const,
    backgroundColor: 'var(--color-bg-secondary, #161b22)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  body: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.625rem',
    borderRadius: 'var(--radius-sm, 6px)',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    backgroundColor: 'var(--color-brand, #1570ef)',
    color: '#fff',
    width: 'fit-content',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--color-text-primary, #f5f5f6)',
    lineHeight: 1.3,
  },
  excerpt: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary, #94969c)',
    lineHeight: 1.5,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden' as const,
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--color-text-tertiary, #6b7280)',
    marginTop: '0.25rem',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
}

export default function ContentCard({
  title,
  excerpt,
  slug,
  href,
  coverImageUrl,
  coverImageAlt,
  badge,
  date,
  author,
}: ContentCardProps) {
  return (
    <article style={styles.card}>
      <Link href={href} style={styles.link}>
        {coverImageUrl && (
          <div style={styles.imageWrapper}>
            <img
              src={coverImageUrl}
              alt={coverImageAlt || title}
              style={styles.image}
            />
          </div>
        )}
        <div style={styles.body}>
          {badge && <span style={styles.badge}>{badge}</span>}
          <h3 style={styles.title}>{title}</h3>
          {excerpt && <p style={styles.excerpt}>{excerpt}</p>}
          <div style={styles.meta}>
            <time>{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
            {author && (
              <>
                <span>·</span>
                <span>{author}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
