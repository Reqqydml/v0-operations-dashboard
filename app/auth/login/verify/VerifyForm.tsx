'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CodeInput } from '@/components/2fa-code-input'
import { Checkbox } from '@/components/ui/checkbox'
import { AlertCircle, Loader2 } from 'lucide-react'
import { generateDeviceFingerprint, generateDeviceName } from '@/lib/2fa/device-fingerprint'

export default function LoginVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trustDevice, setTrustDevice] = useState(false)
  const [attempts, setAttempts] = useState(3)
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('')
  const [methodType, setMethodType] = useState<'totp' | 'email'>('totp')

  useEffect(() => {
    // Generate device fingerprint on mount
    const fingerprint = generateDeviceFingerprint()
    setDeviceFingerprint(fingerprint)
  }, [])

  const handleVerify = useCallback(async (codeToVerify: string) => {
    if (codeToVerify.length !== 6) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToVerify,
          trustDevice,
          deviceFingerprint,
          deviceName: generateDeviceName(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          setError('Account locked due to too many failed attempts. Try again later.')
          setAttempts(0)
        } else {
          setError(data.error || 'Invalid code. Please try again.')
          if (data.attemptsRemaining !== undefined) {
            setAttempts(Math.max(0, data.attemptsRemaining))
          }
        }
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('[v0] 2FA verification error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [router, trustDevice, deviceFingerprint])

  const handleCodeComplete = (completedCode: string) => {
    handleVerify(completedCode)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Enter the code from your authenticator app
          </p>
        </div>

        {/* Verification Card */}
        <Card>
          <CardContent className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleVerify(code)
              }}
              className="space-y-6"
            >
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Code Input */}
              <div className="space-y-4">
                <label className="text-sm font-medium block">
                  Verification Code
                </label>
                <CodeInput
                  value={code}
                  onChange={setCode}
                  disabled={loading || attempts === 0}
                  onComplete={handleCodeComplete}
                  length={6}
                />
                {attempts < 3 && attempts > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-500 text-center">
                    {attempts} attempt{attempts !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>

              {/* Trust Device */}
              {attempts > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="trust-device"
                    checked={trustDevice}
                    onCheckedChange={(checked) => setTrustDevice(checked as boolean)}
                    disabled={loading}
                  />
                  <label htmlFor="trust-device" className="text-sm font-medium cursor-pointer">
                    Trust this device for 30 days
                  </label>
                </div>
              )}

              {/* Verify Button */}
              {attempts > 0 && (
                <Button type="submit" className="w-full" disabled={loading || code.length < 6}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              )}

              {attempts === 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    Too many failed attempts. Your account is temporarily locked.
                  </p>
                </div>
              )}
            </form>

            {/* Lost Access Link */}
            <div className="mt-6 pt-6 border-t">
              <a href="/auth/lost-access" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                Lost access to your authenticator?
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
