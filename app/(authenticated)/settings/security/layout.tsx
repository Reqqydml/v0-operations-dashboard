'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SecurityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const tabs = [
    { label: 'Two-Factor Auth', href: '/settings/security/2fa' },
    { label: 'Trusted Devices', href: '/settings/security/devices' },
    { label: 'Sessions', href: '/settings/security/sessions' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Security Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and authentication
        </p>
      </div>

      <Tabs defaultValue="2fa" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map((tab) => (
            <Link key={tab.href} href={tab.href}>
              <TabsTrigger value={tab.label.toLowerCase().replace(' ', '-')} className="w-full">
                {tab.label}
              </TabsTrigger>
            </Link>
          ))}
        </TabsList>

        <TabsContent value="2fa" className="mt-6">
          {children}
        </TabsContent>
      </Tabs>
    </div>
  )
}
