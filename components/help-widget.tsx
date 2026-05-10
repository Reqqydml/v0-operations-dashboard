'use client'

import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function HelpWidget() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" title="Help & Support">
          <HelpCircle className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem disabled className="text-xs font-semibold text-muted-foreground">
          Help & Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <a href="#" className="w-full">
            📚 Documentation
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="#" className="w-full">
            🎥 Video Tutorials
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="#" className="w-full">
            ❓ FAQ
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <a href="#" className="w-full">
            💬 Contact Support
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <a href="#" className="w-full">
            🐛 Report Issue
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button onClick={() => setIsOpen(false)} className="w-full text-left text-xs text-muted-foreground">
            Press Cmd+? for keyboard shortcuts
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
