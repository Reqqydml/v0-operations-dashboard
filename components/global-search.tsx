'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'project' | 'task' | 'user'
  href: string
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }

      if (isOpen) {
        if (e.key === 'Escape') {
          setIsOpen(false)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((i) => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && results[selectedIndex]) {
          window.location.href = results[selectedIndex].href
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Search
  useEffect(() => {
    const searchAsync = async () => {
      if (!query.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`)
        const data = await response.json()
        setResults(data)
        setSelectedIndex(0)
      } catch (error) {
        console.error('[v0] Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchAsync, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search projects, tasks, people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {results.length > 0 && (
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <Link
                key={result.id}
                href={result.href}
                className={`flex items-start gap-3 p-3 hover:bg-accent transition-colors ${
                  index === selectedIndex ? 'bg-accent' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{result.title}</p>
                  {result.description && (
                    <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                  )}
                  <span className="text-xs text-muted-foreground capitalize">{result.type}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No results found</p>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Press <kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd> to navigate, <kbd className="px-1 py-0.5 bg-muted rounded">↵</kbd> to select, <kbd className="px-1 py-0.5 bg-muted rounded">ESC</kbd> to close</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
