'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const formStyles = {
  card: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--color-border)',
  } as React.CSSProperties,
  field: { marginBottom: '1rem' } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    marginBottom: '0.375rem',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
  } as React.CSSProperties,
  button: {
    width: '100%',
    padding: '0.625rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: 'var(--color-brand)',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  socialButton: {
    width: '100%',
    padding: '0.625rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1.5rem 0',
    color: 'var(--color-text-tertiary)',
    fontSize: '0.75rem',
  } as React.CSSProperties,
  line: {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--color-border)',
  } as React.CSSProperties,
  error: {
    color: '#f04438',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
  footer: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
}

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createBrowserClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  async function handleOAuth(provider: 'google' | 'facebook') {
    const supabase = createBrowserClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (sent) {
    return (
      <div style={formStyles.card}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          Check your email
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
        </p>
      </div>
    )
  }

  return (
    <div style={formStyles.card}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        Create your account
      </h2>

      {error && <p style={formStyles.error}>{error}</p>}

      <form onSubmit={handleSignup}>
        <div style={formStyles.field}>
          <label htmlFor="email" style={formStyles.label}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={formStyles.input}
          />
        </div>
        <div style={formStyles.field}>
          <label htmlFor="password" style={formStyles.label}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            required
            minLength={6}
            style={formStyles.input}
          />
        </div>
        <button type="submit" disabled={loading} style={formStyles.button}>
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <div style={formStyles.divider}>
        <div style={formStyles.line} />
        <span>or</span>
        <div style={formStyles.line} />
      </div>

      <button onClick={() => handleOAuth('google')} style={formStyles.socialButton}>
        Continue with Google
      </button>
      <button onClick={() => handleOAuth('facebook')} style={formStyles.socialButton}>
        Continue with Facebook
      </button>

      <p style={formStyles.footer}>
        Already have an account?{' '}
        <Link href="/login">Log in</Link>
      </p>
    </div>
  )
}
