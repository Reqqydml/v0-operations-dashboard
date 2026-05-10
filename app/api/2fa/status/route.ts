import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Using supabase client
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: twoFASettings } = await supabase
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      is_enabled: twoFASettings?.is_enabled || false,
      method: twoFASettings?.method || null,
    })
  } catch (error) {
    console.error('[v0] 2FA status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
