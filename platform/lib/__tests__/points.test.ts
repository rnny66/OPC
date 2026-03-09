import { describe, it, expect } from 'vitest'
import { calculateBasePoints, calculatePoints, type PointsBracket } from '../points'

describe('calculateBasePoints', () => {
  it.each([
    [1, 1000],
    [2, 750],
    [3, 500],
    [4, 400],
    [5, 350],
    [6, 300],
    [10, 300],
    [11, 200],
    [20, 200],
    [21, 100],
    [50, 100],
    [51, 50],
    [100, 50],
  ])('placement %i returns %i points', (placement, expected) => {
    expect(calculateBasePoints(placement)).toBe(expected)
  })

  it('returns 0 for invalid placement (0 or negative)', () => {
    expect(calculateBasePoints(0)).toBe(0)
    expect(calculateBasePoints(-1)).toBe(0)
  })
})

describe('calculatePoints', () => {
  it('applies multiplier correctly', () => {
    expect(calculatePoints(1, 1.5)).toBe(1500)
    expect(calculatePoints(2, 2.0)).toBe(1500)
    expect(calculatePoints(3, 1.0)).toBe(500)
  })

  it('floors the result', () => {
    expect(calculatePoints(1, 1.3)).toBe(1300)
    expect(calculatePoints(6, 1.5)).toBe(450)
  })
})

describe('calculateBasePoints with custom brackets', () => {
  const customBrackets: PointsBracket[] = [
    { min: 1, max: 1, points: 500 },
    { min: 2, max: 3, points: 250 },
    { min: 4, max: null, points: 100 },
  ]

  it('uses custom brackets when provided', () => {
    expect(calculateBasePoints(1, customBrackets)).toBe(500)
    expect(calculateBasePoints(2, customBrackets)).toBe(250)
    expect(calculateBasePoints(3, customBrackets)).toBe(250)
    expect(calculateBasePoints(4, customBrackets)).toBe(100)
    expect(calculateBasePoints(99, customBrackets)).toBe(100)
  })
})
