import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createClientJS } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Cliente estándar para acciones de usuario
export function createClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variables de entorno de Supabase faltantes (URL o ANON_KEY)')
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) { }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) { }
        },
      },
    }
  )
}

// Cliente con privilegios para procesos de registro (bypass RLS)
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variables de entorno de Supabase faltantes (URL o SERVICE_ROLE_KEY)')
  }

  // Usamos createClient de supabase-js directamente para el admin
  // para asegurar bypass de RLS y que no dependa de cookies/sesión
  return createClientJS(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}