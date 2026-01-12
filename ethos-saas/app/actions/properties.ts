'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProperty(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!userData?.organization_id) return { error: 'No autorizado' }

    const number = formData.get('number') as string
    const owner_name = formData.get('owner_name') as string
    const aliquot = parseFloat(formData.get('aliquot') as string) || 0

    const { error } = await supabase
        .from('properties')
        .insert({
            organization_id: userData.organization_id,
            number,
            owner_name,
            aliquot
        })

    if (error) return { error: error.message }

    revalidatePath('/dashboard/configuracion')
    return { success: true }
}

export async function deleteProperty(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/configuracion')
    return { success: true }
}
