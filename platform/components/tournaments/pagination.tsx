'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '2rem',
  } as React.CSSProperties,
  button: {
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  active: {
    backgroundColor: 'var(--color-brand)',
    borderColor: 'var(--color-brand)',
    color: '#fff',
  } as React.CSSProperties,
  disabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  } as React.CSSProperties,
}

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number
  totalPages: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  if (totalPages <= 1) return null

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set('page', String(page))
    } else {
      params.delete('page')
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <nav style={styles.nav} aria-label="Pagination">
      <button
        style={{ ...styles.button, ...(currentPage === 1 ? styles.disabled : {}) }}
        disabled={currentPage === 1}
        onClick={() => goToPage(currentPage - 1)}
        aria-label="Previous page"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          style={{ ...styles.button, ...(page === currentPage ? styles.active : {}) }}
          onClick={() => goToPage(page)}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        style={{ ...styles.button, ...(currentPage === totalPages ? styles.disabled : {}) }}
        disabled={currentPage === totalPages}
        onClick={() => goToPage(currentPage + 1)}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  )
}
