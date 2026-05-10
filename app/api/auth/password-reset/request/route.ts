import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Use Supabase's built-in password reset flow
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email.toLowerCase(),
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login/reset-password`,
      },
    })

    if (error) {
      console.error('[v0] Password reset request error:', error)
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { message: 'If that email exists in our system, a reset link has been sent.' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { message: 'If that email exists in our system, a reset link has been sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Password reset request error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
