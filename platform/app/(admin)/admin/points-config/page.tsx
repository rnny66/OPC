import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PointsConfigEditor } from '@/components/admin/points-config-editor'

export const metadata = { title: 'Points Config — OPC Europe' }

export default async function PointsConfigPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: brackets } = await supabase
    .from('default_points_brackets')
    .select('*')
    .order('placement_min')

  const { data: countries } = await supabase
    .from('country_config')
    .select('*')
    .order('country_name')

  return (
    <div>
      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: 'var(--color-text-primary, #f0f0f0)',
        marginBottom: '2rem',
      }}>
        Points Configuration
      </h1>
      <PointsConfigEditor
        brackets={brackets ?? []}
        countries={countries ?? []}
      />
    </div>
  )
}
