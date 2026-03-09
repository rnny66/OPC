'use client'

import { useState } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const styles = {
  button: {
    padding: '0.375rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: '0.75rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  confirm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
  } as React.CSSProperties,
  confirmButton: {
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    backgroundColor: '#f04438',
    color: '#fff',
    fontSize: '0.75rem',
    cursor: 'pointer',
  } as React.CSSProperties,
}

export function CancelRegistrationButton({ registrationId }: { registrationId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleCancel() {
    setLoading(true)
    const supabase = createBrowserClient()
    await supabase
      .from('tournament_registrations')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', registrationId)

    router.refresh()
  }

  if (confirming) {
    return (
      <div style={styles.confirm}>
        <span>Are you sure?</span>
        <button style={styles.confirmButton} onClick={handleCancel} disabled={loading}>
          {loading ? '...' : 'Yes, cancel'}
        </button>
        <button style={styles.button} onClick={() => setConfirming(false)}>
          No
        </button>
      </div>
    )
  }

  return (
    <button style={styles.button} onClick={() => setConfirming(true)}>
      Cancel
    </button>
  )
}
