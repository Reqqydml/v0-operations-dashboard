'use client'

import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, FileText, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Total Projects',
      value: '12',
      description: 'Active projects',
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Team Members',
      value: '24',
      description: 'Active members',
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Tasks In Progress',
      value: '48',
      description: 'Current tasks',
      icon: Clock,
      color: 'text-amber-500',
    },
    {
      title: 'Completion Rate',
      value: '87%',
      description: 'This month',
      icon: BarChart3,
      color: 'text-green-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.full_name || 'User'}</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your projects today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Placeholder Content */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Activity feed will be populated once modules are set up.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
