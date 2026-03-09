'use client'

import { useState, useTransition } from 'react'
import { updateRegistrationStatus } from '@/lib/actions/registration'

interface RegistrationStatusSelectProps {
  registrationId: string
  tournamentId: string
  currentStatus: string
}

const styles = {
  select: {
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.375rem 0.5rem',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  selectLoading: {
    opacity: 0.5,
    cursor: 'wait',
  } as React.CSSProperties,
}

export function RegistrationStatusSelect({
  registrationId,
  tournamentId,
  currentStatus,
}: RegistrationStatusSelectProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    setError(null)
    startTransition(async () => {
      try {
        await updateRegistrationStatus(registrationId, newStatus, tournamentId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status')
      }
    })
  }

  return (
    <div>
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        style={{
          ...styles.select,
          ...(isPending ? styles.selectLoading : {}),
        }}
        aria-label="Registration status"
      >
        <option value="registered">Registered</option>
        <option value="confirmed">Confirmed</option>
        <option value="no_show">No Show</option>
      </select>
      {error && (
        <span
          style={{
            color: 'var(--color-error, #ef4444)',
            fontSize: '0.75rem',
            marginLeft: '0.5rem',
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}
