'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppTopBar } from '@/components/app-top-bar'
import { AnnouncementsBanner } from '@/components/announcements-banner'
import { Loader2 } from 'lucide-react'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AuthenticatedLayout({ children, title }: AuthenticatedLayoutProps) {
  const router = useRouter()
  const { user, permissions, loading } = useAuth()

  useEffect(() => {
    if (loading || !user) return

    // Check if onboarding is required
    const onboardingRequired =
      !user.user_metadata?.completed_onboarding &&
      user.user_metadata?.onboarding_started !== false

    if (onboardingRequired) {
      router.push('/onboarding')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} permissions={permissions || undefined} />
      <div className="flex flex-col w-full">
        <AppTopBar title={title} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <AnnouncementsBanner />
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
