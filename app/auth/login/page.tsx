'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

const FAILED_ATTEMPTS_KEY = 'login_failed_attempts'
const LOCKOUT_DURATION = 10 * 60 * 1000 // 10 minutes in ms
const MAX_FAILED_ATTEMPTS = 5

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [lockoutCountdown, setLockoutCountdown] = useState(0)

  // Check for lockout status on mount and set up countdown interval
  useEffect(() => {
    const checkLockout = () => {
      const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY)
      if (!stored) return

      const data = JSON.parse(stored)
      const now = Date.now()
      const timeSinceLockout = now - data.timestamp

      if (timeSinceLockout < LOCKOUT_DURATION) {
        setIsLocked(true)
        const remaining = Math.ceil((LOCKOUT_DURATION - timeSinceLockout) / 1000)
        setLockoutCountdown(remaining)
      } else {
        localStorage.removeItem(FAILED_ATTEMPTS_KEY)
        setIsLocked(false)
      }
    }

    checkLockout()

    // Set up countdown timer
    const interval = setInterval(() => {
      const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY)
      if (!stored) {
        setIsLocked(false)
        return
      }

      const data = JSON.parse(stored)
      const now = Date.now()
      const timeSinceLockout = now - data.timestamp

      if (timeSinceLockout >= LOCKOUT_DURATION) {
        localStorage.removeItem(FAILED_ATTEMPTS_KEY)
        setIsLocked(false)
        setLockoutCountdown(0)
      } else {
        const remaining = Math.ceil((LOCKOUT_DURATION - timeSinceLockout) / 1000)
        setLockoutCountdown(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const recordFailedAttempt = () => {
    const stored = localStorage.getItem(FAILED_ATTEMPTS_KEY)
    const data = stored ? JSON.parse(stored) : { count: 0, timestamp: Date.now() }

    data.count += 1

    if (data.count >= MAX_FAILED_ATTEMPTS) {
      data.timestamp = Date.now()
      setIsLocked(true)
      const remaining = LOCKOUT_DURATION / 1000
      setLockoutCountdown(remaining)
    }

    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(data))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLocked) {
      setError(`Account locked. Try again in ${lockoutCountdown} seconds.`)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        recordFailedAttempt()
        // Generic error message for security
        setError('Invalid credentials. Please try again.')
        return
      }

      // Clear failed attempts on success
      localStorage.removeItem(FAILED_ATTEMPTS_KEY)

      // Handle "Remember me" - extend session if needed
      if (rememberMe) {
        // This is handled by Supabase session management
        // The user session is already persistent
      }

      router.push('/dashboard')
    } catch (err) {
      recordFailedAttempt()
      setError('An error occurred. Please try again.')
      console.error('[v0] Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/hamduk-logo.jpg"
              alt="Hamduk Digital Hub"
              width={56}
              height={56}
              className="rounded-lg"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold">Hamduk Digital Hub</h1>
          <p className="text-muted-foreground text-sm mt-1">Operations Dashboard</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Lockout Message */}
              {isLocked && (
                <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Account temporarily locked</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                      Too many failed attempts. Try again in {formatCountdown(lockoutCountdown)}.
                    </p>
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || isLocked}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password Input with Show/Hide */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || isLocked}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading || isLocked}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={loading || isLocked}
                  />
                  <label htmlFor="remember" className="text-sm font-medium cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/auth/login/forgot-password"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || isLocked}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
