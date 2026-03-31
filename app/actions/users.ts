'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UserRole = 'admin' | 'auditor' | 'resident'

export async function getOrganizationUsers() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!userData?.organization_id) return []

    // Note: Ideally we should join with auth.users to get emails, but we can't cross-schema join easily in client.
    // For now we return what is in public.users.
    // If email is needed, we should add it to public.users via triggers or manual sync.
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .order('full_name')

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return users
}

export async function updateUserRole(userId: string, newRole: UserRole) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    // 1. Verify requester is admin
    const { data: requester } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!requester || requester.role !== 'admin') {
        return { error: 'Se requieren permisos de administrador' }
    }

    // 2. Verify target user belongs to same organization
    const { data: targetUser } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single()

    if (!targetUser || targetUser.organization_id !== requester.organization_id) {
        return { error: 'Usuario no encontrado en tu organización' }
    }

    // 3. Update role
    const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/configuracion/usuarios')
    return { success: true }
}

export async function removeUser(userId: string) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    // 1. Verify requester is admin
    const { data: requester } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!requester || requester.role !== 'admin') {
        return { error: 'Se requieren permisos de administrador' }
    }

    // Prevent self-deletion
    if (userId === user.id) {
        return { error: 'No puedes eliminar tu propia cuenta desde aquí.' }
    }

    // 2. Verify target user belongs to same organization
    const { data: targetUser } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single()

    if (!targetUser || targetUser.organization_id !== requester.organization_id) {
        return { error: 'Usuario no encontrado en tu organización' }
    }

    // 3. Delete from auth.users (Cascades to public.users)
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId)

    if (deleteError) return { error: deleteError.message }

    revalidatePath('/dashboard/configuracion/usuarios')
    return { success: true }
}

export async function inviteUser(formData: FormData) {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    // 1. Verify requester is admin
    const { data: requester } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

    if (!requester || requester.role !== 'admin') {
        return { error: 'Se requieren permisos de administrador' }
    }

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const role = formData.get('role') as UserRole || 'resident'

    if (!email || !fullName) return { error: 'Email y nombre son requeridos' }

    // 2. Invite user via Supabase Auth
    // Note: This sends an email if Supabase SMTP is configured.
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email)

    if (inviteError) return { error: inviteError.message }

    if (!inviteData.user) return { error: 'Error al generar invitación' }

    // 3. Create record in public.users linked to the invited user ID
    const { error: dbError } = await adminSupabase
        .from('users')
        .insert({
            id: inviteData.user.id,
            organization_id: requester.organization_id,
            full_name: fullName,
            role: role
        })

    if (dbError) {
         console.error('Error inserting user record:', dbError)
         // Attempt cleanup if DB insert fails
         await adminSupabase.auth.admin.deleteUser(inviteData.user.id)
         return { error: 'Error asignando usuario a la organización: ' + dbError.message }
    }

    revalidatePath('/dashboard/configuracion/usuarios')
    return { success: true }
}
