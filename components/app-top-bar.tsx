'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface AppTopBarProps {
  title?: string
}

export function AppTopBar({ title = 'Dashboard' }: AppTopBarProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4 h-16 px-4 sm:px-6">
        {/* Left: Sidebar trigger + title */}
        <div className="flex items-center gap-3 flex-1">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold hidden sm:inline">{title}</h1>
        </div>

        {/* Center: Search */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-10 h-9 bg-sidebar text-sm"
            />
          </div>
        </div>

        {/* Right: Notifications */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  )
}
