import Link from 'next/link'

interface ContentGridProps {
  children: React.ReactNode
  currentPage: number
  totalPages: number
  basePath: string
  searchParams?: Record<string, string>
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '2.5rem',
  },
  pageLink: {
    padding: '0.5rem 0.875rem',
    borderRadius: 'var(--radius-md, 8px)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary, #94969c)',
    backgroundColor: 'var(--color-bg-secondary, #161b22)',
    border: '1px solid var(--color-border, #1f242f)',
    textDecoration: 'none',
  },
  pageLinkActive: {
    padding: '0.5rem 0.875rem',
    borderRadius: 'var(--radius-md, 8px)',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: 'var(--color-brand, #1570ef)',
    border: '1px solid var(--color-brand, #1570ef)',
    textDecoration: 'none',
  },
  pageLinkDisabled: {
    padding: '0.5rem 0.875rem',
    borderRadius: 'var(--radius-md, 8px)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-tertiary, #6b7280)',
    backgroundColor: 'var(--color-bg-secondary, #161b22)',
    border: '1px solid var(--color-border, #1f242f)',
    textDecoration: 'none',
    opacity: 0.5,
    pointerEvents: 'none' as const,
  },
}

function buildUrl(basePath: string, page: number, searchParams?: Record<string, string>) {
  const params = new URLSearchParams(searchParams)
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export default function ContentGrid({
  children,
  currentPage,
  totalPages,
  basePath,
  searchParams,
}: ContentGridProps) {
  return (
    <div>
      <div style={styles.grid}>{children}</div>
      {totalPages > 1 && (
        <nav style={styles.pagination}>
          <Link
            href={buildUrl(basePath, currentPage - 1, searchParams)}
            style={currentPage <= 1 ? styles.pageLinkDisabled : styles.pageLink}
          >
            ← Previous
          </Link>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={buildUrl(basePath, page, searchParams)}
              style={page === currentPage ? styles.pageLinkActive : styles.pageLink}
            >
              {page}
            </Link>
          ))}
          <Link
            href={buildUrl(basePath, currentPage + 1, searchParams)}
            style={currentPage >= totalPages ? styles.pageLinkDisabled : styles.pageLink}
          >
            Next →
          </Link>
        </nav>
      )}
    </div>
  )
}
