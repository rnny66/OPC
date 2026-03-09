'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export interface NavItem {
  href: string
  label: string
  icon: string
}

interface SidebarLayoutProps {
  items: NavItem[]
  bottomItems?: NavItem[]
  title?: string
  children: React.ReactNode
}

const linkStyle = (
  isActive: boolean,
  collapsed: boolean
): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: collapsed ? '0.625rem 0' : '0.625rem 0.75rem',
  justifyContent: collapsed ? 'center' : 'flex-start',
  borderRadius: '0.375rem',
  textDecoration: 'none',
  fontSize: '0.875rem',
  fontWeight: isActive ? 600 : 500,
  color: isActive
    ? 'var(--color-brand, #1570ef)'
    : 'var(--color-text-secondary, #8b8b8b)',
  backgroundColor: isActive ? 'rgba(21, 112, 239, 0.1)' : 'transparent',
  whiteSpace: 'nowrap',
  transition: 'background-color 0.15s ease, color 0.15s ease',
})

export function SidebarLayout({
  items,
  bottomItems = [],
  title = 'OPC Europe',
  children,
}: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const sidebarWidth = collapsed ? '4rem' : '15rem'

  function isActive(href: string) {
    return (
      pathname === href ||
      (href !== '/dashboard' &&
        href !== '/organizer/dashboard' &&
        pathname.startsWith(href))
    )
  }

  async function handleSignOut() {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: sidebarWidth,
          backgroundColor: 'var(--color-bg-secondary, #13151a)',
          borderRight: '1px solid var(--color-border, #23272f)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          zIndex: 50,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '1.25rem 0' : '1.25rem 1rem',
            borderBottom: '1px solid var(--color-border, #23272f)',
            minHeight: '3.5rem',
          }}
        >
          {!collapsed && (
            <span
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--color-text-primary, #f0f0f0)',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary, #8b8b8b)',
              cursor: 'pointer',
              padding: '0.25rem',
              fontSize: '1.125rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {collapsed ? '☰' : '✕'}
          </button>
        </div>

        {/* Main nav items */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            padding: '0.75rem 0.5rem',
            flex: 1,
          }}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={linkStyle(isActive(item.href), collapsed)}
            >
              <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom section: profile + sign out */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            padding: '0.75rem 0.5rem',
            borderTop: '1px solid var(--color-border, #23272f)',
          }}
        >
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={linkStyle(isActive(item.href), collapsed)}
            >
              <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </Link>
          ))}
          <button
            onClick={handleSignOut}
            title={collapsed ? 'Sign Out' : undefined}
            style={{
              ...linkStyle(false, collapsed),
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>🚪</span>
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        style={{
          marginLeft: sidebarWidth,
          flex: 1,
          padding: '2rem',
          transition: 'margin-left 0.2s ease',
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  )
}
