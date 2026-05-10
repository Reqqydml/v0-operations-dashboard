import { createClient } from '@/lib/supabase/client'

export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6

export interface OnboardingProgress {
  currentStep: OnboardingStep
  stepData: Record<string, any>
}

// Check if user has completed onboarding
export async function isOnboardingComplete(userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_completed_password_change, has_completed_profile, has_completed_2fa, has_completed_legal')
    .eq('id', userId)
    .single()

  return !!(
    profile?.has_completed_password_change &&
    profile?.has_completed_profile &&
    profile?.has_completed_2fa &&
    profile?.has_completed_legal
  )
}

// Get current onboarding step
export async function getCurrentOnboardingStep(userId: string): Promise<OnboardingStep> {
  const supabase = createClient()
  const { data } = await supabase
    .from('onboarding_progress')
    .select('current_step')
    .eq('user_id', userId)
    .single()

  return (data?.current_step || 1) as OnboardingStep
}

// Save onboarding progress
export async function saveOnboardingProgress(
  userId: string,
  step: OnboardingStep,
  stepData: Record<string, any>
) {
  const supabase = createClient()
  const { data } = await supabase
    .from('onboarding_progress')
    .upsert({
      user_id: userId,
      current_step: step,
      step_data: stepData,
    })
    .select()

  return data
}

// Mark onboarding step as complete
export async function markStepComplete(userId: string, step: OnboardingStep) {
  const supabase = createClient()
  const completionMap: Record<OnboardingStep, string> = {
    1: 'has_completed_password_change',
    2: 'has_completed_profile',
    3: 'has_completed_profile',
    4: 'has_completed_2fa',
    5: 'has_completed_legal',
    6: 'onboarding_completed_at',
  }

  const updateField = completionMap[step]
  const updateData = step === 6 ? { onboarding_completed_at: new Date().toISOString() } : { [updateField]: true }

  const { data } = await supabase.from('profiles').update(updateData).eq('id', userId).select()

  return data
}

// Get legal documents for user's role
export async function getLegalDocuments(userId: string) {
  const supabase = createClient()

  // Get user's roles first
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role_id, roles(slug)')
    .eq('user_id', userId)

  const roleSlugs = userRoles?.map((ur: any) => ur.roles.slug) || []

  // Get applicable documents
  const { data: documents } = await supabase
    .from('legal_documents')
    .select('*')
    .filter('applies_to_roles', 'cs', `{${roleSlugs.join(',')}}`)
    .eq('required_for_onboarding', true)

  return documents || []
}

// Record document acceptance
export async function acceptDocument(userId: string, documentId: string, documentVersion: number) {
  const supabase = createClient()

  const { data } = await supabase
    .from('user_document_acceptances')
    .upsert({
      user_id: userId,
      document_id: documentId,
      document_version: documentVersion,
    })
    .select()

  return data
}

// Check if user has accepted all required documents
export async function hasAcceptedAllDocuments(userId: string): Promise<boolean> {
  const supabase = createClient()

  const documents = await getLegalDocuments(userId)
  if (documents.length === 0) return true

  const { data: acceptances } = await supabase
    .from('user_document_acceptances')
    .select('document_id')
    .eq('user_id', userId)

  const acceptedIds = new Set(acceptances?.map((a: any) => a.document_id) || [])
  return documents.every((doc: any) => acceptedIds.has(doc.id))
}
