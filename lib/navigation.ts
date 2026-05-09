import {
  LayoutDashboard,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Settings,
  BarChart3,
} from 'lucide-react'

export type Role = 'Super Admin' | 'Admin' | 'Project Manager' | 'Team Lead' | 'Staff' | 'Freelancer' | 'Temp Specialist'

export type NavigationItem = {
  label: string
  href: string
  icon: React.ReactNode
  badge?: string
  color?: 'blue' | 'amber' | 'green' | 'red' | 'gray' | 'purple'
}

export type Module = 'dashboard' | 'team' | 'projects' | 'tasks' | 'approvals' | 'reports' | 'settings'

const icons = {
  dashboard: <LayoutDashboard className="w-4 h-4" />,
  team: <Users className="w-4 h-4" />,
  projects: <FileText className="w-4 h-4" />,
  tasks: <Clock className="w-4 h-4" />,
  approvals: <CheckCircle2 className="w-4 h-4" />,
  reports: <BarChart3 className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
}

// Role-based module access
const roleModuleAccess: Record<Role, Module[]> = {
  'Super Admin': ['dashboard', 'team', 'projects', 'tasks', 'approvals', 'reports', 'settings'],
  'Admin': ['dashboard', 'team', 'projects', 'tasks', 'approvals', 'reports', 'settings'],
  'Project Manager': ['dashboard', 'team', 'projects', 'tasks', 'approvals', 'reports'],
  'Team Lead': ['dashboard', 'projects', 'tasks', 'approvals', 'reports'],
  'Staff': ['dashboard', 'tasks', 'reports'],
  'Freelancer': ['dashboard', 'tasks'],
  'Temp Specialist': ['dashboard', 'tasks'],
}

const moduleNavigation: Record<Module, NavigationItem> = {
  dashboard: {
    label: 'Dashboard',
    href: '/dashboard',
    icon: icons.dashboard,
  },
  team: {
    label: 'Team',
    href: '/team',
    icon: icons.team,
  },
  projects: {
    label: 'Projects',
    href: '/projects',
    icon: icons.projects,
  },
  tasks: {
    label: 'Tasks',
    href: '/tasks',
    icon: icons.tasks,
  },
  approvals: {
    label: 'Approvals',
    href: '/approvals',
    icon: icons.approvals,
    color: 'purple',
  },
  reports: {
    label: 'Reports',
    href: '/reports',
    icon: icons.reports,
  },
  settings: {
    label: 'Settings',
    href: '/settings',
    icon: icons.settings,
  },
}

export function getNavigationForRole(role: Role): NavigationItem[] {
  const modules = roleModuleAccess[role] || []
  return modules.map((module) => moduleNavigation[module])
}

export function hasModuleAccess(role: Role, module: Module): boolean {
  return roleModuleAccess[role]?.includes(module) || false
}

// Color system for semantic values
export const colorSystem = {
  'in-progress': 'bg-blue-500 text-white',
  'review': 'bg-amber-500 text-white',
  'approved': 'bg-purple-500 text-white',
  'complete': 'bg-green-500 text-white',
  'overdue': 'bg-red-500 text-white',
  'pending': 'bg-gray-500 text-white',
}
