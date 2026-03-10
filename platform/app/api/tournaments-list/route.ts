import { NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('tournaments')
    .select('id, name, venue, start_date')
    .order('start_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
