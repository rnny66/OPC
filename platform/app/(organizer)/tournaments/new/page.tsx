import { TournamentForm } from '@/components/organizer/tournament-form'

export const metadata = { title: 'Create Tournament — OPC Europe' }

export default function CreateTournamentPage() {
  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
        Create Tournament
      </h2>
      <TournamentForm />
    </div>
  )
}
