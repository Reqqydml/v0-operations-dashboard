'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CodeInput } from '@/components/2fa-code-input'
import { QRCode } from '@/components/2fa-qr-code'
import { AlertCircle, CheckCircle2, Copy, Loader2, Eye, EyeOff } from 'lucide-react'

type SetupStep = 'idle' | 'method-choice' | 'qr-code' | 'verification' | 'backup-codes' | 'complete'

export default function TwoFactorAuthPage() {
  const router = useRouter()
  const [step, setStep] = useState<SetupStep>('idle')
  const [method, setMethod] = useState<'totp' | 'email'>('totp')
  const [secret, setSecret] = useState<string>('')
  const [qrCodeUri, setQrCodeUri] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  // Check if 2FA is already enabled
  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        const response = await fetch('/api/2fa/status')
        if (response.ok) {
          const data = await response.json()
          setTwoFAEnabled(data.is_enabled)
        }
      } catch (err) {
        console.error('[v0] Error checking 2FA status:', err)
      }
    }
    check2FAStatus()
  }, [])

  const handleStartSetup = async (selectedMethod: 'totp' | 'email') => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/2fa/setup/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: selectedMethod }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to start 2FA setup')
        setLoading(false)
        return
      }

      const data = await response.json()
      setMethod(selectedMethod)
      setSecret(data.secret)
      setQrCodeUri(data.qrCodeUri)
      setStep('qr-code')
    } catch (err) {
      console.error('[v0] Setup start error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifySetup = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/2fa/setup/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          secret,
          code: verificationCode,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Verification failed')
        setLoading(false)
        return
      }

      const data = await response.json()
      setBackupCodes(data.backupCodes)
      setStep('backup-codes')
      setSuccess('Two-factor authentication enabled successfully!')
    } catch (err) {
      console.error('[v0] Verification error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n')
    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
    element.setAttribute('download', 'backup-codes.txt')
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Reset Setup Flow
  if (twoFAEnabled && step === 'idle') {
    return (
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Two-Factor Authentication Enabled
            </CardTitle>
            <CardDescription>
              Your account is protected with two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have successfully enabled two-factor authentication on your account.
              You will be required to enter a verification code when logging in.
            </p>
            <Button variant="outline" onClick={() => setStep('method-choice')}>
              Re-enable with Different Method
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 1: Method Choice
  if (step === 'idle' || step === 'method-choice') {
    return (
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Enable Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account by requiring a code when you sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div
                className="p-4 border-2 border-input rounded-lg cursor-pointer hover:border-primary transition-colors"
                onClick={() => !loading && handleStartSetup('totp')}
              >
                <h3 className="font-medium mb-1">Authenticator App</h3>
                <p className="text-sm text-muted-foreground">
                  Use an app like Google Authenticator, Authy, or Microsoft Authenticator
                </p>
              </div>

              <div
                className="p-4 border-2 border-input rounded-lg cursor-pointer hover:border-primary transition-colors opacity-50 cursor-not-allowed"
                title="Email 2FA coming soon"
              >
                <h3 className="font-medium mb-1">Email Code</h3>
                <p className="text-sm text-muted-foreground">
                  Receive verification codes via email (Coming soon)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 2: QR Code Display
  if (step === 'qr-code') {
    return (
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Scan QR Code</CardTitle>
            <CardDescription>
              Scan this code with your authenticator app to set up two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {qrCodeUri && <QRCode value={qrCodeUri} size={200} />}

            <div className="space-y-2">
              <label className="text-sm font-medium">Manual Entry (if scanning fails)</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                  {showSecret ? secret : '••••••••••••••••'}
                </code>
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button onClick={() => setStep('verification')} className="w-full">
              Next: Verify Code
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 3: Verification Code
  if (step === 'verification') {
    return (
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Verify Your Code</CardTitle>
            <CardDescription>
              Enter the 6-digit code from your authenticator app to confirm setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            <CodeInput
              value={verificationCode}
              onChange={setVerificationCode}
              disabled={loading}
              onComplete={() => handleVerifySetup()}
              length={6}
            />

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('qr-code')}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleVerifySetup}
                disabled={loading || verificationCode.length < 6}
                className="flex-1"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 4: Backup Codes
  if (step === 'backup-codes') {
    return (
      <div className="max-w-2xl space-y-6">
        <Card className="border-green-500/30 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Save Your Backup Codes
            </CardTitle>
            <CardDescription>
              Keep these codes in a safe place. Use them to regain access if you lose your authenticator device
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {success && (
              <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code) => (
                <div
                  key={code}
                  className="p-3 bg-muted rounded-lg font-mono text-sm flex items-center justify-between group hover:bg-muted/80 transition-colors cursor-pointer"
                  onClick={() => copyBackupCode(code)}
                >
                  <span>{code}</span>
                  <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </div>
              ))}
            </div>

            {copiedCode && (
              <p className="text-xs text-green-600 dark:text-green-400 text-center">
                Code copied to clipboard
              </p>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={downloadBackupCodes} className="flex-1">
                Download Codes
              </Button>
              <Button onClick={() => { setStep('complete'); router.refresh() }} className="flex-1">
                Complete Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
