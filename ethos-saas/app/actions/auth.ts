'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
    const supabase = createClient()
    const adminSupabase = createAdminClient()

    const fullName = formData.get('full_name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const orgName = (formData.get('org_name') as string) || `Empresa de ${fullName}`

    if (!email || !password || !fullName) {
        return { error: 'Todos los campos son obligatorios' }
    }

    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
    })

    if (authError) return { error: `Error en Auth: ${authError.message}` }
    if (!authData.user) return { error: 'No se pudo crear el usuario' }

    // 2. Crear la organización
    // Intentamos insertar. Si falla, capturamos el error exacto de la DB
    const { data: orgData, error: orgError } = await adminSupabase
        .from('organizations')
        .insert({ name: orgName })
        .select()
        .single()

    if (orgError) {
        // Este console.log aparecerá en tu terminal de VS Code
        console.error('ERROR CRÍTICO DB:', orgError);
        return { error: `Error DB (Organización): ${orgError.message} - ${orgError.details || ''}` }
    }

    // 3. Vincular perfil
    const { error: userError } = await adminSupabase
        .from('users')
        .insert({
            id: authData.user.id,
            organization_id: orgData.id,
            full_name: fullName,
            role: 'admin'
        })

    if (userError) {
        return { error: `Error DB (Perfil): ${userError.message}` }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function login(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email y contraseña son obligatorios' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        return { error: 'Credenciales inválidas' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function resetPassword(formData: FormData) {
    const supabase = createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    })

    if (error) return { error: error.message }
    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const supabase = createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) return { error: error.message }
    return { success: true }
}
