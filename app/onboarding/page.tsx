'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getCurrentOnboardingStep, isOnboardingComplete } from '@/lib/onboarding'
import { Loader2 } from 'lucide-react'

export default function OnboardingRouter() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      if (loading || !user) return

      try {
        // Check if onboarding is complete
        const complete = await isOnboardingComplete(user.id)
        if (complete) {
          router.push('/dashboard')
          return
        }

        // Get current step and redirect
        const currentStep = await getCurrentOnboardingStep(user.id)
        router.push(`/onboarding/step-${currentStep}`)
      } finally {
        setIsChecking(false)
      }
    }

    checkStatus()
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading your setup...</p>
      </div>
    </div>
  )
}
