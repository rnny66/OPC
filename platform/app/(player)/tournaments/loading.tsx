import { Skeleton } from '@/components/ui/skeleton'

export default function TournamentsLoading() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Skeleton width="280px" height="1.5rem" style={{ marginBottom: '0.5rem' }} />
        <Skeleton width="320px" height="0.875rem" />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Skeleton width="140px" height="2.25rem" />
        <Skeleton width="140px" height="2.25rem" />
        <Skeleton width="140px" height="2.25rem" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', padding: '1rem' }}>
            <Skeleton width="80%" height="1rem" style={{ marginBottom: '0.75rem' }} />
            <Skeleton width="60%" height="0.875rem" style={{ marginBottom: '0.375rem' }} />
            <Skeleton width="50%" height="0.875rem" style={{ marginBottom: '0.375rem' }} />
            <Skeleton width="40%" height="0.875rem" />
          </div>
        ))}
      </div>
    </div>
  )
}
