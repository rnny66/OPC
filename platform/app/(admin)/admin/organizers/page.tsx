import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InviteOrganizerForm } from '@/components/admin/invite-organizer-form'

export const metadata = { title: 'Organizer Invitations — OPC Europe' }

const cardStyle: React.CSSProperties = {
  background: 'var(--color-bg-secondary, #13151a)',
  border: '1px solid var(--color-border, #23272f)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  marginBottom: '2rem',
}

const headingStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: 'var(--color-text-primary, #f0f0f0)',
  marginBottom: '1rem',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.625rem 0.75rem',
  borderBottom: '1px solid var(--color-border, #23272f)',
  color: 'var(--color-text-secondary, #94a3b8)',
  fontSize: '0.8125rem',
  fontWeight: 500,
}

const tdStyle: React.CSSProperties = {
  padding: '0.625rem 0.75rem',
  borderBottom: '1px solid var(--color-border, #23272f)',
  color: 'var(--color-text-primary, #f0f0f0)',
  fontSize: '0.875rem',
}

const emptyStyle: React.CSSProperties = {
  padding: '2rem',
  textAlign: 'center',
  color: 'var(--color-text-secondary, #94a3b8)',
  fontSize: '0.875rem',
}

export default async function OrganizersPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: invitations } = await supabase
    .from('organizer_invitations')
    .select('id, email, status, created_at, profiles!invited_by(display_name)')
    .order('created_at', { ascending: false })

  const { data: organizers } = await supabase
    .from('profiles')
    .select('id, display_name, email, created_at')
    .eq('role', 'organizer')
    .order('display_name')

  return (
    <div>
      <h1 style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        color: 'var(--color-text-primary, #f0f0f0)',
        marginBottom: '2rem',
      }}>
        Organizer Invitations
      </h1>

      {/* Send Invitation */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>Send Invitation</h2>
        <InviteOrganizerForm />
      </div>

      {/* Pending & Accepted Invitations */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>Pending &amp; Accepted Invitations</h2>
        {invitations && invitations.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Invited By</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv: Record<string, unknown>) => {
                  const invitedByProfile = inv.profiles as { display_name: string } | null
                  const status = inv.status as string
                  const isAccepted = status === 'accepted'

                  return (
                    <tr key={inv.id as string}>
                      <td style={tdStyle}>{inv.email as string}</td>
                      <td style={tdStyle}>{invitedByProfile?.display_name ?? 'Unknown'}</td>
                      <td style={tdStyle}>
                        {new Date(inv.created_at as string).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.625rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: isAccepted
                            ? 'rgba(34, 197, 94, 0.15)'
                            : 'rgba(234, 179, 8, 0.15)',
                          color: isAccepted ? '#22c55e' : '#eab308',
                        }}>
                          {isAccepted ? 'Accepted' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={emptyStyle}>No invitations sent yet.</p>
        )}
      </div>

      {/* Current Organizers */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>Current Organizers</h2>
        {organizers && organizers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Since</th>
                </tr>
              </thead>
              <tbody>
                {organizers.map((org: Record<string, unknown>) => (
                  <tr key={org.id as string}>
                    <td style={tdStyle}>{(org.display_name as string) || 'Unnamed'}</td>
                    <td style={tdStyle}>{org.email as string}</td>
                    <td style={tdStyle}>
                      {new Date(org.created_at as string).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={emptyStyle}>No organizers yet.</p>
        )}
      </div>
    </div>
  )
}
