import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div>
      <Skeleton width="180px" height="1.5rem" style={{ marginBottom: '1.5rem' }} />

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <Skeleton width="100px" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="60px" height="1.5rem" />
        </div>
        <div style={{ flex: 1, padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <Skeleton width="80px" height="0.75rem" style={{ marginBottom: '0.5rem' }} />
          <Skeleton width="40px" height="1.5rem" />
        </div>
      </div>

      <Skeleton width="200px" height="1rem" style={{ marginBottom: '1rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="2.5rem" />
        ))}
      </div>
    </div>
  )
}
