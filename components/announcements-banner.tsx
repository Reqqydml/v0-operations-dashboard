'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface Announcement {
  id: string
  title: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  dismissible: boolean
}

export function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, message, severity, dismissible')
        .eq('is_active', true)
        .order('severity', { ascending: false })

      if (data) {
        setAnnouncements(data)
      }
    }

    fetchAnnouncements()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        fetchAnnouncements()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const visibleAnnouncements = announcements.filter((a) => !dismissed.has(a.id))

  const dismissAnnouncement = (id: string) => {
    setDismissed(new Set([...dismissed, id]))
  }

  if (visibleAnnouncements.length === 0) return null

  return (
    <div className="space-y-2 mb-4">
      {visibleAnnouncements.map((announcement) => {
        const iconClass = {
          info: 'text-blue-500',
          warning: 'text-amber-500',
          critical: 'text-red-500',
        }[announcement.severity]

        const bgClass = {
          info: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
          warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
          critical: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
        }[announcement.severity]

        const Icon = announcement.severity === 'critical' ? AlertCircle : AlertTriangle

        return (
          <div key={announcement.id} className={`border rounded-lg p-4 flex items-start justify-between ${bgClass}`}>
            <div className="flex items-start gap-3 flex-1">
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconClass}`} />
              <div>
                <p className="font-medium text-sm">{announcement.title}</p>
                <p className="text-sm text-muted-foreground">{announcement.message}</p>
              </div>
            </div>
            {announcement.dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAnnouncement(announcement.id)}
                className="ml-2 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}
