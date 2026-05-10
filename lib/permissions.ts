import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export type Role = {
  id: string
  name: string
  slug: string
  description: string
  color: string
  priority: number
}

export type Permission = {
  id: string
  name: string
  slug: string
  description: string
  category: string
}

export type PermissionContext = {
  userId?: string
  roles: Role[]
  permissions: Permission[]
  isSuperAdmin: boolean
  isAdmin: boolean
  isTempSpecialist: boolean
  tempSpecialistExpired: boolean
}

/**
 * Fetch user's roles and permissions
 */
export async function getUserPermissions(userId: string): Promise<PermissionContext> {
  try {
    // Fetch user roles with permissions
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select(`
        role_id,
        roles:role_id (
          id,
          name,
          slug,
          description,
          color,
          priority
        )
      `)
      .eq('user_id', userId)

    const roles = (userRoles || []).map((ur: any) => ur.roles).filter(Boolean)

    // Fetch permissions for these roles
    const roleIds = roles.map((r: Role) => r.id)
    let permissions: Permission[] = []

    if (roleIds.length > 0) {
      const { data: rolePerms } = await supabase
        .from('role_permissions')
        .select(`
          permission_id,
          permissions:permission_id (
            id,
            name,
            slug,
            description,
            category
          )
        `)
        .in('role_id', roleIds)

      // Deduplicate permissions
      const permMap = new Map<string, Permission>()
      ;(rolePerms || []).forEach((rp: any) => {
        if (rp.permissions) {
          permMap.set(rp.permissions.id, rp.permissions)
        }
      })
      permissions = Array.from(permMap.values())
    }

    // Check for temp specialist expiry
    const { data: tempSpec } = await supabase
      .from('temp_specialist_metadata')
      .select('end_date, is_suspended')
      .eq('user_id', userId)
      .single()

    const isTempSpecialist = roles.some((r: Role) => r.slug === 'temp_specialist')
    const tempSpecialistExpired =
      isTempSpecialist && tempSpec ? new Date(tempSpec.end_date) < new Date() : false
    const tempSpecialistSuspended = isTempSpecialist && tempSpec?.is_suspended

    return {
      userId,
      roles,
      permissions,
      isSuperAdmin: roles.some((r: Role) => r.slug === 'super_admin'),
      isAdmin: roles.some((r: Role) => r.slug === 'admin' || r.slug === 'super_admin'),
      isTempSpecialist,
      tempSpecialistExpired: tempSpecialistExpired || tempSpecialistSuspended,
    }
  } catch (error) {
    console.error('[v0] Error fetching user permissions:', error)
    return {
      roles: [],
      permissions: [],
      isSuperAdmin: false,
      isAdmin: false,
      isTempSpecialist: false,
      tempSpecialistExpired: false,
    }
  }
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  context: PermissionContext,
  permissionSlug: string
): boolean {
  if (context.isSuperAdmin) return true
  if (context.tempSpecialistExpired) return false
  return context.permissions.some((p) => p.slug === permissionSlug)
}

/**
 * Check if user has any of the given permissions
 */
export function hasAnyPermission(
  context: PermissionContext,
  permissionSlugs: string[]
): boolean {
  if (context.isSuperAdmin) return true
  if (context.tempSpecialistExpired) return false
  return permissionSlugs.some((slug) =>
    context.permissions.some((p) => p.slug === slug)
  )
}

/**
 * Check if user has all of the given permissions
 */
export function hasAllPermissions(
  context: PermissionContext,
  permissionSlugs: string[]
): boolean {
  if (context.isSuperAdmin) return true
  if (context.tempSpecialistExpired) return false
  return permissionSlugs.every((slug) =>
    context.permissions.some((p) => p.slug === slug)
  )
}

/**
 * Get user's primary role (highest priority)
 */
export function getPrimaryRole(context: PermissionContext): Role | null {
  if (context.roles.length === 0) return null
  return context.roles.reduce((prev, current) =>
    (prev.priority || 0) > (current.priority || 0) ? prev : current
  )
}

/**
 * Filter modules based on user permissions
 */
export function filterModulesByPermission(
  modules: Array<{ slug: string; requiredPermission?: string }>,
  context: PermissionContext
): typeof modules {
  return modules.filter((module) => {
    if (!module.requiredPermission) return true
    return hasPermission(context, module.requiredPermission)
  })
}
