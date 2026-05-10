import { Suspense } from 'react'
import LoginVerifyPage from './VerifyForm'

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
      </div>
    }>
      <LoginVerifyPage />
    </Suspense>
  )
}