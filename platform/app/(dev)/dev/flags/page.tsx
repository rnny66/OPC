import { createSupabaseServer } from '@/lib/supabase/server'
import { FlagToggleList } from '@/components/feature-flags/flag-toggle'
import type { FeatureFlag } from '@/lib/feature-flags-shared'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feature Flags — Dev',
  robots: 'noindex, nofollow',
}

export default async function DevFlagsPage({
  searchParams,
}: {
  searchParams: Promise<{ secret?: string }>
}) {
  const params = await searchParams
  if (params.secret !== process.env.DEV_SECRET) {
    return (
      <div style={{ padding: '2rem', color: 'var(--color-text-secondary)' }}>
        Not found
      </div>
    )
  }

  const supabase = await createSupabaseServer()
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('*')
    .order('sort_order')

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '0.25rem',
        }}
      >
        Feature Flags
      </h1>
      <p
        style={{
          color: 'var(--color-text-secondary)',
          fontSize: '0.9rem',
          marginBottom: '2rem',
        }}
      >
        Toggle features on/off for the client. Changes take effect immediately.
      </p>
      <FlagToggleList flags={(flags as FeatureFlag[]) ?? []} secret={params.secret!} />
    </div>
  )
}
