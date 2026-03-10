import { AppSidebar } from '@/components/layout/app-sidebar'
import '../globals.css'

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return <AppSidebar>{children}</AppSidebar>
}
