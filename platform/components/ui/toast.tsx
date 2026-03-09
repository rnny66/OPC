'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning'

interface Toast {
  id: number
  type: ToastType
  message: string
  exiting?: boolean
}

interface ToastContextValue {
  toast: (opts: { type: ToastType; message: string }) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TOAST_DURATION = 3000
const EXIT_DURATION = 300

const typeColors: Record<ToastType, string> = {
  success: '#10b981',
  error: '#f04438',
  warning: '#f59e0b',
}

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ type, message }: { type: ToastType; message: string }) => {
    const id = nextId++
    setToasts(prev => [...prev, { id, type, message }])

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, EXIT_DURATION)
    }, TOAST_DURATION)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {toasts.map(t => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--color-bg-card, #1f242f)',
                border: '1px solid var(--color-border, #23272f)',
                boxShadow: 'var(--shadow-lg)',
                borderLeft: `3px solid ${typeColors[t.type]}`,
                fontSize: '0.875rem',
                color: 'var(--color-text-primary, #f0f0f0)',
                animation: t.exiting ? 'toast-out 0.3s ease forwards' : 'toast-in 0.3s ease',
                pointerEvents: 'auto',
                minWidth: '240px',
                maxWidth: '400px',
              }}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
