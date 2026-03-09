import type { CSSProperties } from 'react'

interface SkeletonProps {
  width?: string
  height?: string
  circle?: boolean
  style?: CSSProperties
  'data-testid'?: string
}

const baseStyle: CSSProperties = {
  background: 'linear-gradient(90deg, var(--color-bg-secondary) 25%, rgba(255,255,255,0.04) 50%, var(--color-bg-secondary) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
  borderRadius: '0.375rem',
}

export function Skeleton({ width = '100%', height = '1rem', circle = false, style, ...props }: SkeletonProps) {
  return (
    <div
      style={{
        ...baseStyle,
        width,
        height,
        borderRadius: circle ? '50%' : '0.375rem',
        ...style,
      }}
      {...props}
    />
  )
}
