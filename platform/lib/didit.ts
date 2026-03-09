import { createHmac } from 'crypto'

const DIDIT_API_BASE = 'https://verification.didit.me'

export interface DiditSessionResponse {
  session_id: string
  session_token: string
  verification_url: string
  status: string
}

export async function createVerificationSession(
  userId: string,
  callbackUrl: string
): Promise<DiditSessionResponse> {
  const response = await fetch(`${DIDIT_API_BASE}/v3/session/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DIDIT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: process.env.NEXT_PUBLIC_DIDIT_WORKFLOW_ID,
      vendor_data: userId,
      callback: callbackUrl,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Didit API error: ${response.status} ${text}`)
  }

  return response.json()
}

export function validateWebhookSignature(
  data: { session_id: string; status: string; created_at: string },
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false

  const payload = `${data.session_id}|${data.status}|${data.created_at}`
  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  return expected === signature
}
