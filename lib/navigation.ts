import { LucideIcon, LayoutDashboard, Users, Briefcase, CheckSquare, FileText, Settings, MessageSquare, Database, TrendingUp, User, Lock } from 'lucide-react'

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
  requiredPermission?: string
  requiredRole?: string[]
  badge?: string
  badgeColor?: 'blue' | 'amber' | 'green' | 'red' | 'purple' | 'gray'
}

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

export interface NavigationConfig {
  mainNav: NavigationGroup[]
  settingsNav: NavigationItem[]
}

/**
 * All available navigation items with their permission requirements
 * Items can be filtered based on user role and permissions
 */
export const navigationConfig: NavigationConfig = {
  mainNav: [
    {
      label: 'Core',
      items: [
        {
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          requiredPermission: 'view_dashboard',
        },
        {
          label: 'Team',
          href: '/team',
          icon: Users,
          requiredPermission: 'view_team',
        },
        {
          label: 'Projects',
          href: '/projects',
          icon: Briefcase,
          requiredPermission: 'view_projects',
        },
        {
          label: 'Tasks',
          href: '/tasks',
          icon: CheckSquare,
          requiredPermission: 'view_tasks',
        },
      ],
    },
    {
      label: 'Business',
      items: [
        {
          label: 'Approvals',
          href: '/approvals',
          icon: FileText,
          requiredPermission: 'view_approvals',
        },
        {
          label: 'Chat',
          href: '/team-chat',
          icon: MessageSquare,
          requiredRole: ['admin', 'super_admin', 'project_manager', 'team_lead'],
        },
        {
          label: 'Finance',
          href: '/finance',
          icon: Database,
          requiredRole: ['admin', 'super_admin', 'project_manager'],
        },
        {
          label: 'Analytics',
          href: '/reports',
          icon: TrendingUp,
          requiredPermission: 'view_analytics',
        },
      ],
    },
  ],
  settingsNav: [
    {
      label: 'Profile',
      href: '/settings/profile',
      icon: User,
    },
    {
      label: 'Security',
      href: '/settings/security/2fa',
      icon: Lock,
    },
    {
      label: 'System',
      href: '/settings',
      icon: Settings,
      requiredRole: ['admin', 'super_admin'],
    },
  ],
}

/**
 * Status color mapping
 */
export const statusColors = {
  inProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  review: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  complete: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
  approved: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
}

/**
 * Role color mapping for displaying user roles
 */
export const roleColors: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  project_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  team_lead: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  staff: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
  freelancer: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  temp_specialist: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

/**
 * Filter navigation items by user permissions
 */
export function filterNavigationByPermissions(
  items: NavigationItem[],
  userRoles: string[],
  userPermissions: string[]
): NavigationItem[] {
  return items.filter((item) => {
    // If has specific role requirement
    if (item.requiredRole && item.requiredRole.length > 0) {
      return item.requiredRole.some((role) => userRoles.includes(role))
    }

    // If has permission requirement
    if (item.requiredPermission) {
      return userPermissions.includes(item.requiredPermission)
    }

    // No requirements, show to everyone
    return true
  })
}

/**
 * Get navigation items for display, flattening groups and filtering by permissions
 */
export function getFilteredNavigation(
  userRoles: string[],
  userPermissions: string[]
): NavigationItem[] {
  const allItems = navigationConfig.mainNav.flatMap((group) => group.items)
  return filterNavigationByPermissions(allItems, userRoles, userPermissions)
}
