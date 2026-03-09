'use client'

import { useTransition } from 'react'
import { promoteToOrganizer } from '@/lib/actions/admin'

interface User {
  id: string
  display_name: string | null
  email: string
  role: string
  identity_verified: boolean
  created_at: string
}

interface UserTableProps {
  users: User[]
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  color: 'var(--color-text-secondary, #94a3b8)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  borderBottom: '1px solid var(--color-border, #23272f)',
}

const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid var(--color-border, #23272f)',
  color: 'var(--color-text-primary, #f0f0f0)',
}

const badgeBase: React.CSSProperties = {
  display: 'inline-block',
  padding: '0.125rem 0.5rem',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 500,
}

const roleBadgeColors: Record<string, React.CSSProperties> = {
  admin: { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  organizer: { background: 'rgba(234,179,8,0.15)', color: '#eab308' },
  player: { background: 'rgba(21,112,239,0.15)', color: '#1570ef' },
}

const promoteButtonStyle: React.CSSProperties = {
  background: 'var(--color-brand, #1570ef)',
  color: '#fff',
  border: 'none',
  borderRadius: '0.375rem',
  padding: '0.25rem 0.5rem',
  fontSize: '0.75rem',
  fontWeight: 500,
  cursor: 'pointer',
}

function PromoteButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition()

  function handlePromote() {
    startTransition(async () => {
      await promoteToOrganizer(userId)
    })
  }

  return (
    <button
      type="button"
      style={{ ...promoteButtonStyle, opacity: pending ? 0.6 : 1 }}
      onClick={handlePromote}
      disabled={pending}
    >
      {pending ? 'Promoting...' : 'Promote to Organizer'}
    </button>
  )
}

export function UserTable({ users }: UserTableProps) {
  if (users.length === 0) {
    return (
      <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.875rem' }}>
        No users found.
      </p>
    )
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Email</th>
          <th style={thStyle}>Role</th>
          <th style={thStyle}>Verified</th>
          <th style={thStyle}>Joined</th>
          <th style={thStyle}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td style={tdStyle}>{user.display_name || '\u2014'}</td>
            <td style={tdStyle}>{user.email}</td>
            <td style={tdStyle}>
              <span style={{ ...badgeBase, ...(roleBadgeColors[user.role] || roleBadgeColors.player) }}>
                {user.role}
              </span>
            </td>
            <td style={tdStyle}>{user.identity_verified ? '\u2705' : '\u2014'}</td>
            <td style={tdStyle}>
              {new Date(user.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </td>
            <td style={tdStyle}>
              {user.role === 'player' && <PromoteButton userId={user.id} />}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
