import { SidebarLayout, type NavItem } from '@/components/layout/sidebar-layout'

const items: NavItem[] = [
  { href: '/organizer/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/organizer/tournaments/new', label: 'New Tournament', icon: '➕' },
  { href: '/tournaments', label: 'Tournaments', icon: '🏆' },
  { href: '/dashboard', label: 'Player View', icon: '🔙' },
]

const bottomItems: NavItem[] = [
  { href: '/profile', label: 'Profile', icon: '👤' },
]

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout items={items} bottomItems={bottomItems} title="OPC Organizer">
      {children}
    </SidebarLayout>
  )
}
