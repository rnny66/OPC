import { Skeleton } from '@/components/ui/skeleton'

export default function TournamentDetailLoading() {
  return (
    <div style={{ maxWidth: '720px' }}>
      <Skeleton width="60%" height="1.75rem" style={{ marginBottom: '1rem' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem' }}>
            <Skeleton width="120px" height="0.875rem" />
            <Skeleton width="200px" height="0.875rem" />
          </div>
        ))}
      </div>

      <Skeleton height="3rem" style={{ marginBottom: '1.5rem' }} />

      <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
        <Skeleton width="200px" height="0.875rem" />
      </div>

      <Skeleton height="2.75rem" style={{ borderRadius: 'var(--radius-md)' }} />
    </div>
  )
}
