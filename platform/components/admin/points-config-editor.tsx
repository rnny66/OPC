'use client'

import { useState, useTransition } from 'react'
import { updateDefaultBrackets, updateCountryConfig, recomputeAllStats } from '@/lib/actions/admin'

interface Bracket {
  id: string
  placement_min: number
  placement_max: number | null
  base_points: number
}

interface Country {
  country_code: string
  country_name: string
  global_multiplier: number
  custom_brackets: { min: number; max: number | null; points: number }[] | null
}

interface PointsConfigEditorProps {
  brackets: Bracket[]
  countries: Country[]
}

interface EditableBracket {
  placementMin: number
  placementMax: number | null
  basePoints: number
}

const cardStyle: React.CSSProperties = {
  background: 'var(--color-bg-secondary, #13151a)',
  border: '1px solid var(--color-border, #23272f)',
  borderRadius: '0.75rem',
  padding: '1.5rem',
  marginBottom: '2rem',
}

const headingStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: 'var(--color-text-primary, #f0f0f0)',
  marginBottom: '1rem',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  color: 'var(--color-text-secondary, #94a3b8)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  borderBottom: '1px solid var(--color-border, #23272f)',
}

const tdStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  borderBottom: '1px solid var(--color-border, #23272f)',
  color: 'var(--color-text-primary, #f0f0f0)',
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-bg-primary, #0c0e12)',
  border: '1px solid var(--color-border, #23272f)',
  borderRadius: '0.375rem',
  color: 'var(--color-text-primary, #f0f0f0)',
  padding: '0.375rem 0.5rem',
  fontSize: '0.875rem',
  width: '5rem',
}

const buttonStyle: React.CSSProperties = {
  background: 'var(--color-brand, #1570ef)',
  color: '#fff',
  border: 'none',
  borderRadius: '0.375rem',
  padding: '0.5rem 1rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  cursor: 'pointer',
}

const smallButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  padding: '0.25rem 0.5rem',
  fontSize: '0.75rem',
}

const dangerButtonStyle: React.CSSProperties = {
  ...smallButtonStyle,
  background: 'var(--color-error, #ef4444)',
}

const feedbackStyle = (isError: boolean): React.CSSProperties => ({
  marginTop: '0.75rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '0.375rem',
  fontSize: '0.875rem',
  background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
  color: isError ? 'var(--color-error, #ef4444)' : '#22c55e',
})

