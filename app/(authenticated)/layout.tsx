import { AuthenticatedLayout } from '@/components/authenticated-layout'

export default function AuthenticatedRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
