'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { SuperAdminOnly } from '@/components/permission-guard'
import { supabase } from '@/lib/supabase'

interface RoleRow {
  id: string
  name: string
  slug: string
  description: string
  color: string
  priority: number
  permissionCount?: number
}

export default function RolesPage() {
  const { permissions, loading } = useAuth()
  const [roles, setRoles] = useState<RoleRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!permissions) return
    fetchRoles()
  }, [permissions])

  const fetchRoles = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('roles')
        .select(`
          id,
          name,
          slug,
          description,
          color,
          priority,
          role_permissions(id)
        `)
        .order('priority', { ascending: false })

      if (error) throw error
      if (data) {
        const rolesWithCounts = data.map((r: any) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description,
          color: r.color,
          priority: r.priority,
          permissionCount: r.role_permissions?.length || 0,
        }))
        setRoles(rolesWithCounts)
      }
    } catch (error) {
      console.error('[v0] Error fetching roles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) return null

  return (
    <SuperAdminOnly
      context={permissions!}
      fallback={
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">Access Denied</h3>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              Only Super Admins can manage roles.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground mt-2">Create and manage user roles and permissions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>All system roles and their permission counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading roles...</p>
              ) : roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No roles found</p>
              ) : (
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{role.name}</h3>
                          <Badge variant="outline">{role.slug}</Badge>
                          <Badge variant="secondary">{role.permissionCount} permissions</Badge>
                        </div>
                        {role.description && (
                          <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Hierarchy</CardTitle>
            <CardDescription>Priority levels determine role precedence</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Higher priority roles have more permissions and override lower priority roles.
            </p>
          </CardContent>
        </Card>
      </div>
    </SuperAdminOnly>
  )
}
