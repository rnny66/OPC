import { describe, it, expect } from 'vitest'
import { renderWithProviders } from '../render'

describe('renderWithProviders', () => {
  it('renders a component with providers', () => {
    const { getByText } = renderWithProviders(<div>Hello OPC</div>)
    expect(getByText('Hello OPC')).toBeInTheDocument()
  })
})
