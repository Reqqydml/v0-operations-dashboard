'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { OnboardingWizard } from '@/components/onboarding-wizard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Upload, Loader2, AlertCircle, X } from 'lucide-react'

export default function OnboardingStep2() {
  const router = useRouter()
  const { user } = useAuth()
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!preview || !user) return

    setLoading(true)
    setError(null)

    try {
      // Convert data URL to blob
      const response = await fetch(preview)
      const blob = await response.blob()

      // Upload to Supabase storage
      const filename = `${user.id}-${Date.now()}.jpg`
      const { data, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filename, blob, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(data.path)

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Save progress
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: 3,
          stepData: {},
        }),
      })

      router.push('/onboarding/step-3')
    } catch (err) {
      setError('Failed to upload photo. Please try again.')
      console.error('[v0] Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleContinue = async () => {
    // Save progress without photo
    await fetch('/api/onboarding/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentStep: 3,
        stepData: {},
      }),
    })

    router.push('/onboarding/step-3')
  }

  return (
    <OnboardingWizard
      currentStep={2}
      totalSteps={6}
      title="Add Your Profile Photo"
      description="Upload a profile picture to help your team recognize you"
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Photo Preview */}
        {preview ? (
          <div className="flex flex-col items-center gap-4">
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 rounded-lg object-cover"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreview(null)}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        ) : (
          <div>
            <label
              htmlFor="photo-input"
              className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
            >
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="font-medium">Click to upload or drag and drop</span>
              <span className="text-sm text-muted-foreground">PNG, JPG up to 5MB</span>
            </label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={loading}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleContinue}
            disabled={loading}
            className="flex-1"
          >
            Skip photo
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!preview || loading}
            className="flex-1"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Uploading...' : 'Upload photo'}
          </Button>
        </div>
      </div>
    </OnboardingWizard>
  )
}
