'use client'

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
  const { user, permissions, loading } = useAuth()

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
