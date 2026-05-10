import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: {
        getItem: (key) => {
          if (typeof document === 'undefined') return null
          const cookies = document.cookie.split('; ')
          const found = cookies.find((c) => c.startsWith(`${key}=`))
          return found ? decodeURIComponent(found.split('=')[1]) : null
        },
        setItem: (key, value) => {
          document.cookie = `${key}=${encodeURIComponent(value)};path=/;max-age=31536000;SameSite=Lax`
        },
        removeItem: (key) => {
          document.cookie = `${key}=;path=/;max-age=0`
        },
      },
    },
  }
)

export type User = {
  id: string
  email: string
  role: string
  full_name: string | null
  avatar_url: string | null
}