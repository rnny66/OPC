'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/test-utils/factories'

const formStyles = {
  card: {
    backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: '2rem',
    border: '1px solid var(--color-border)',
    maxWidth: '560px',
  } as React.CSSProperties,
  field: {
    marginBottom: '1rem',
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
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    outline: 'none',
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
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
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    backgroundColor: 'var(--color-bg-card)',
    border: '2px solid var(--color-border)',
  } as React.CSSProperties,
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  } as React.CSSProperties,
  success: {
    color: '#10b981',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
  error: {
    color: '#f04438',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
  } as React.CSSProperties,
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [city, setCity] = useState(profile.city || '')
  const [homeCountry, setHomeCountry] = useState(profile.home_country || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setUploadingAvatar(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    setAvatarUrl(publicUrl)
    setUploadingAvatar(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const supabase = createBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        city,
        home_country: homeCountry,
        bio,
        avatar_url: avatarUrl || null,
        onboarding_complete: true,
      })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Profile saved!' })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} style={formStyles.card}>
      <div style={formStyles.avatarRow}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" style={formStyles.avatar} />
        ) : (
          <div style={{ ...formStyles.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--color-text-secondary)' }}>
            {displayName?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <label>
          <span style={formStyles.label}>Avatar</span>
          <input
            type="file"
            accept="image/*"
            aria-label="Avatar"
            onChange={handleAvatarUpload}
            disabled={uploadingAvatar}
            style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}
          />
        </label>
      </div>

      <div style={formStyles.field}>
        <label htmlFor="displayName" style={formStyles.label}>Display Name</label>
        <input
          id="displayName"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          style={formStyles.input}
          required
        />
      </div>

      <div style={formStyles.field}>
        <label htmlFor="city" style={formStyles.label}>City</label>
        <input
          id="city"
          value={city}
          onChange={e => setCity(e.target.value)}
          style={formStyles.input}
        />
      </div>

      <div style={formStyles.field}>
        <label htmlFor="homeCountry" style={formStyles.label}>Country</label>
        <input
          id="homeCountry"
          value={homeCountry}
          onChange={e => setHomeCountry(e.target.value)}
          style={formStyles.input}
        />
      </div>

      <div style={formStyles.field}>
        <label htmlFor="bio" style={formStyles.label}>Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={e => setBio(e.target.value)}
          style={formStyles.textarea}
          maxLength={500}
        />
      </div>

      <button type="submit" disabled={loading} style={{ ...formStyles.button, opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Saving...' : 'Save Profile'}
      </button>

      {message && (
        <p style={message.type === 'success' ? formStyles.success : formStyles.error}>
          {message.text}
        </p>
      )}
    </form>
  )
}
