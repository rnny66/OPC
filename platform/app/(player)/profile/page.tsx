import { createSupabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/profile/profile-form'
import { VerificationStatus } from '@/components/auth/verification-status'
import { isFeatureEnabled } from '@/lib/feature-flags'

export const metadata = { title: 'Profile — OPC Europe' }

export default async function ProfilePage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const [avatarEnabled, verificationEnabled] = await Promise.all([
    isFeatureEnabled('avatar_upload'),
    isFeatureEnabled('identity_verification'),
  ])

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>
        Your Profile
      </h2>
      {verificationEnabled && (
        <VerificationStatus
          isVerified={profile.identity_verified}
          verifiedAt={profile.identity_verified_at}
        />
      )}
      <ProfileForm profile={profile} avatarEnabled={avatarEnabled} />
    </div>
  )
}
