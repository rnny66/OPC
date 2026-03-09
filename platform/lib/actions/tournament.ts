'use server'

import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createTournament(formData: FormData) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const name = formData.get('name') as string
  const club_name = formData.get('club_name') as string
  const city = formData.get('city') as string
  const country = formData.get('country') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  if (!name || !club_name || !city || !country || !start_date || !end_date) {
    throw new Error('Missing required fields')
  }

  const entryFeeRaw = formData.get('entry_fee')
  const entry_fee = entryFeeRaw ? Math.round(parseFloat(entryFeeRaw as string) * 100) : 0

  const capacityRaw = formData.get('capacity')
  const capacity = capacityRaw ? parseInt(capacityRaw as string, 10) : null

  const pointsRaw = formData.get('points_multiplier')
  const points_multiplier = pointsRaw ? parseFloat(pointsRaw as string) : 1.0

  const { error } = await supabase.from('tournaments').insert({
    organizer_id: user.id,
    name,
    club_name,
    city,
    country,
    series: (formData.get('series') as string) || 'Open',
    description: (formData.get('description') as string) || null,
    venue_address: (formData.get('venue_address') as string) || null,
    contact_email: (formData.get('contact_email') as string) || null,
    start_date,
    end_date,
    registration_deadline: (formData.get('registration_deadline') as string) || null,
    entry_fee,
    capacity,
    points_multiplier,
    registration_open: formData.get('registration_open') === 'on',
    requires_verification: formData.get('requires_verification') === 'on',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/organizer/dashboard')
  redirect('/organizer/dashboard')
}

export async function updateTournament(formData: FormData) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id') as string
  if (!id) throw new Error('Missing tournament ID')

  const name = formData.get('name') as string
  const club_name = formData.get('club_name') as string
  const city = formData.get('city') as string
  const country = formData.get('country') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string

  if (!name || !club_name || !city || !country || !start_date || !end_date) {
    throw new Error('Missing required fields')
  }

  const entryFeeRaw = formData.get('entry_fee')
  const entry_fee = entryFeeRaw ? Math.round(parseFloat(entryFeeRaw as string) * 100) : 0

  const capacityRaw = formData.get('capacity')
  const capacity = capacityRaw ? parseInt(capacityRaw as string, 10) : null

  const pointsRaw = formData.get('points_multiplier')
  const points_multiplier = pointsRaw ? parseFloat(pointsRaw as string) : 1.0

  const { error } = await supabase
    .from('tournaments')
    .update({
      name,
      club_name,
      city,
      country,
      series: (formData.get('series') as string) || 'Open',
      description: (formData.get('description') as string) || null,
      venue_address: (formData.get('venue_address') as string) || null,
      contact_email: (formData.get('contact_email') as string) || null,
      start_date,
      end_date,
      registration_deadline: (formData.get('registration_deadline') as string) || null,
      entry_fee,
      capacity,
      points_multiplier,
      registration_open: formData.get('registration_open') === 'on',
      requires_verification: formData.get('requires_verification') === 'on',
      status: (formData.get('status') as string) || 'upcoming',
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/organizer/dashboard')
  redirect('/organizer/dashboard')
}
