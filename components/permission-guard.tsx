'use client'

import { ReactNode } from 'react'
import { PermissionContext } from '@/lib/permissions'
import { hasPermission, hasAnyPermission, hasAllPermission } from '@/lib/permissions'

interface PermissionGuardProps {
  context: PermissionContext
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Guards content based on user permissions
 * Use permission for single permission check
 * Use permissions array with requireAll=false for OR logic
 * Use permissions array with requireAll=true for AND logic
 */
export function PermissionGuard({
  context,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  // If temp specialist expired, deny access
  if (context.tempSpecialistExpired) {
    return <>{fallback}</>
  }

  // If super admin, always allow
  if (context.isSuperAdmin) {
    return <>{children}</>
  }

  // Check single permission
  if (permission) {
    if (!hasPermission(context, permission)) {
      return <>{fallback}</>
    }
    return <>{children}</>
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? permissions.every((p) => hasPermission(context, p))
      : permissions.some((p) => hasPermission(context, p))

    if (!hasAccess) {
      return <>{fallback}</>
    }
    return <>{children}</>
  }

  // No permission to check, show children
  return <>{children}</>
}

interface AdminOnlyProps {
  context: PermissionContext
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Guards content for admin+ roles only
 */
export function AdminOnly({ context, fallback = null, children }: AdminOnlyProps) {
  if (!context.isAdmin) {
    return <>{fallback}</>
  }
  return <>{children}</>
}

interface SuperAdminOnlyProps {
  context: PermissionContext
  fallback?: ReactNode
  children: ReactNode
}

/**
 * Guards content for super admin only
 */
export function SuperAdminOnly({
  context,
  fallback = null,
  children,
}: SuperAdminOnlyProps) {
  if (!context.isSuperAdmin) {
    return <>{fallback}</>
  }
  return <>{children}</>
}
