import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Mark all steps as complete
  const { data, error } = await supabase
    .from('profiles')
    .update({
      has_completed_password_change: true,
      has_completed_profile: true,
      has_completed_2fa: true,
      has_completed_legal: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, profile: data?.[0] })
}
