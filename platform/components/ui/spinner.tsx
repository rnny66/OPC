import type { CSSProperties } from 'react'

interface SpinnerProps {
  size?: string
  color?: string
  'data-testid'?: string
}

export function Spinner({ size = '1rem', color = 'currentColor', ...props }: SpinnerProps) {
  const style: CSSProperties = {
    display: 'inline-block',
    width: size,
    height: size,
    border: '2px solid transparent',
    borderTopColor: color,
    borderRightColor: color,
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
    flexShrink: 0,
  }

  return <span style={style} role="status" aria-label="Loading" {...props} />
}
