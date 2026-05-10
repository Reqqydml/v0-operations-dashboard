'use client'

import { useEffect, useRef } from 'react'

interface QRCodeProps {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
}

// Simple QR code generation using qr-code-styling library
// For production, consider using a proper library like 'qrcode' or 'qr-code-styling'
export function QRCode({ value, size = 200, level = 'M' }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // For a simple implementation, we'll use a third-party API
    // In production, you'd want to use a library like 'qrcode' or 'qr-code-styling'
    // This is just a placeholder that shows the expected structure
    
    // Dynamic import of qrcode library
    import('qrcode').then((QRCode) => {
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          value,
          {
            errorCorrectionLevel: level,
            type: 'image/png',
            width: size,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          },
          (error) => {
            if (error) {
              console.error('[v0] QR code generation error:', error)
            }
          }
        )
      }
    }).catch((error) => {
      console.error('[v0] Failed to load qrcode library:', error)
    })
  }, [value, size, level])

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="border-2 border-input rounded-lg bg-white p-2"
      />
    </div>
  )
}
