'use client'

import { useTransition, useState } from 'react'
import { toggleFeatureFlag } from '@/lib/actions/feature-flags'
import { FLAG_DEPENDENCIES } from '@/lib/feature-flags-shared'
import type { FeatureFlag } from '@/lib/feature-flags-shared'

const TIER_LABELS: Record<number, string> = {
  2: 'Browsing',
  3: 'Interaction',
  4: 'Organizer',
  5: 'Public Data',
  6: 'Admin',
  7: 'Optional',
}

const TIER_COLORS: Record<number, string> = {
  2: '#22c55e',
  3: '#3b82f6',
  4: '#a855f7',
  5: '#f59e0b',
  6: '#ef4444',
  7: '#6b7280',
}

export function FlagToggleList({
  flags,
  secret,
}: {
  flags: FeatureFlag[]
  secret: string
}) {
  const grouped = flags.reduce<Record<number, FeatureFlag[]>>((acc, flag) => {
    const tier = flag.tier
    if (!acc[tier]) acc[tier] = []
    acc[tier].push(flag)
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {Object.entries(grouped)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([tier, tierFlags]) => (
          <div key={tier}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: TIER_COLORS[Number(tier)] ?? '#6b7280',
                  color: '#fff',
                }}
              >
                Tier {tier}
              </span>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {TIER_LABELS[Number(tier)] ?? ''}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {tierFlags.map((flag) => (
                <FlagRow key={flag.key} flag={flag} secret={secret} />
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}

function FlagRow({ flag, secret }: { flag: FeatureFlag; secret: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(flag.enabled)
  const dependency = FLAG_DEPENDENCIES[flag.key]

  function handleToggle() {
    const newValue = !enabled
    setError(null)
    startTransition(async () => {
      const result = await toggleFeatureFlag(flag.key, newValue, secret)
      if (result.error) {
        setError(result.error)
      } else {
        setEnabled(newValue)
      }
    })
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        background: 'var(--color-bg-secondary, #1a1d23)',
        borderRadius: '8px',
        border: '1px solid var(--color-border, #2a2d35)',
        opacity: isPending ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{flag.label}</span>
          <code
            style={{
              fontSize: '0.7rem',
              color: 'var(--color-text-tertiary, #666)',
              background: 'var(--color-bg-tertiary, #12141a)',
              padding: '0.1rem 0.35rem',
              borderRadius: '3px',
            }}
          >
            {flag.key}
          </code>
        </div>
        {flag.description && (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-text-secondary)',
              margin: '0.25rem 0 0',
            }}
          >
            {flag.description}
          </p>
        )}
        {dependency && (
          <p
            style={{
              fontSize: '0.75rem',
              color: '#f59e0b',
              margin: '0.25rem 0 0',
            }}
          >
            Requires: {dependency}
          </p>
        )}
        {error && (
          <p
            style={{
              fontSize: '0.75rem',
              color: '#ef4444',
              margin: '0.25rem 0 0',
            }}
          >
            {error}
          </p>
        )}
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        style={{
          position: 'relative',
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          border: 'none',
          cursor: isPending ? 'wait' : 'pointer',
          background: enabled ? '#1570ef' : '#3a3d45',
          transition: 'background 0.2s',
          flexShrink: 0,
          marginLeft: '1rem',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '2px',
            left: enabled ? '22px' : '2px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s',
          }}
        />
      </button>
    </div>
  )
}
