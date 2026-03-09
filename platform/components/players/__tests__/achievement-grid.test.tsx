import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { AchievementGrid } from '../achievement-grid'

const allAchievements = [
  { id: '1', name: 'Champion', description: 'Won a tournament', icon: '🏆' },
  { id: '2', name: 'First Blood', description: 'First tournament', icon: '🎯' },
  { id: '3', name: 'Veteran', description: '20 tournaments', icon: '🏅' },
]

describe('AchievementGrid', () => {
  afterEach(() => cleanup())

  it('renders all achievements', () => {
    render(
      <AchievementGrid
        allAchievements={allAchievements}
        playerAchievements={[]}
      />
    )
    expect(screen.getByText('Champion')).toBeInTheDocument()
    expect(screen.getByText('First Blood')).toBeInTheDocument()
    expect(screen.getByText('Veteran')).toBeInTheDocument()
  })

  it('renders section title', () => {
    render(
      <AchievementGrid allAchievements={allAchievements} playerAchievements={[]} />
    )
    expect(screen.getByText('Achievements')).toBeInTheDocument()
  })
})
