'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type User } from '@/lib/supabase'
import { getUserPermissions, type PermissionContext } from '@/lib/permissions'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<PermissionContext | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user) {
          router.push('/auth/login')
          return
        }

        // Get user profile with role
        const { data, error } = await supabase
          .from('users')
          .select('id, email, role, full_name, avatar_url')
          .eq('id', session.user.id)
          .single()

        if (error || !data) {
          console.error('[v0] Failed to fetch user profile:', error)
          await supabase.auth.signOut()
          router.push('/auth/login')
          return
        }

        setUser(data as User)

        // Fetch permissions for this user
        const perms = await getUserPermissions(session.user.id)
        setPermissions(perms)
      } catch (error) {
        console.error('[v0] Auth check error:', error)
        router.push('/auth/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session?.user) {
        setUser(null)
        router.push('/auth/login')
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Refresh user data
        const { data } = await supabase
          .from('users')
          .select('id, email, role, full_name, avatar_url')
          .eq('id', session.user.id)
          .single()

        if (data) {
          setUser(data as User)
          // Refresh permissions on token refresh
          const perms = await getUserPermissions(session.user.id)
          setPermissions(perms)
        }
      }
    })

    return () => {
      data?.subscription?.unsubscribe()
    }
  }, [router])

  return { user, permissions, loading }
}
