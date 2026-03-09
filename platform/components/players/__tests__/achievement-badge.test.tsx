import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { AchievementBadge } from '../achievement-badge'

const mockAchievement = {
  id: '1',
  name: 'Champion',
  description: 'Won a tournament',
  icon: '🏆',
}

describe('AchievementBadge', () => {
  afterEach(() => cleanup())

  it('renders achievement name and icon', () => {
    render(<AchievementBadge achievement={mockAchievement} earned={true} />)
    expect(screen.getByText('Champion')).toBeInTheDocument()
    expect(screen.getByText('🏆')).toBeInTheDocument()
  })

  it('shows earned date when earned', () => {
    render(
      <AchievementBadge
        achievement={mockAchievement}
        earned={true}
        awardedAt="2026-01-15T00:00:00Z"
      />
    )
    expect(screen.getByText(/earned/i)).toBeInTheDocument()
  })

  it('applies greyed-out styling when unearned', () => {
    const { container } = render(
      <AchievementBadge achievement={mockAchievement} earned={false} />
    )
    const badge = container.firstElementChild as HTMLElement
    expect(badge.style.opacity).toBe('0.4')
  })

  it('shows description', () => {
    render(<AchievementBadge achievement={mockAchievement} earned={true} />)
    expect(screen.getByText('Won a tournament')).toBeInTheDocument()
  })
})
