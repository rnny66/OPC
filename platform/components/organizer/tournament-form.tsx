'use client'

import { useState, useTransition } from 'react'
import { createTournament, updateTournament } from '@/lib/actions/tournament'
import { useToast } from '@/components/ui/toast'

interface Tournament {
  id: string
  name: string
  club_name: string
  city: string
  country: string
  series: string
  start_date: string
  end_date: string
  entry_fee: number
  capacity: number | null
  points_multiplier: number
  registration_open: boolean
  requires_verification: boolean
  description: string | null
  venue_address: string | null
  contact_email: string | null
  registration_deadline: string | null
  status: string
}

interface TournamentFormProps {
  tournament?: Tournament
}

const styles = {
  form: {
    maxWidth: '640px',
  } as React.CSSProperties,
  fieldGroup: {
    marginBottom: '1.25rem',
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '0.375rem',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
  } as React.CSSProperties,
  select: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '0.625rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  } as React.CSSProperties,
  checkboxRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  } as React.CSSProperties,
  checkboxLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
  button: {
    padding: '0.625rem 1.5rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  } as React.CSSProperties,
}

export function TournamentForm({ tournament }: TournamentFormProps) {
  const isEdit = !!tournament
  const serverAction = isEdit ? updateTournament : createTournament
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await serverAction(formData)
        toast({ type: 'success', message: 'Tournament saved' })
      } catch (err: any) {
        const msg = err.message || 'Failed to save tournament'
        setError(msg)
        toast({ type: 'error', message: msg })
      }
    })
  }

  return (
    <form action={handleSubmit} style={styles.form}>
      {isEdit && <input type="hidden" name="id" value={tournament.id} />}

      <div style={styles.fieldGroup}>
        <label htmlFor="name" style={styles.label}>Tournament Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={tournament?.name ?? ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="club_name" style={styles.label}>Club / Venue Name</label>
        <input
          id="club_name"
          name="club_name"
          type="text"
          required
          defaultValue={tournament?.club_name ?? ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="city" style={styles.label}>City</label>
        <input
          id="city"
          name="city"
          type="text"
          required
          defaultValue={tournament?.city ?? ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="country" style={styles.label}>Country (ISO code)</label>
        <input
          id="country"
          name="country"
          type="text"
          required
          defaultValue={tournament?.country ?? ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="series" style={styles.label}>Series</label>
        <select
          id="series"
          name="series"
          defaultValue={tournament?.series ?? 'Open'}
          style={styles.select}
        >
          <option value="Main">OPC Main</option>
          <option value="Open">OPC Open</option>
        </select>
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="description" style={styles.label}>Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={tournament?.description ?? ''}
          style={styles.textarea}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="venue_address" style={styles.label}>Venue Address</label>
        <input
          id="venue_address"
          name="venue_address"
          type="text"
          defaultValue={tournament?.venue_address ?? ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="contact_email" style={styles.label}>Contact Email</label>
        <input
          id="contact_email"
          name="contact_email"
          type="email"
          defaultValue={tournament?.contact_email ?? ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="start_date" style={styles.label}>Start Date</label>
        <input
          id="start_date"
          name="start_date"
          type="date"
          required
          defaultValue={tournament?.start_date ?? ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="end_date" style={styles.label}>End Date</label>
        <input
          id="end_date"
          name="end_date"
          type="date"
          required
          defaultValue={tournament?.end_date ?? ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="registration_deadline" style={styles.label}>Registration Deadline</label>
        <input
          id="registration_deadline"
          name="registration_deadline"
          type="date"
          defaultValue={tournament?.registration_deadline ?? ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="entry_fee" style={styles.label}>Entry Fee (EUR)</label>
        <input
          id="entry_fee"
          name="entry_fee"
          type="number"
          step="0.01"
          min="0"
          defaultValue={tournament ? (tournament.entry_fee / 100).toFixed(2) : ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="capacity" style={styles.label}>Capacity</label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min="1"
          defaultValue={tournament?.capacity ?? ''}
          style={styles.input}
        />
      </div>

      <div style={styles.fieldGroup}>
        <label htmlFor="points_multiplier" style={styles.label}>Points Multiplier</label>
        <input
          id="points_multiplier"
          name="points_multiplier"
          type="number"
          step="0.1"
          min="0"
          defaultValue={tournament?.points_multiplier ?? 1.0}
          style={styles.input}
        />
      </div>

      <div style={styles.checkboxRow}>
        <input
          id="registration_open"
          name="registration_open"
          type="checkbox"
          defaultChecked={tournament?.registration_open ?? true}
        />
        <label htmlFor="registration_open" style={styles.checkboxLabel}>Registration Open</label>
      </div>

      <div style={styles.checkboxRow}>
        <input
          id="requires_verification"
          name="requires_verification"
          type="checkbox"
          defaultChecked={tournament?.requires_verification ?? false}
        />
        <label htmlFor="requires_verification" style={styles.checkboxLabel}>Requires Identity Verification</label>
      </div>

      {isEdit && (
        <div style={styles.fieldGroup}>
          <label htmlFor="status" style={styles.label}>Status</label>
          <select
            id="status"
            name="status"
            defaultValue={tournament.status}
            style={styles.select}
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      <button type="submit" disabled={isPending} style={{ ...styles.button, opacity: isPending ? 0.7 : 1 }}>
        {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Tournament'}
      </button>
      {error && <p style={{ color: '#f04438', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
    </form>
  )
}
