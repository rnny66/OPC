import { Skeleton } from '@/components/ui/skeleton'

export default function OrganizerDashboardLoading() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <Skeleton width="220px" height="1.5rem" />
        <Skeleton width="140px" height="2.25rem" style={{ borderRadius: 'var(--radius-md)' }} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <Skeleton width="100px" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="50px" height="1.5rem" />
          </div>
        ))}
      </div>

      <Skeleton width="160px" height="1rem" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height="2.5rem" />
        ))}
      </div>
    </div>
  )
}
