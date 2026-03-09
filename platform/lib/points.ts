/**
 * Client-side points calculation mirroring the Postgres calculate_points function.
 * Used for instant preview in the results entry form.
 */

export interface PointsBracket {
  min: number
  max: number | null
  points: number
}

export function calculateBasePoints(placement: number, brackets?: PointsBracket[]): number {
  if (brackets && brackets.length > 0) {
    for (const b of brackets) {
      if (b.max === null) {
        if (placement >= b.min) return b.points
      } else if (placement >= b.min && placement <= b.max) {
        return b.points
      }
    }
    return 0
  }

  // Default hardcoded brackets (fallback)
  if (placement === 1) return 1000
  if (placement === 2) return 750
  if (placement === 3) return 500
  if (placement === 4) return 400
  if (placement === 5) return 350
  if (placement >= 6 && placement <= 10) return 300
  if (placement >= 11 && placement <= 20) return 200
  if (placement >= 21 && placement <= 50) return 100
  if (placement > 50) return 50
  return 0
}

export function calculatePoints(placement: number, multiplier: number, brackets?: PointsBracket[]): number {
  return Math.floor(calculateBasePoints(placement, brackets) * multiplier)
}
