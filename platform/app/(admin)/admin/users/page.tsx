import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserTable } from '@/components/admin/user-table'

export const metadata = { title: 'User Management — OPC Europe' }

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>
}) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const params = await searchParams
  const q = params.q?.trim() || ''
  const roleFilter = params.role || ''

  let query = supabase
    .from('profiles')
    .select('id, display_name, email, role, identity_verified, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (q) {
    query = query.or(`display_name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  if (roleFilter) {
    query = query.eq('role', roleFilter)
  }

  const { data: users } = await query

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-bg-primary, #0c0e12)',
    border: '1px solid var(--color-border, #23272f)',
    borderRadius: '0.375rem',
    color: 'var(--color-text-primary, #f0f0f0)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    flex: 1,
    minWidth: 0,
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    flex: 'none',
    width: 'auto',
  }

  const buttonStyle: React.CSSProperties = {
    background: 'var(--color-brand, #1570ef)',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  }

  return (
    <div>
      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: 'var(--color-text-primary, #f0f0f0)',
        marginBottom: '2rem',
      }}>
        User Management
      </h1>

      <form
        method="GET"
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          name="q"
          placeholder="Search by name or email..."
          defaultValue={q}
          style={inputStyle}
        />
        <select name="role" defaultValue={roleFilter} style={selectStyle}>
          <option value="">All roles</option>
          <option value="player">Player</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" style={buttonStyle}>
          Search
        </button>
      </form>

      <div style={{
        background: 'var(--color-bg-secondary, #13151a)',
        border: '1px solid var(--color-border, #23272f)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
      }}>
        <UserTable users={users || []} />
      </div>
    </div>
  )
}
