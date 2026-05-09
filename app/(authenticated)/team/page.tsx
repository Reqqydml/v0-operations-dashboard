'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TeamPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground mt-1">Manage your team members and their assignments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>This module will be built in the next phase</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Team management functionality coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
