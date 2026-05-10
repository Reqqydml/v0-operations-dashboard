import { createClient } from '@/lib/supabase/server'
import { verifyTOTP } from '@/lib/2fa/totp'
import { verifyBackupCode } from '@/lib/2fa/backup-codes'
import { generateDeviceFingerprint } from '@/lib/2fa/device-fingerprint'
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

    const { code, trustDevice, deviceFingerprint, deviceName } = await request.json()

    // Get user's 2FA settings
    const { data: twoFASettings } = await supabase
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!twoFASettings?.is_enabled) {
      return NextResponse.json({ error: '2FA not enabled' }, { status: 400 })
    }

    // Check rate limiting
    const { data: attempts } = await supabase
      .from('user_2fa_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('attempt_type', 'verify')
      .single()

    const now = new Date()
    if (attempts?.locked_until && new Date(attempts.locked_until) > now) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }

    // Verify the code
    let isValid = false
    
    if (twoFASettings.method === 'totp' && twoFASettings.totp_secret) {
      isValid = verifyTOTP(twoFASettings.totp_secret, code)
    } else if (twoFASettings.method === 'email') {
      // For email OTP, you would verify against a separate OTP table
      // This is a placeholder
      isValid = false
    }

    // If code is backup code, check that instead
    if (!isValid && twoFASettings.backup_codes) {
      const backupCodes = Array.isArray(twoFASettings.backup_codes) ? twoFASettings.backup_codes : []
      if (verifyBackupCode(code, backupCodes)) {
        isValid = true
        // Mark backup code as used
        const updated = backupCodes.map((bc: any) => {
          const bcClean = bc.code.replace(/\s|-/g, '').toUpperCase()
          const codeClean = code.replace(/\s|-/g, '').toUpperCase()
          return bcClean === codeClean ? { ...bc, used: true } : bc
        })
        
        await supabase
          .from('user_2fa_settings')
          .update({ backup_codes: updated })
          .eq('user_id', user.id)
      }
    }

    if (!isValid) {
      // Increment failed attempts
      const newFailedCount = (attempts?.failed_count || 0) + 1
      const lockoutThreshold = 3
      const lockoutDuration = 15 * 60 * 1000 // 15 minutes

      let lockedUntil = null
      if (newFailedCount >= lockoutThreshold) {
        lockedUntil = new Date(Date.now() + lockoutDuration).toISOString()
      }

      if (attempts) {
        await supabase
          .from('user_2fa_attempts')
          .update({ failed_count: newFailedCount, locked_until: lockedUntil })
          .eq('id', attempts.id)
      } else {
        await supabase
          .from('user_2fa_attempts')
          .insert({
            user_id: user.id,
            attempt_type: 'verify',
            failed_count: newFailedCount,
            locked_until: lockedUntil,
          })
      }

      return NextResponse.json(
        { error: 'Invalid code', attemptsRemaining: Math.max(0, lockoutThreshold - newFailedCount) },
        { status: 401 }
      )
    }

    // Code is valid - reset attempts and handle device trust
    if (attempts) {
      await supabase
        .from('user_2fa_attempts')
        .update({ failed_count: 0, locked_until: null })
        .eq('id', attempts.id)
    }

    // If user wants to trust device
    if (trustDevice && deviceFingerprint) {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      
      await supabase
        .from('trusted_devices')
        .insert({
          user_id: user.id,
          device_fingerprint: deviceFingerprint,
          device_name: deviceName || 'Trusted Device',
          trusted_until: thirtyDaysFromNow,
        })
        .onConflict('user_id,device_fingerprint')
        .do(
          'update',
          {
            trusted_until: thirtyDaysFromNow,
          } as any
        )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] 2FA verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
