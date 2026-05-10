'use client'

import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface OnboardingWizardProps {
  currentStep: number
  totalSteps: number
  title: string
  description?: string
  children: ReactNode
}

export function OnboardingWizard({
  currentStep,
  totalSteps,
  title,
  description,
  children,
}: OnboardingWizardProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </h2>
            <span className="text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Card */}
        <Card>
          <CardContent className="pt-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">{title}</h1>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>

            {children}
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          You can save and return to this later. Your progress is automatically saved.
        </p>
      </div>
    </div>
  )
}
