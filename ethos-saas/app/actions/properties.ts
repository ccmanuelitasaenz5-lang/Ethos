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
    revalidatePath('/dashboard/configuracion')
    return { success: true }
}

export async function importPropertiesFromText(text: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!userData?.organization_id) return { error: 'No autorizado' }

    const lines = text.split('\n')
    const results = { success: 0, error: 0 }

    for (let line of lines) {
        line = line.trim()
        if (!line) continue

        const parts = line.split('|').map(p => p.trim())
        if (parts.length < 2) { // Allow omitting aliquot
            results.error++
            continue
        }

        const [number, owner_name, aliquotStr] = parts
        const aliquot = aliquotStr ? parseFloat(aliquotStr) : 0

        // Check duplicates? For now just try insert, will fail if unique constraint violated (org_id + number)
        const { error } = await supabase.from('properties').insert({
            organization_id: userData.organization_id,
            number,
            owner_name,
            aliquot
        })

        if (error) {
            console.error('Error importing property:', number, error.message)
            results.error++
        } else {
            results.success++
        }
    }

    revalidatePath('/dashboard/configuracion')
    return results
}
