'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { OnboardingWizard } from '@/components/onboarding-wizard'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Loader2, AlertCircle, FileText } from 'lucide-react'
import { getLegalDocuments, acceptDocument } from '@/lib/onboarding'

interface Document {
  id: string
  title: string
  slug: string
  content: string
  type: string
  version: number
}

export default function OnboardingStep5() {
  const router = useRouter()
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [accepted, setAccepted] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDocuments() {
      try {
        if (!user) return
        const docs = await getLegalDocuments(user.id)
        setDocuments(docs)
        // Initialize acceptance state
        const initialAccepted: Record<string, boolean> = {}
        docs.forEach((doc: Document) => {
          initialAccepted[doc.id] = false
        })
        setAccepted(initialAccepted)
      } catch (err) {
        setError('Failed to load documents')
        console.error('[v0] Document fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [user])

  const allAccepted = documents.length > 0 && documents.every((doc) => accepted[doc.id])

  const handleContinue = async () => {
    if (!allAccepted) return

    setSaving(true)
    setError(null)

    try {
      // Save all acceptances
      for (const doc of documents) {
        if (accepted[doc.id]) {
          await acceptDocument(user!.id, doc.id, doc.version)
        }
      }

      // Mark legal as complete
      await supabase
        .from('profiles')
        .update({ has_completed_legal: true })
        .eq('id', user?.id)

      // Save progress
      await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentStep: 6,
          stepData: {},
        }),
      })

      router.push('/onboarding/step-6')
    } catch (err) {
      setError('Failed to save acceptances. Please try again.')
      console.error('[v0] Acceptance error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <OnboardingWizard currentStep={5} totalSteps={6} title="Loading documents...">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </OnboardingWizard>
    )
  }

  return (
    <OnboardingWizard
      currentStep={5}
      totalSteps={6}
      title="Review Legal Documents"
      description="Please read and accept the required documents"
    >
      <div className="space-y-6">
        {error && (
          <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Documents */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      v{doc.version}
                    </CardDescription>
                  </div>
                  <Checkbox
                    id={`doc-${doc.id}`}
                    checked={accepted[doc.id] || false}
                    onCheckedChange={(checked) =>
                      setAccepted({ ...accepted, [doc.id]: checked as boolean })
                    }
                  />
                </div>
              </CardHeader>
              {accepted[doc.id] && (
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert text-sm max-w-none">
                    <p>{doc.content}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Agreement notice */}
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No documents required for your role
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            By checking each box, you acknowledge that you have read and agree to the terms in each document.
          </p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => router.push('/onboarding/step-6')}
            disabled={saving || (!allAccepted && documents.length > 0)}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!allAccepted || saving}
            className="flex-1"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {saving ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </div>
    </OnboardingWizard>
  )
}
