import { AppSidebar } from '@/components/layout/app-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppSidebar>{children}</AppSidebar>
}
