'use client'

import { useState } from 'react'

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
  } as React.CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    marginBottom: '2rem',
    lineHeight: 1.6,
  } as React.CSSProperties,
  card: {
    padding: '2rem',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-secondary)',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  button: {
    padding: '0.75rem 2rem',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  } as React.CSSProperties,
  status: {
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    textAlign: 'center' as const,
    marginTop: '1rem',
  } as React.CSSProperties,
  success: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#22c55e',
  } as React.CSSProperties,
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
  } as React.CSSProperties,
  info: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    marginTop: '1rem',
    lineHeight: 1.5,
  } as React.CSSProperties,
}

type VerifyState = 'idle' | 'loading' | 'completed' | 'error'

export default function VerifyIdentityPage() {
  const [state, setState] = useState<VerifyState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function startVerification() {
    setState('loading')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/verification/create-session', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'Already verified') {
          setState('completed')
          return
        }
        throw new Error(data.error || 'Failed to create session')
      }

      // Redirect to Didit's hosted verification page
      window.location.href = data.url
    } catch (err: any) {
      setState('error')
      setErrorMsg(err.message || 'Something went wrong')
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Identity Verification</h1>
      <p style={styles.subtitle}>
        Verify your identity to register for tournaments that require age verification (18+).
        You only need to do this once.
      </p>

      <div style={styles.card}>
        {state === 'idle' && (
          <>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              You will need a valid government-issued ID and your device camera.
            </p>
            <button style={styles.button} onClick={startVerification}>
              Start Verification
            </button>
          </>
        )}

        {state === 'loading' && (
          <p style={{ color: 'var(--color-text-secondary)' }}>Preparing verification...</p>
        )}

        {state === 'completed' && (
          <div style={{ ...styles.status, ...styles.success }}>
            Your identity has already been verified.
          </div>
        )}

        {state === 'error' && (
          <>
            <div style={{ ...styles.status, ...styles.error }}>
              {errorMsg || 'An error occurred during verification.'}
            </div>
            <button
              style={{ ...styles.button, marginTop: '1rem' }}
              onClick={() => { setState('idle'); startVerification() }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
