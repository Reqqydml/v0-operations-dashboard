import { createClient } from '@/lib/supabase/server'
import { generateTOTPSecret, generateTOTPURI } from '@/lib/2fa/totp'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { method } = await request.json()

    if (!['totp', 'email'].includes(method)) {
      return NextResponse.json({ error: 'Invalid method' }, { status: 400 })
    }

    // Check if 2FA is already enabled
    const { data: existing } = await supabase
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existing?.is_enabled) {
      return NextResponse.json({ error: '2FA already enabled' }, { status: 400 })
    }

    // Generate TOTP secret for setup
    const secret = generateTOTPSecret()
    const qrCodeUri = generateTOTPURI(secret, user.email || '')

    // Store temporary secret in session (or return for client-side storage)
    // For this implementation, we return it and expect the client to send it back during verification
    
    return NextResponse.json({
      method,
      secret,
      qrCodeUri,
    })
  } catch (error) {
    console.error('[v0] 2FA setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
