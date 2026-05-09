'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()

  const isAdmin = user?.role === 'Super Admin' || user?.role === 'Admin'

  if (!isAdmin) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">System configuration</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Access Denied</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Only administrators can access this page.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">System configuration and management</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>This module will be built in the next phase</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            System settings and configuration coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
