'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrganization(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autorizado')

    const organizationId = formData.get('organization_id') as string
    const name = formData.get('name') as string
    const rif = formData.get('rif') as string
    const address = formData.get('address') as string
    const phone = formData.get('phone') as string
    const legal_representative = formData.get('legal_representative') as string
    const representative_phone = formData.get('representative_phone') as string
    const representative_role = formData.get('representative_role') as string

    const { error } = await supabase
        .from('organizations')
        .update({
            name,
            rif,
            address,
            phone,
            legal_representative,
            representative_phone,
            representative_role
        })
        .eq('id', organizationId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/configuracion')
    revalidatePath('/dashboard', 'layout')
    return { success: true }
}

export async function getProperties() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!userData?.organization_id) return []

    const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', userData.organization_id)
        .order('number', { ascending: true })

    return data || []
}
