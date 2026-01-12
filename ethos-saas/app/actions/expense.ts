'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createExpense(formData: FormData) {
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

    const subtotal = parseFloat(formData.get('subtotal') as string)
    const ivaPercentage = parseFloat(formData.get('iva_percentage') as string) || 16
    const ivaAmount = subtotal * (ivaPercentage / 100)
    const amountUSD = subtotal + ivaAmount

    const exchangeRate = parseFloat(formData.get('exchange_rate') as string) || null
    const amountVES = exchangeRate ? (amountUSD * exchangeRate) : 0

    const retentionIVA = parseFloat(formData.get('retention_iva') as string) || null
    const retentionISLR = parseFloat(formData.get('retention_islr') as string) || null

    const { data: expenseData, error } = await supabase
        .from('transactions_expense')
        .insert({
            organization_id: userData.organization_id,
            date: formData.get('date') as string,
            invoice_number: formData.get('invoice_number') as string || null,
            control_number: formData.get('control_number') as string || null,
            supplier: formData.get('supplier') as string,
            concept: formData.get('concept') as string,
            subtotal: subtotal,
            iva_percentage: ivaPercentage,
            iva_amount: ivaAmount,
            amount_usd: amountUSD,
            amount_ves: amountVES,
            exchange_rate: exchangeRate,
            retention_iva: retentionIVA,
            retention_islr: retentionISLR,
            igtf_apply: formData.get('igtf_apply') === 'true',
            igtf_amount: parseFloat(formData.get('igtf_amount') as string) || 0,
            status: formData.get('status') as 'draft' | 'finalized' | 'annulled' || 'draft',
            category: formData.get('category') as string || null,
            payment_method: formData.get('payment_method') as string || null,
            created_by: user.id,
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    // --- RESOLVER NOMBRES DE CUENTAS ---
    const { data: accounts } = await supabase
        .from('accounting_accounts')
        .select('code, name')
        .eq('organization_id', userData.organization_id)
        .in('code', [formData.get('payment_account') as string, formData.get('account_code') as string].filter(Boolean))

    const accountsMap: Record<string, string> = {}
    accounts?.forEach(a => { accountsMap[a.code] = a.name })

    // --- GENERAR ASIENTO CONTABLE ---
    // 1. Obtener siguiente número de asiento
    const { data: lastEntry } = await supabase
        .from('journal_entries')
        .select('entry_number')
        .eq('organization_id', userData.organization_id)
        .order('entry_number', { ascending: false })
        .limit(1)
        .single()

    const nextEntryNumber = (lastEntry?.entry_number || 0) + 1

    // 2. Insertar partida doble
    const journalEntries = [
        {
            organization_id: userData.organization_id,
            date: formData.get('date') as string,
            entry_number: nextEntryNumber,
            description: `Gasto: ${formData.get('supplier') as string} - ${formData.get('concept') as string}`,
            account_code: formData.get('account_code') as string || (formData.get('category') === 'Activo' ? '1.2.01' : '5.1.01'),
            account_name: accountsMap[formData.get('account_code') as string] || (formData.get('category') === 'Activo' ? 'Activos Fijos' : 'Gastos Operativos'),
            debit: amountUSD,
            debit_ves: amountVES,
            credit: 0,
            credit_ves: 0,
            reference_id: expenseData.id,
            reference_type: 'expense',
            created_by: user.id,
        },
        {
            organization_id: userData.organization_id,
            date: formData.get('date') as string,
            entry_number: nextEntryNumber,
            description: `Pago Gasto: ${formData.get('supplier') as string}`,
            account_code: formData.get('payment_account') as string || '1.1.01',
            account_name: accountsMap[formData.get('payment_account') as string] || 'Caja y Bancos',
            debit: 0,
            debit_ves: 0,
            credit: amountUSD,
            credit_ves: amountVES,
            reference_id: expenseData.id,
            reference_type: 'expense',
            created_by: user.id,
        }
    ]

    await supabase.from('journal_entries').insert(journalEntries)

    revalidatePath('/dashboard/gastos')
    revalidatePath('/dashboard/libro-digital')
    revalidatePath('/dashboard/reportes')
    return { success: true }
}

export async function deleteExpense(id: string) {
    const supabase = await createClient()

    // Verify ownership before delete
    const { data: expense } = await supabase
        .from('transactions_expense')
        .select('organization_id')
        .eq('id', id)
        .single()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('organization_id').eq('id', user?.id).single()

    if (expense?.organization_id !== userData?.organization_id) {
        return { error: 'No autorizado' }
    }

    // 1. Eliminar asientos asociados
    await supabase
        .from('journal_entries')
        .delete()
        .eq('reference_id', id)
        .eq('reference_type', 'expense')

    // 2. Eliminar el gasto
    const { error } = await supabase
        .from('transactions_expense')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/gastos')
    revalidatePath('/dashboard/libro-digital')
    revalidatePath('/dashboard/reportes')
    return { success: true }
}
