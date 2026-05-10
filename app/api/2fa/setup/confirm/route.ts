import { createClient } from '@/lib/supabase/server'
import { verifyTOTP } from '@/lib/2fa/totp'
import { generateBackupCodes, backupCodesToStorage } from '@/lib/2fa/backup-codes'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { method, secret, code } = await request.json()

    if (!['totp', 'email'].includes(method)) {
      return NextResponse.json({ error: 'Invalid method' }, { status: 400 })
    }

    // Verify the code matches the secret
    if (method === 'totp') {
      if (!verifyTOTP(secret, code)) {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
      }
    } else if (method === 'email') {
      // For email OTP, verify against stored OTP
      // This would check against a temporary OTP table
      // Placeholder for now
      if (code !== '000000') {
        return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
      }
    }

    // Generate backup codes
    const backupCodesArray = generateBackupCodes(10)
    const backupCodesStorage = backupCodesToStorage(backupCodesArray)

    // Check if 2FA settings already exist
    const { data: existing } = await supabase
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('user_2fa_settings')
        .update({
          method,
          is_enabled: true,
          totp_secret: method === 'totp' ? secret : null,
          backup_codes: backupCodesStorage,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) {
        console.error('[v0] 2FA update error:', error)
        return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 })
      }
    } else {
      // Create new settings
      const { error } = await supabase
        .from('user_2fa_settings')
        .insert({
          user_id: user.id,
          method,
          is_enabled: true,
          totp_secret: method === 'totp' ? secret : null,
          backup_codes: backupCodesStorage,
        })

      if (error) {
        console.error('[v0] 2FA insert error:', error)
        return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 })
      }
    }

    // Clear any failed attempts
    await supabase
      .from('user_2fa_attempts')
      .delete()
      .eq('user_id', user.id)
      .eq('attempt_type', 'setup')

    return NextResponse.json({
      success: true,
      backupCodes: backupCodesArray,
    })
  } catch (error) {
    console.error('[v0] 2FA confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
