import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Dashboard — OPC Europe' }

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
        Dashboard
      </h2>
      <p style={{ color: 'var(--color-text-secondary)' }}>
        Welcome, {user.email}. Your dashboard is under construction.
      </p>
    </div>
  )
}
