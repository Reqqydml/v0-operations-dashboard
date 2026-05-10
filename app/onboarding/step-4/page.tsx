'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OnboardingWizard } from '@/components/onboarding-wizard'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, ShieldCheck, QrCode } from 'lucide-react'

export default function OnboardingStep4() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSetup2FA = async () => {
    setLoading(true)
    try {
      // Redirect to 2FA setup
      router.push('/settings/security/2fa')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      // Save progress and continue
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: 5,
          stepData: {},
        }),
      })

      // Mark 2FA as completed even though they skipped
      await fetch('/api/2fa/status', {
        method: 'GET',
      })

      router.push('/onboarding/step-5')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingWizard
      currentStep={4}
      totalSteps={6}
      title="Secure Your Account"
      description="Set up two-factor authentication for enhanced security"
    >
      <div className="space-y-6">
        {/* 2FA Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication (2FA) adds an extra security step when logging in. After entering your password,
              you'll need to enter a code from your authenticator app.
            </p>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Protects your account from unauthorized access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Works with authenticator apps like Google Authenticator, Microsoft Authenticator, or Authy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">✓</span>
                <span>Get backup codes to regain access if you lose your device</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={loading}
            className="flex-1"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSetup2FA}
            disabled={loading}
            className="flex-1"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Set up 2FA
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          You can set this up anytime in Settings → Security
        </p>
      </div>
    </OnboardingWizard>
  )
}
