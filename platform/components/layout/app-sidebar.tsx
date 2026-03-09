import { createSupabaseServer } from '@/lib/supabase/server'
import { SidebarLayout, type NavSection } from '@/components/layout/sidebar-layout'

export async function AppSidebar({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let role = 'player'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? 'player'
  }

  const isOrganizer = role === 'organizer' || role === 'admin'
  const isAdmin = role === 'admin'

  const sections: NavSection[] = [
    {
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/rankings', label: 'Rankings', icon: '🏅' },
        { href: '/tournaments', label: 'Tournaments', icon: '🏆' },
      ],
    },
  ]

  if (isOrganizer) {
    sections.push({
      label: 'Organizer',
      items: [
        { href: '/organizer/dashboard', label: 'Dashboard', icon: '📋' },
        { href: '/organizer/tournaments/new', label: 'New Tournament', icon: '➕' },
      ],
    })
  }

  if (isAdmin) {
    sections.push({
      label: 'Admin',
      items: [
        { href: '/admin/points-config', label: 'Points Config', icon: '🎯' },
      ],
    })
  }

  const bottomItems = [
    { href: '/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <SidebarLayout sections={sections} bottomItems={bottomItems}>
      {children}
    </SidebarLayout>
  )
}
