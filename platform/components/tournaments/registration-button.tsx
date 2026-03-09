'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const styles = {
  button: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  status: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  success: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    fontSize: '0.875rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  error: {
    color: '#f04438',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  link: {
    color: 'var(--color-brand)',
    textDecoration: 'underline',
  } as React.CSSProperties,
}

export function RegistrationButton({
  tournamentId,
  isLoggedIn,
  isRegistered,
  isOnboarded,
  isVerified,
  requiresVerification,
  registrationOpen,
  isFull,
  isPastDeadline,
}: {
  tournamentId: string
  isLoggedIn: boolean
  isRegistered: boolean
  isOnboarded: boolean
  isVerified: boolean
  requiresVerification: boolean
  registrationOpen: boolean
  isFull: boolean
  isPastDeadline: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registered, setRegistered] = useState(isRegistered)
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <div style={styles.status}>
        <Link href={`/login?redirect=/tournaments/${tournamentId}`} style={styles.link}>
          Log in to register
        </Link>
      </div>
    )
  }

  if (registered) {
    return <div style={styles.success}>You are registered for this tournament.</div>
  }

  if (!isOnboarded) {
    return (
      <div style={styles.status}>
        <Link href="/profile" style={styles.link}>Complete your profile</Link> to register for tournaments.
      </div>
    )
  }

  if (requiresVerification && !isVerified) {
    return <div style={styles.status}>Identity verification required to register for this tournament.</div>
  }

  if (!registrationOpen) {
    return <div style={styles.status}>Registration closed.</div>
  }

  if (isPastDeadline) {
    return <div style={styles.status}>Registration deadline passed.</div>
  }

  if (isFull) {
    return <div style={styles.status}>Tournament is full.</div>
  }

  async function handleRegister() {
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: regError } = await supabase
      .from('tournament_registrations')
      .insert({ tournament_id: tournamentId, player_id: user.id })

    if (regError) {
      setError(regError.message)
      setLoading(false)
      return
    }

    setRegistered(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <div>
      <button
        style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? 'Registering...' : 'Register for this tournament'}
      </button>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  )
}
