import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isPasswordValid } from '@/lib/password-validation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing reset token' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Validate password requirements
    if (!isPasswordValid(password)) {
      return NextResponse.json(
        { error: 'Password does not meet requirements' },
        { status: 400 }
      )
    }

    // Exchange token for session and update password
    const { data, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    })

    if (sessionError || !data.session) {
      console.error('[v0] Password reset verification error:', sessionError)
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      )
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      data.session.user.id,
      { password }
    )

    if (updateError) {
      console.error('[v0] Password update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Password reset successfully. Please log in with your new password.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Password reset error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
