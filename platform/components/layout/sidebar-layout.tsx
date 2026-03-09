'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export interface NavItem {
  href: string
  label: string
  icon: string
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

interface SidebarLayoutProps {
  sections: NavSection[]
  bottomItems?: NavItem[]
  children: React.ReactNode
}

const getLinkStyle = (
  isActive: boolean,
  isHovered: boolean,
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
  color: isActive || isHovered
    ? 'var(--color-brand, #1570ef)'
    : 'var(--color-text-secondary, #8b8b8b)',
  backgroundColor: isActive
    ? 'rgba(21, 112, 239, 0.1)'
    : isHovered
      ? 'rgba(21, 112, 239, 0.08)'
      : 'transparent',
  whiteSpace: 'nowrap',
  transition: 'background-color 0.2s ease, color 0.2s ease',
  outline: 'none',
})

function NavLink({ href, title, isActive, collapsed, onNavigate, children }: {
  href: string
  title?: string
  isActive: boolean
  collapsed: boolean
  onNavigate?: (href: string) => void
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={href}
      title={title}
      style={getLinkStyle(isActive, hovered, collapsed)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate?.(href)}
    >
      {children}
    </Link>
  )
}

function NavButton({ onClick, title, collapsed, children }: {
  onClick: () => void
  title?: string
  collapsed: boolean
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...getLinkStyle(false, hovered, collapsed),
        background: hovered ? 'rgba(21, 112, 239, 0.08)' : 'none',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
      }}
    >
      {children}
    </button>
  )
}

export function SidebarLayout({
  sections,
  bottomItems = [],
  children,
}: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [collapseHovered, setCollapseHovered] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  // Clear pending state when pathname catches up
  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  const sidebarWidth = collapsed ? '4rem' : '15rem'

  // Use pendingHref for optimistic highlight, fall back to actual pathname
  const activePath = pendingHref ?? pathname

  function isActive(href: string) {
    return (
      activePath === href ||
      (href !== '/dashboard' &&
        href !== '/organizer/dashboard' &&
        activePath.startsWith(href))
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
              OPC Europe
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            onMouseEnter={() => setCollapseHovered(true)}
            onMouseLeave={() => setCollapseHovered(false)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              background: collapseHovered ? 'rgba(21, 112, 239, 0.08)' : 'none',
              border: 'none',
              color: collapseHovered ? 'var(--color-brand, #1570ef)' : 'var(--color-text-secondary, #8b8b8b)',
              cursor: 'pointer',
              padding: '0.375rem',
              fontSize: '1.125rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderRadius: '0.375rem',
              transition: 'background-color 0.2s ease, color 0.2s ease',
            }}
          >
            {collapsed ? '☰' : '✕'}
          </button>
        </div>

        {/* Main nav sections */}
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            padding: '0.75rem 0.5rem',
            flex: 1,
          }}
        >
          {sections.map((section, sectionIndex) => (
            <div key={section.label ?? sectionIndex}>
              {section.label && (
                collapsed ? (
                  <div
                    style={{
                      borderTop: '1px solid var(--color-border, #23272f)',
                      margin: '0.5rem 0.75rem',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: '0.5rem 0.75rem 0.25rem',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: 'var(--color-text-secondary, #8b8b8b)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                      marginTop: sectionIndex > 0 ? '0.25rem' : 0,
                    }}
                  >
                    {section.label}
                  </div>
                )
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  isActive={isActive(item.href)}
                  collapsed={collapsed}
                  onNavigate={setPendingHref}
                >
                  <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {!collapsed && item.label}
                </NavLink>
              ))}
            </div>
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
            <NavLink
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              isActive={isActive(item.href)}
              collapsed={collapsed}
              onNavigate={setPendingHref}
            >
              <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </NavLink>
          ))}
          <NavButton
            onClick={handleSignOut}
            title={collapsed ? 'Sign Out' : undefined}
            collapsed={collapsed}
          >
            <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>🚪</span>
            {!collapsed && 'Sign Out'}
          </NavButton>
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
