'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { cancelTournamentAdmin } from '@/lib/actions/admin'

export interface TournamentRow {
  id: string
  name: string
  city: string
  country: string
  start_date: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  organizer_name: string
  registration_count: number
}

interface AdminTournamentTableProps {
  tournaments: TournamentRow[]
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-bg-secondary, #13151a)',
  border: '1px solid var(--color-border, #23272f)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
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
  fontSize: '0.875rem',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--color-brand, #1570ef)',
  textDecoration: 'none',
  fontWeight: 500,
}

const smallButtonStyle: React.CSSProperties = {
  background: 'var(--color-error, #ef4444)',
  color: '#fff',
  border: 'none',
  borderRadius: '0.375rem',
  padding: '0.25rem 0.5rem',
  fontSize: '0.75rem',
  fontWeight: 500,
  cursor: 'pointer',
}

const actionLinkStyle: React.CSSProperties = {
  color: 'var(--color-brand, #1570ef)',
  textDecoration: 'none',
  fontSize: '0.75rem',
  fontWeight: 500,
  marginRight: '0.5rem',
}

const statusColors: Record<string, string> = {
  upcoming: 'var(--color-brand, #1570ef)',
  ongoing: '#22c55e',
  completed: 'var(--color-text-secondary, #94a3b8)',
  cancelled: 'var(--color-error, #ef4444)',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.125rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 500,
        color: '#fff',
        background: statusColors[status] ?? 'var(--color-text-secondary, #94a3b8)',
      }}
    >
      {status}
    </span>
  )
}

function TournamentRowItem({ tournament }: { tournament: TournamentRow }) {
  const [isPending, startTransition] = useTransition()

  const handleCancel = () => {
    if (!confirm(`Cancel tournament "${tournament.name}"?`)) return
    startTransition(async () => {
      await cancelTournamentAdmin(tournament.id)
    })
  }

  const showCancel = tournament.status !== 'cancelled' && tournament.status !== 'completed'

  return (
    <tr>
      <td style={tdStyle}>
        <Link href={`/organizer/tournaments/${tournament.id}`} style={linkStyle}>
          {tournament.name}
        </Link>
      </td>
      <td style={tdStyle}>
        {tournament.city}, {tournament.country}
      </td>
      <td style={tdStyle}>{tournament.start_date}</td>
      <td style={tdStyle}>{tournament.organizer_name}</td>
      <td style={tdStyle}>
        <StatusBadge status={tournament.status} />
      </td>
      <td style={{ ...tdStyle, textAlign: 'right' }}>{tournament.registration_count}</td>
      <td style={tdStyle}>
        <Link
          href={`/organizer/tournaments/${tournament.id}/registrations`}
          style={actionLinkStyle}
        >
          Regs
        </Link>
        <Link
          href={`/organizer/tournaments/${tournament.id}/results`}
          style={actionLinkStyle}
        >
          Results
        </Link>
        {showCancel && (
          <button
            onClick={handleCancel}
            disabled={isPending}
            style={{
              ...smallButtonStyle,
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
      </td>
    </tr>
  )
}

export function AdminTournamentTable({ tournaments }: AdminTournamentTableProps) {
  if (tournaments.length === 0) {
    return (
      <div style={cardStyle}>
        <p style={{ color: 'var(--color-text-secondary, #94a3b8)', textAlign: 'center' }}>
          No tournaments found.
        </p>
      </div>
    )
  }

  return (
    <div style={{ ...cardStyle, overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>Location</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Organizer</th>
            <th style={thStyle}>Status</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Regs</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map((t) => (
            <TournamentRowItem key={t.id} tournament={t} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
