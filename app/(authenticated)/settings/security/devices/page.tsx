import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TrustedDevicesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trusted Devices</CardTitle>
          <CardDescription>
            Devices you&apos;ve marked as trusted will not require 2FA verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            No trusted devices yet. Devices will appear here once you enable 2FA and trust them during login.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