export function PointsConfigEditor({ brackets, countries }: PointsConfigEditorProps) {
  const [editBrackets, setEditBrackets] = useState<EditableBracket[]>(
    brackets.map(b => ({
      placementMin: b.placement_min,
      placementMax: b.placement_max,
      basePoints: b.base_points,
    }))
  )
  const [countryMultipliers, setCountryMultipliers] = useState<Record<string, number>>(
    Object.fromEntries(countries.map(c => [c.country_code, c.global_multiplier]))
  )

  const [bracketsPending, startBracketsTransition] = useTransition()
  const [countryPending, startCountryTransition] = useTransition()
  const [recomputePending, startRecomputeTransition] = useTransition()

  const [bracketsMessage, setBracketsMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [countryMessage, setCountryMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [recomputeMessage, setRecomputeMessage] = useState<{ text: string; error: boolean } | null>(null)

  function updateBracketField(index: number, field: keyof EditableBracket, value: string) {
    setEditBrackets(prev => {
      const next = [...prev]
      if (field === 'placementMax') {
        next[index] = { ...next[index], [field]: value === '' ? null : Number(value) }
      } else {
        next[index] = { ...next[index], [field]: Number(value) }
      }
      return next
    })
  }

  function addBracketRow() {
    setEditBrackets(prev => [...prev, { placementMin: 0, placementMax: null, basePoints: 0 }])
  }

  function removeBracketRow(index: number) {
    setEditBrackets(prev => prev.filter((_, i) => i !== index))
  }

  function saveBrackets() {
    startBracketsTransition(async () => {
      const result = await updateDefaultBrackets(editBrackets)
      if ('error' in result && result.error) {
        setBracketsMessage({ text: result.error, error: true })
      } else {
        setBracketsMessage({ text: 'Brackets saved successfully', error: false })
      }
    })
  }

  function saveCountry(country: Country) {
    const multiplier = countryMultipliers[country.country_code] ?? country.global_multiplier
    startCountryTransition(async () => {
      const result = await updateCountryConfig(
        country.country_code,
        multiplier,
        country.custom_brackets
      )
      if ('error' in result && result.error) {
        setCountryMessage({ text: result.error, error: true })
      } else {
        setCountryMessage({ text: `${country.country_name} updated`, error: false })
      }
    })
  }

  function handleRecompute() {
    startRecomputeTransition(async () => {
      const result = await recomputeAllStats()
      if ('error' in result && result.error) {
        setRecomputeMessage({ text: result.error, error: true })
      } else {
        setRecomputeMessage({ text: 'All player stats recomputed successfully', error: false })
      }
    })
  }

  return (
    <div>
      {/* Default Brackets Section */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>Default Brackets</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Placement Min</th>
              <th style={thStyle}>Placement Max</th>
              <th style={thStyle}>Base Points</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {editBrackets.map((b, i) => (
              <tr key={i}>
                <td style={tdStyle}>
                  <input
                    type="number"
                    style={inputStyle}
                    value={b.placementMin}
                    onChange={e => updateBracketField(i, 'placementMin', e.target.value)}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    style={inputStyle}
                    value={b.placementMax ?? ''}
                    placeholder="null"
                    onChange={e => updateBracketField(i, 'placementMax', e.target.value)}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    style={inputStyle}
                    value={b.basePoints}
                    onChange={e => updateBracketField(i, 'basePoints', e.target.value)}
                  />
                </td>
                <td style={tdStyle}>
                  <button
                    type="button"
                    style={dangerButtonStyle}
                    onClick={() => removeBracketRow(i)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button type="button" style={smallButtonStyle} onClick={addBracketRow}>
            Add Row
          </button>
          <button
            type="button"
            style={buttonStyle}
            onClick={saveBrackets}
            disabled={bracketsPending}
          >
            {bracketsPending ? 'Saving...' : 'Save Brackets'}
          </button>
        </div>
        {bracketsMessage && (
          <div style={feedbackStyle(bracketsMessage.error)}>{bracketsMessage.text}</div>
        )}
      </div>

      {/* Country Configuration Section */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>Country Configuration</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Country</th>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Multiplier</th>
              <th style={thStyle}>Custom Brackets</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {countries.map(c => (
              <tr key={c.country_code}>
                <td style={tdStyle}>{c.country_name}</td>
                <td style={tdStyle}>{c.country_code}</td>
                <td style={tdStyle}>
                  <input
                    type="number"
                    step="0.1"
                    style={inputStyle}
                    value={countryMultipliers[c.country_code] ?? c.global_multiplier}
                    onChange={e =>
                      setCountryMultipliers(prev => ({
                        ...prev,
                        [c.country_code]: Number(e.target.value),
                      }))
                    }
                  />
                </td>
                <td style={tdStyle}>
                  {c.custom_brackets ? 'Yes' : 'No'}
                </td>
                <td style={tdStyle}>
                  <button
                    type="button"
                    style={smallButtonStyle}
                    onClick={() => saveCountry(c)}
                    disabled={countryPending}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {countryMessage && (
          <div style={feedbackStyle(countryMessage.error)}>{countryMessage.text}</div>
        )}
      </div>

      {/* Recompute Section */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>Maintenance</h2>
        <p style={{ color: 'var(--color-text-secondary, #94a3b8)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Recompute all player stats based on current tournament results and points configuration.
        </p>
        <button
          type="button"
          style={buttonStyle}
          onClick={handleRecompute}
          disabled={recomputePending}
        >
          {recomputePending ? 'Recomputing...' : 'Recompute All Stats'}
        </button>
        {recomputeMessage && (
          <div style={feedbackStyle(recomputeMessage.error)}>{recomputeMessage.text}</div>
        )}
      </div>
    </div>
  )
}
