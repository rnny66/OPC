import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { PointsConfigEditor } from '../points-config-editor'

vi.mock('@/lib/actions/admin', () => ({
  updateDefaultBrackets: vi.fn(),
  updateCountryConfig: vi.fn(),
  recomputeAllStats: vi.fn(),
}))

afterEach(() => cleanup())

const mockBrackets = [
  { id: 'b1', placement_min: 1, placement_max: 1, base_points: 1000 },
  { id: 'b2', placement_min: 2, placement_max: 2, base_points: 750 },
  { id: 'b3', placement_min: 6, placement_max: 10, base_points: 300 },
]

const mockCountries = [
  { country_code: 'NL', country_name: 'Netherlands', global_multiplier: 1.0, custom_brackets: null },
  { country_code: 'DE', country_name: 'Germany', global_multiplier: 1.2, custom_brackets: null },
]

describe('PointsConfigEditor', () => {
  it('renders bracket table with data', () => {
    render(<PointsConfigEditor brackets={mockBrackets} countries={mockCountries} />)
    expect(screen.getByText('Default Brackets')).toBeInTheDocument()
    // Check that bracket values are in inputs
    const inputs = screen.getAllByDisplayValue('1000')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('renders country table with data', () => {
    render(<PointsConfigEditor brackets={mockBrackets} countries={mockCountries} />)
    expect(screen.getByText('Country Configuration')).toBeInTheDocument()
    expect(screen.getByText('Netherlands')).toBeInTheDocument()
    expect(screen.getByText('Germany')).toBeInTheDocument()
  })

  it('renders save brackets button', () => {
    render(<PointsConfigEditor brackets={mockBrackets} countries={mockCountries} />)
    expect(screen.getByRole('button', { name: /save brackets/i })).toBeInTheDocument()
  })

  it('renders recompute button', () => {
    render(<PointsConfigEditor brackets={mockBrackets} countries={mockCountries} />)
    expect(screen.getByRole('button', { name: /recompute/i })).toBeInTheDocument()
  })
})
