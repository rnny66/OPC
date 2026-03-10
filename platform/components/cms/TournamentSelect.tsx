'use client'

import { useEffect, useState } from 'react'

interface Tournament {
  id: string
  name: string
  venue: string
  start_date: string
}

interface TournamentSelectProps {
  value?: string
  onChange?: (value: string) => void
  path: string
}

export default function TournamentSelect({ value, onChange, path }: TournamentSelectProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/tournaments-list')
      .then((res) => res.json())
      .then((data) => {
        setTournaments(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = tournaments.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.venue.toLowerCase().includes(search.toLowerCase()),
  )

  const selectedTournament = tournaments.find((t) => t.id === value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Tournament</label>
      {selectedTournament && (
        <div
          style={{
            padding: '0.5rem 0.75rem',
            backgroundColor: 'var(--theme-elevation-100)',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        >
          {selectedTournament.name} — {selectedTournament.venue}
        </div>
      )}
      <input
        type="text"
        placeholder="Search tournaments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--theme-elevation-50)',
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: '4px',
          color: 'inherit',
          fontSize: '0.875rem',
        }}
      />
      {loading ? (
        <div style={{ fontSize: '0.875rem', opacity: 0.6 }}>Loading tournaments...</div>
      ) : (
        <select
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          size={Math.min(filtered.length + 1, 8)}
          style={{
            padding: '0.25rem',
            backgroundColor: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '4px',
            color: 'inherit',
            fontSize: '0.875rem',
          }}
        >
          <option value="">Select a tournament...</option>
          {filtered.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.venue} ({new Date(t.start_date).toLocaleDateString()})
            </option>
          ))}
        </select>
      )}
      {/* Hidden input to store the value for Payload's form */}
      <input type="hidden" name={path} value={value || ''} />
    </div>
  )
}
