'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const styles = {
  bar: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
    marginBottom: '1.5rem',
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

export function FilterBar({
  countries,
  seriesList,
}: {
  countries: string[]
  seriesList: string[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

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

  return (
    <div style={styles.bar}>
      <select
        aria-label="Country"
        style={styles.select}
        value={searchParams.get('country') || ''}
        onChange={e => updateParam('country', e.target.value)}
      >
        <option value="">All Countries</option>
        {countries.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        aria-label="Series"
        style={styles.select}
        value={searchParams.get('series') || ''}
        onChange={e => updateParam('series', e.target.value)}
      >
        <option value="">All Series</option>
        {seriesList.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        aria-label="Sort"
        style={styles.select}
        value={searchParams.get('sort') || 'soonest'}
        onChange={e => updateParam('sort', e.target.value)}
      >
        <option value="soonest">Soonest first</option>
        <option value="latest">Latest first</option>
        <option value="cheapest">Cheapest first</option>
      </select>
    </div>
  )
}
