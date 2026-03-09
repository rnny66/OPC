import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { createVerificationSession } from '@/lib/didit'

export async function POST() {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if already verified
    const { data: profile } = await supabase
      .from('profiles')
      .select('identity_verified')
      .eq('id', user.id)
      .single()

    if (profile?.identity_verified) {
      return NextResponse.json({ error: 'Already verified' }, { status: 400 })
    }

    // Determine callback URL for webhook
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')
    const callbackUrl = `${baseUrl}/api/webhooks/didit`

    // Create Didit session
    const session = await createVerificationSession(user.id, callbackUrl)

    // Store session ID on profile
    const adminClient = createSupabaseAdmin()
    await adminClient
      .from('profiles')
      .update({ didit_session_id: session.session_id })
      .eq('id', user.id)

    return NextResponse.json({ url: session.verification_url })
  } catch (err: any) {
    console.error('Failed to create verification session:', err)
    return NextResponse.json({ error: err.message || 'Failed to create session' }, { status: 500 })
  }
}
