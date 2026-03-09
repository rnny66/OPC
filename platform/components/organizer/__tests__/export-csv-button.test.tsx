import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'

import { ExportCSVButton } from '../export-csv-button'

afterEach(() => cleanup())

const mockRegistrations = [
  {
    id: 'reg-1',
    status: 'registered',
    registered_at: '2027-05-01T10:00:00Z',
    profiles: {
      display_name: 'John Doe',
      nationality: ['Czech Republic'],
    },
  },
  {
    id: 'reg-2',
    status: 'confirmed',
    registered_at: '2027-05-02T14:00:00Z',
    profiles: {
      display_name: 'Jane Smith',
      nationality: ['Austria'],
    },
  },
]

describe('ExportCSVButton', () => {
  it('renders the export button', () => {
    render(
      <ExportCSVButton
        registrations={mockRegistrations}
        tournamentName="Prague Poker Open"
      />
    )
    expect(
      screen.getByRole('button', { name: /export csv/i })
    ).toBeInTheDocument()
  })

  it('button is disabled when no registrations', () => {
    render(
      <ExportCSVButton registrations={[]} tournamentName="Prague Poker Open" />
    )
    expect(screen.getByRole('button', { name: /export csv/i })).toBeDisabled()
  })

  it('generates CSV on click', () => {
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url')
    const mockRevokeObjectURL = vi.fn()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL

    render(
      <ExportCSVButton
        registrations={mockRegistrations}
        tournamentName="Prague Poker Open"
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /export csv/i }))

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1)
    expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob))
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url')
  })
})
