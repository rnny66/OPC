import { createSupabaseServer } from '@/lib/supabase/server'
import { SidebarLayout, type NavSection } from '@/components/layout/sidebar-layout'
import { getFeatureFlags } from '@/lib/feature-flags'

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

  const flags = await getFeatureFlags()

  const playerItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  ]
  if (flags.get('rankings')) {
    playerItems.push({ href: '/rankings', label: 'Rankings', icon: '🏅' })
  }
  if (flags.get('tournament_browsing')) {
    playerItems.push({ href: '/tournaments', label: 'Tournaments', icon: '🏆' })
  }

  const sections: NavSection[] = [{ items: playerItems }]

  if (isOrganizer && flags.get('organizer_tools')) {
    sections.push({
      label: 'Organizer',
      items: [
        { href: '/organizer/dashboard', label: 'Dashboard', icon: '📋' },
        { href: '/organizer/tournaments/new', label: 'New Tournament', icon: '➕' },
      ],
    })
  }

  if (isAdmin && flags.get('admin_panel')) {
    sections.push({
      label: 'Admin',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/admin/users', label: 'Users', icon: '👥' },
        { href: '/admin/organizers', label: 'Organizers', icon: '📋' },
        { href: '/admin/tournaments', label: 'Tournaments', icon: '🏆' },
        { href: '/admin/points-config', label: 'Points Config', icon: '🎯' },
      ],
    })
  }

  if (isAdmin && flags.get('cms_admin')) {
    sections.push({
      label: 'Content',
      items: [
        { href: '/cms', label: 'CMS', icon: '📝' },
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
