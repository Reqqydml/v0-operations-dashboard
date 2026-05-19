'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { navigationConfig, filterNavigationByPermissions, roleColors } from '@/lib/navigation'
import { PermissionContext } from '@/lib/permissions'
import type { User as UserType } from '@/lib/supabase'

interface AppSidebarProps {
  user: UserType | null
  permissions?: PermissionContext
}

export function AppSidebar({ user, permissions }: AppSidebarProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Filter navigation based on permissions
  const userRoles = permissions?.roles.map((r) => r.slug) || []
  const userPermissions = permissions?.permissions.map((p) => p.slug) || []
  const allNavItems = navigationConfig.mainNav.flatMap((group) => group.items)
  const navigation = filterNavigationByPermissions(allNavItems, userRoles, userPermissions)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('[v0] Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserInitials = () => {
    if (!user?.full_name) return 'U'
    return user.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-between px-2 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
              HD
            </div>
            <span className="hidden sm:inline text-sm">Hamduk</span>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href} className="flex items-center gap-2">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="h-auto py-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || 'User'} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-xs font-medium">{user.full_name || user.email}</span>
                      {permissions?.roles && permissions.roles.length > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded ${roleColors[permissions.roles[0].slug] || 'bg-gray-100'}`}>
                          {permissions.roles[0].name}
                        </span>
                      )}
                    </div>
                    <ChevronDown className="ml-auto w-4 h-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/settings/security/2fa">
                      <User className="w-4 h-4" />
                      <span>Profile & Security</span>
                    </Link>
                  </DropdownMenuItem>
                  {permissions?.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4" />
                        <span>System Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
                    <LogOut className="w-4 h-4" />
                    <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}