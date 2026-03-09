import { AppSidebar } from '@/components/layout/app-sidebar'

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return <AppSidebar>{children}</AppSidebar>
}
