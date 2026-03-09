'use client'

import { useState, useTransition } from 'react'
import { saveResults } from '@/lib/actions/results'
import { calculatePoints } from '@/lib/points'

interface Player {
  id: string
  displayName: string
  nationality: string | null
}

interface ExistingResult {
  playerId: string
  placement: number
  pointsAwarded: number
}

interface ResultsEntryFormProps {
  tournamentId: string
  pointsMultiplier: number
  players: Player[]
  existingResults: ExistingResult[]
}

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  } as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    padding: '0.75rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    borderBottom: '1px solid var(--color-border)',
  } as React.CSSProperties,
  td: {
    padding: '0.75rem',
    fontSize: '0.875rem',
    color: 'var(--color-text-primary)',
    borderBottom: '1px solid var(--color-border)',
  } as React.CSSProperties,
  input: {
    width: '5rem',
    padding: '0.375rem 0.5rem',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
  } as React.CSSProperties,
  points: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    fontVariantNumeric: 'tabular-nums',
  } as React.CSSProperties,
  actions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    marginTop: '1.5rem',
  } as React.CSSProperties,
  saveBtn: {
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#fff',
    background: 'var(--color-brand)',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  saveBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  feedback: {
    fontSize: '0.875rem',
  } as React.CSSProperties,
}

export function ResultsEntryForm({
  tournamentId,
  pointsMultiplier,
  players,
  existingResults,
}: ResultsEntryFormProps) {
  const existingMap = new Map(
    existingResults.map((r) => [r.playerId, r.placement])
  )

  const [placements, setPlacements] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    for (const player of players) {
      const existing = existingMap.get(player.id)
      initial[player.id] = existing ? String(existing) : ''
    }
    return initial
  })

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  function handlePlacementChange(playerId: string, value: string) {
    setPlacements((prev) => ({ ...prev, [playerId]: value }))
    setMessage(null)
  }

  function handleSave() {
    const results: { playerId: string; placement: number }[] = []
    for (const player of players) {
      const val = placements[player.id]
      if (val && val.trim() !== '') {
        const placement = parseInt(val, 10)
        if (isNaN(placement) || placement < 1) continue
        results.push({ playerId: player.id, placement })
      }
    }

    if (results.length === 0) {
      setMessage({ type: 'error', text: 'Enter at least one placement.' })
      return
    }

    startTransition(async () => {
      try {
        await saveResults(tournamentId, results)
        setMessage({
          type: 'success',
          text: `Saved results for ${results.length} player${results.length === 1 ? '' : 's'}.`,
        })
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'Failed to save.' })
      }
    })
  }

  return (
    <div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Player</th>
            <th style={styles.th}>Nationality</th>
            <th style={styles.th}>Placement</th>
            <th style={styles.th}>Points</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player) => {
            const val = placements[player.id] || ''
            const placement = parseInt(val, 10)
            const points =
              !isNaN(placement) && placement > 0
                ? calculatePoints(placement, pointsMultiplier)
                : null

            return (
              <tr key={player.id}>
                <td style={styles.td}>{player.displayName}</td>
                <td style={styles.td}>{player.nationality || '—'}</td>
                <td style={styles.td}>
                  <input
                    type="number"
                    min="1"
                    style={styles.input}
                    value={val}
                    onChange={(e) =>
                      handlePlacementChange(player.id, e.target.value)
                    }
                    placeholder="#"
                    aria-label={`Placement for ${player.displayName}`}
                  />
                </td>
                <td style={{ ...styles.td, ...styles.points }}>
                  {points !== null ? points : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div style={styles.actions}>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          style={{
            ...styles.saveBtn,
            ...(isPending ? styles.saveBtnDisabled : {}),
          }}
        >
          {isPending ? 'Saving…' : 'Save Results'}
        </button>
        {message && (
          <span
            style={{
              ...styles.feedback,
              color:
                message.type === 'success'
                  ? 'var(--color-success, #22c55e)'
                  : 'var(--color-error, #ef4444)',
            }}
          >
            {message.text}
          </span>
        )}
      </div>
    </div>
  )
}
