'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useRef } from 'react'

const styles = {
  bar: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  input: {
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    flex: '1 1 200px',
    minWidth: '180px',
  } as React.CSSProperties,
  select: {
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    outline: 'none',
  } as React.CSSProperties,
}

export function LeaderboardSearch({
  countries,
}: {
  countries: { code: string; name: string }[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function handleSearch(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => updateParam('q', value), 300)
  }

  return (
    <div style={styles.bar}>
      <input
        type="text"
        placeholder="Search player name..."
        defaultValue={searchParams.get('q') || ''}
        onChange={e => handleSearch(e.target.value)}
        style={styles.input}
        aria-label="Search players"
      />
      <select
        aria-label="Country"
        style={styles.select}
        value={searchParams.get('country') || ''}
        onChange={e => updateParam('country', e.target.value)}
      >
        <option value="">All Countries</option>
        {countries.map(c => (
          <option key={c.code} value={c.code}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}
