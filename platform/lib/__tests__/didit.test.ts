import { describe, it, expect } from 'vitest'
import { validateWebhookSignature } from '../didit'

describe('validateWebhookSignature', () => {
  const secret = 'test-webhook-secret'

  it('returns true for valid signature', async () => {
    const crypto = await import('crypto')
    const payload = 'session-123|Approved|2026-03-09T12:00:00Z'
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')

    const result = validateWebhookSignature(
      { session_id: 'session-123', status: 'Approved', created_at: '2026-03-09T12:00:00Z' },
      expected,
      secret
    )
    expect(result).toBe(true)
  })

  it('returns false for invalid signature', () => {
    const result = validateWebhookSignature(
      { session_id: 'session-123', status: 'Approved', created_at: '2026-03-09T12:00:00Z' },
      'invalid-signature',
      secret
    )
    expect(result).toBe(false)
  })

  it('returns false for empty signature', () => {
    const result = validateWebhookSignature(
      { session_id: 'session-123', status: 'Approved', created_at: '2026-03-09T12:00:00Z' },
      '',
      secret
    )
    expect(result).toBe(false)
  })
})
