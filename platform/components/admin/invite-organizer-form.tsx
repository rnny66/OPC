'use client'

import { useState, useTransition } from 'react'
import { inviteOrganizer } from '@/lib/actions/admin'
import { useToast } from '@/components/ui/toast'

export function InviteOrganizerForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    startTransition(async () => {
      const result = await inviteOrganizer(email)

      if (result?.error) {
        setMessage({ type: 'error', text: result.error })
        toast({ type: 'error', message: result.error })
      } else {
        setMessage({ type: 'success', text: `Invitation sent to ${email}` })
        toast({ type: 'success', message: 'Invitation sent' })
        setEmail('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <input
          type="email"
          required
          placeholder="organizer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            flex: 1,
            padding: '0.625rem 0.875rem',
            background: 'var(--color-bg-primary, #0c0e12)',
            border: '1px solid var(--color-border, #23272f)',
            borderRadius: '0.5rem',
            color: 'var(--color-text-primary, #f0f0f0)',
            fontSize: '0.875rem',
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '0.625rem 1.25rem',
            background: 'var(--color-brand, #1570ef)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {isPending ? 'Sending...' : 'Send Invite'}
        </button>
      </div>

      {message && (
        <p style={{
          marginTop: '0.75rem',
          fontSize: '0.875rem',
          color: message.type === 'success' ? '#22c55e' : '#ef4444',
        }}>
          {message.text}
        </p>
      )}
    </form>
  )
}
