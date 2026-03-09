import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { validateWebhookSignature } from '@/lib/didit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-signature-simple') || ''

    const secret = process.env.DIDIT_WEBHOOK_SECRET
    if (!secret) {
      console.error('DIDIT_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Validate signature
    const isValid = validateWebhookSignature(
      {
        session_id: body.session_id,
        status: body.status,
        created_at: body.created_at,
      },
      signature,
      secret
    )

    if (!isValid) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Only process approved verifications
    if (body.status !== 'Approved') {
      return NextResponse.json({ received: true })
    }

    // Find user by session ID and update
    const adminClient = createSupabaseAdmin()

    const updateData: Record<string, any> = {
      identity_verified: true,
      identity_verified_at: new Date().toISOString(),
    }

    // Extract date_of_birth from decision data if available
    if (body.decision?.document?.date_of_birth) {
      updateData.date_of_birth = body.decision.document.date_of_birth
    }

    const { error } = await adminClient
      .from('profiles')
      .update(updateData)
      .eq('didit_session_id', body.session_id)

    if (error) {
      console.error('Failed to update profile:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }
}
