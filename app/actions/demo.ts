'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { seedDefaultAccounts } from './accounting'

export async function createDemoUser() {
    const adminSupabase = createAdminClient()

    const demoEmail = 'evaluador@ethos.com'
    const demoPassword = 'EthosReview2026!'
    const demoName = 'Evaluador Profesional'
    const demoOrg = 'Ethos Demo Corp'

    // 1. Verificar si el usuario ya existe en Auth
    const { data: { users } } = await adminSupabase.auth.admin.listUsers()
    const existingUser = users.find(u => u.email === demoEmail)

    let userId: string

    if (!existingUser) {
        // Crear en Auth
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email: demoEmail,
            password: demoPassword,
            email_confirm: true,
            user_metadata: { full_name: demoName }
        })

        if (authError) return { error: `Error creando Auth: ${authError.message}` }
        userId = authData.user.id
    } else {
        userId = existingUser.id
    }

    // 2. Buscar o Crear Organización
    let { data: orgData, error: orgError } = await adminSupabase
        .from('organizations')
        .select()
        .eq('name', demoOrg)
        .maybeSingle()

    if (orgError) return { error: `Error buscando Org: ${orgError.message}` }

    if (!orgData) {
        const { data: newOrg, error: insertError } = await adminSupabase
            .from('organizations')
            .insert({ name: demoOrg })
            .select()
            .single()

        if (insertError) return { error: `Error creando Org: ${insertError.message}` }
        orgData = newOrg
    }

    // 3. Vincular Perfil
    const { error: userError } = await adminSupabase
        .from('users')
        .upsert({
            id: userId,
            organization_id: orgData.id,
            full_name: demoName,
            role: 'admin'
        })

    if (userError) return { error: `Error vinculando perfil: ${userError.message}` }

    // 4. Inicializar Plan de Cuentas para esta org
    await seedDefaultAccounts(orgData.id)

    return {
        success: true,
        email: demoEmail,
        password: demoPassword
    }
}
