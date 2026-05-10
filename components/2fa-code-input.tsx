'use client'

import { useRef, useEffect } from 'react'

interface CodeInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  onComplete?: (code: string) => void
}

export function CodeInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  onComplete,
}: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Auto-focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key

    if (key === 'Backspace') {
      e.preventDefault()
      const newValue = value.slice(0, index) + value.slice(index + 1)
      onChange(newValue)
      if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      return
    }

    if (key === 'ArrowLeft') {
      e.preventDefault()
      if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      return
    }

    if (key === 'ArrowRight') {
      e.preventDefault()
      if (index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
      return
    }

    if (!/^\d$/.test(key)) {
      e.preventDefault()
      return
    }
  }

  const handleInput = (e: React.FormEvent<HTMLInputElement>, index: number) => {
    const input = e.currentTarget
    const digit = input.value.slice(-1)

    if (!/^\d$/.test(digit) && digit !== '') {
      input.value = value[index] || ''
      return
    }

    const newValue = value.slice(0, index) + digit + value.slice(index + 1)
    onChange(newValue.slice(0, length))

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Call onComplete when all digits are filled
    if (newValue.slice(0, length).length === length && onComplete) {
      onComplete(newValue.slice(0, length))
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData) {
      onChange(pastedData)
      
      // Focus last input
      const lastIndex = Math.min(pastedData.length - 1, length - 1)
      inputRefs.current[lastIndex]?.focus()

      // Call onComplete if all digits are filled
      if (pastedData.length === length && onComplete) {
        onComplete(pastedData)
      }
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleInput(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-12 text-center text-2xl font-bold border-2 border-input rounded-lg bg-background focus:border-primary focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Code digit ${index + 1}`}
        />
      ))}
    </div>
  )
}
