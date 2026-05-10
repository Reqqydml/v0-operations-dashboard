'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OnboardingWizard } from '@/components/onboarding-wizard'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, CheckCircle2, Sparkles } from 'lucide-react'

const tourItems = [
  {
    title: 'Dashboard',
    description: 'Your main hub for projects, tasks, and team activity',
    icon: '📊',
  },
  {
    title: 'Projects',
    description: 'Create and manage all your projects in one place',
    icon: '📁',
  },
  {
    title: 'Tasks',
    description: 'Track and assign work to your team',
    icon: '✓',
  },
  {
    title: 'Team',
    description: 'Collaborate with your team members',
    icon: '👥',
  },
  {
    title: 'Settings',
    description: 'Customize your profile and preferences',
    icon: '⚙️',
  },
]

export default function OnboardingStep6() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showTour, setShowTour] = useState(true)

  const handleComplete = async () => {
    setLoading(true)

    try {
      // Mark onboarding as complete
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) throw new Error('Failed to complete onboarding')

      // Clear progress and redirect
      router.push('/dashboard')
    } catch (err) {
      console.error('[v0] Completion error:', err)
      // Still redirect even if API fails
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingWizard
      currentStep={6}
      totalSteps={6}
      title={showTour ? 'Take a Quick Tour' : 'You&apos;re All Set!'}
      description={
        showTour ? 'Learn about the key features' : 'Your account is ready to use'
      }
    >
      <div className="space-y-6">
        {!showTour ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Welcome to Hamduk Digital Hub!</h2>
              <p className="text-sm text-muted-foreground">
                Your account is fully set up and ready to use. Start collaborating with your team now.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3">
              {tourItems.map((item, i) => (
                <Card key={i} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          {showTour && (
            <Button
              variant="outline"
              onClick={() => setShowTour(false)}
              disabled={loading}
              className="flex-1"
            >
              Skip tour
            </Button>
          )}
          <Button
            onClick={handleComplete}
            disabled={loading}
            className={showTour ? 'flex-1' : 'w-full'}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {showTour ? 'Start exploring' : 'Go to Dashboard'}
          </Button>
        </div>
      </div>
    </OnboardingWizard>
  )
}
