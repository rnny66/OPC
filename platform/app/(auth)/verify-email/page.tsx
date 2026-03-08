export const metadata = { title: 'Verify Email — OPC Europe' }

export default function VerifyEmailPage() {
  return (
    <div style={{
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      padding: '2rem',
      border: '1px solid var(--color-border)',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
        Check your email
      </h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        We sent you a confirmation link. Click it to verify your email address and activate your account.
      </p>
      <a
        href="/login"
        style={{
          color: 'var(--color-brand-light)',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        Back to login
      </a>
    </div>
  )
}
