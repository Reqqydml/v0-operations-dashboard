import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LostAccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Lost Access</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Can&apos;t access your authenticator?
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Recovery</CardTitle>
            <CardDescription>
              We&apos;ll help you regain access to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To recover your account, you&apos;ll need to:
            </p>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Use one of your backup codes to sign in</li>
              <li>Or contact support with proof of identity</li>
            </ol>

            <div className="pt-4 space-y-3">
              <Link href="/auth/login" className="block">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
              <a href="mailto:support@hamduk.com" className="block">
                <Button className="w-full">
                  Contact Support
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
