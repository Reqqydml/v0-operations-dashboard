'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { OnboardingWizard } from '@/components/onboarding-wizard'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle } from 'lucide-react'

export default function OnboardingStep3() {
  const router = useRouter()
  const { user } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [bio, setBio] = useState('')
  const [specializations, setSpecializations] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
    setLoading(true)
    setError(null)

    try {
      const specs = specializations
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone_number: phoneNumber || null,
          bio: bio || null,
          specializations: specs.length > 0 ? specs : null,
          has_completed_profile: true,
        })
        .eq('id', user?.id)

      if (updateError) throw updateError

      // Save progress
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: 4,
          stepData: {},
        }),
      })

      router.push('/onboarding/step-4')
    } catch (err) {
      setError('Failed to save profile. Please try again.')
      console.error('[v0] Profile update error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OnboardingWizard
      currentStep={3}
      totalSteps={6}
      title="Complete Your Profile"
      description="Help your team get to know you better"
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Phone */}
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone Number <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label htmlFor="bio" className="text-sm font-medium">
            Bio <span className="text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
            rows={4}
          />
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label htmlFor="specializations" className="text-sm font-medium">
            Skills & Specializations <span className="text-muted-foreground">(comma-separated, optional)</span>
          </label>
          <Input
            id="specializations"
            placeholder="e.g. UI Design, Project Management, JavaScript"
            value={specializations}
            onChange={(e) => setSpecializations(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => router.push('/onboarding/step-4')}
            disabled={loading}
          >
            Skip
          </Button>
          <Button
            onClick={handleContinue}
            disabled={loading}
            className="flex-1"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>
    </OnboardingWizard>
  )
}
