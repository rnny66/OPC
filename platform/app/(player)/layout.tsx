import { createSupabaseServer } from '@/lib/supabase/server'
import { SidebarLayout, type NavItem } from '@/components/layout/sidebar-layout'

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let isOrganizer = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isOrganizer = profile?.role === 'organizer' || profile?.role === 'admin'
  }

  const items: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/tournaments', label: 'Tournaments', icon: '🏆' },
  ]

  if (isOrganizer) {
    items.push({ href: '/organizer/dashboard', label: 'Organizer', icon: '⚙️' })
  }

  const bottomItems: NavItem[] = [
    { href: '/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <SidebarLayout items={items} bottomItems={bottomItems}>
      {children}
    </SidebarLayout>
  )
}
