import { createClient } from '@/lib/supabase/server'
import { differenceInMonths, parseISO } from 'date-fns'

export async function validateAccountCode(organizationId: string, code: string): Promise<boolean> {
    const supabase = createClient()

    const { count, error } = await supabase
        .from('accounting_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('code', code)

    if (error) {
        console.error('Error validating account code:', error)
        return false
    }

    return (count || 0) > 0
}

interface InflationAdjustmentResult {
    factor: number
    initialIndex: number
    finalIndex: number
    adjustedAmount: number
}

/**
 * Calculates the inflation adjustment factor using INPC indices.
 * Formula: Factor = Final Index / Initial Index
 */
export async function calculateInflationAdjustment(
    amount: number,
    initialDate: Date,
    finalDate: Date
): Promise<InflationAdjustmentResult | null> {
    const supabase = createClient()

    const initialYear = initialDate.getFullYear()
    const initialMonth = initialDate.getMonth() + 1 // 1-indexed for DB

    const finalYear = finalDate.getFullYear()
    const finalMonth = finalDate.getMonth() + 1

    // Fetch both indices
    const { data: indices, error } = await supabase
        .from('inflation_indices')
        .select('year, month, index_value')
        .or(`and(year.eq.${initialYear},month.eq.${initialMonth}),and(year.eq.${finalYear},month.eq.${finalMonth})`)

    if (error || !indices || indices.length < 2) {
        console.error('Error fetching inflation indices:', error || 'Indices not found')
        // Fallback: If indices are missing, we cannot calculate adjustment.
        // In a real app, we might check for "estimated" flag or throw error.
        return null
    }

    const initialIndexObj = indices.find(i => i.year === initialYear && i.month === initialMonth)
    const finalIndexObj = indices.find(i => i.year === finalYear && i.month === finalMonth)

    if (!initialIndexObj || !finalIndexObj) return null

    const initialIndex = Number(initialIndexObj.index_value)
    const finalIndex = Number(finalIndexObj.index_value)

    if (initialIndex === 0) return null // Avoid division by zero

    const factor = finalIndex / initialIndex
    const adjustedAmount = amount * factor

    return {
        factor,
        initialIndex,
        finalIndex,
        adjustedAmount
    }
}
