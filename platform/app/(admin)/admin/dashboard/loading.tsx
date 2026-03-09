import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboardLoading() {
  return (
    <div>
      <Skeleton width="200px" height="1.75rem" style={{ marginBottom: '2rem' }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
            <Skeleton width="90px" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="50px" height="1.5rem" />
          </div>
        ))}
      </div>

      <Skeleton width="140px" height="1rem" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="2.5rem" />
        ))}
      </div>
    </div>
  )
}
