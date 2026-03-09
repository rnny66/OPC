'use client'

interface Registration {
  id: string
  status: string
  registered_at: string
  profiles: {
    display_name: string | null
    nationality: string[] | null
  } | null
}

interface ExportCSVButtonProps {
  registrations: Registration[]
  tournamentName: string
}

const styles = {
  button: {
    backgroundColor: 'var(--color-bg-secondary)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    padding: '0.5rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
  } as React.CSSProperties,
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,
}

function sanitizeFilename(name: string): string {
  return name.replace(/\s+/g, '-').toLowerCase()
}

export function ExportCSVButton({
  registrations,
  tournamentName,
}: ExportCSVButtonProps) {
  const isEmpty = registrations.length === 0

  function handleExport() {
    const headers = ['Player Name', 'Nationality', 'Registered Date', 'Status']
    const rows = registrations.map((reg) => [
      reg.profiles?.display_name || '',
      reg.profiles?.nationality?.[0] || '',
      new Date(reg.registered_at).toLocaleDateString(),
      reg.status,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${sanitizeFilename(tournamentName)}-registrations.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      disabled={isEmpty}
      style={{
        ...styles.button,
        ...(isEmpty ? styles.buttonDisabled : {}),
      }}
    >
      Export CSV
    </button>
  )
}
