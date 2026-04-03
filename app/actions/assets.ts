'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createAsset(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'No autenticado' }
    }

    // Get user's organization
    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!userData?.organization_id) {
        return { error: 'Usuario no asociado a una organización' }
    }

    const costUSD = parseFloat(formData.get('cost_usd') as string)
    const usefulLifeMonths = parseInt(formData.get('useful_life_months') as string) || 0

    // Calculate monthly depreciation
    const depreciationMonthly = usefulLifeMonths > 0 ? costUSD / usefulLifeMonths : 0

    const { error } = await supabase
        .from('assets')
        .insert({
            organization_id: userData.organization_id,
            name: formData.get('name') as string,
            category: formData.get('category') as string || null,
            cost_usd: costUSD,
            cost_ves: parseFloat(formData.get('cost_ves') as string) || null,
            useful_life_months: usefulLifeMonths,
            depreciation_monthly: depreciationMonthly,
            accumulated_depreciation: 0,
            location: formData.get('location') as string || null,
            purchase_date: formData.get('purchase_date') as string,
            status: 'active',
            created_by: user.id,
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/inventario')
    return { success: true }
}

export async function updateAssetDepreciation(id: string, months: number) {
    const supabase = await createClient()

    const { data: asset } = await supabase
        .from('assets')
        .select('depreciation_monthly, accumulated_depreciation')
        .eq('id', id)
        .single()

    if (!asset) {
        return { error: 'Activo no encontrado' }
    }

    const newAccumulated = (asset.accumulated_depreciation || 0) + (asset.depreciation_monthly || 0) * months

    const { error } = await supabase
        .from('assets')
        .update({ accumulated_depreciation: newAccumulated })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/inventario')
    return { success: true }
}

export async function updateAssetStatus(id: string, status: 'active' | 'inactive' | 'disposed') {
    const supabase = await createClient()

    const { error } = await supabase
        .from('assets')
        .update({ status })
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/inventario')
    return { success: true }
}

export async function deleteAsset(id: string) {
    const supabase = await createClient()

    // Verify ownership before delete
    const { data: asset } = await supabase
        .from('assets')
        .select('organization_id')
        .eq('id', id)
        .single()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user?.id).single()

    if (asset?.organization_id !== userData?.organization_id) {
        return { error: 'No autorizado' }
    }

    const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/inventario')
    return { success: true }
}
