'use server'

import { createClient } from '@/lib/supabase/server'

export interface ReportData {
    organization: any
    period: { start: string, end: string }
    entries: any[]
    accounts: any[]
    initialBalances: Record<string, number>
}

export async function getMonthlyReportData(year: number, month: number): Promise<ReportData | { error: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No autorizado' }

    const { data: userData } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', user.id)
        .single()

    if (!userData?.organization_id) return { error: 'Sin organización' }

    const organizationId = userData.organization_id

    // Fechas
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    // 1. Organización
    const { data: organization } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', organizationId)
        .single()

    // 2. Cuentas Contables
    const { data: accounts } = await supabase
        .from('accounting_accounts')
        .select('*')
        .eq('organization_id', organizationId)
        .order('code')

    // 3. Asientos del Periodo (Libro Diario)
    const { data: entries } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('entry_number', { ascending: true })

    // 4. Saldo Inicial (Calculado sumando todo lo anterior a startDate)
    // Nota: Esto puede ser lento con mucha data. En el futuro, usar tabla de saldos pre-calculados o RPC.
    const initialBalances: Record<string, number> = {}

    // Obtenemos sumatoria de movimientos previos
    // Como Supabase JS client no soporta agregation groups facilmente sin RPC,
    // traemos los datos minimos necesarios.
    // ADVERTENCIA: Esto no escala para millones de registros, pero funciona para PYMEs/Condominios.
    const { data: prevEntries, error: prevError } = await supabase
        .from('journal_entries')
        .select('account_code, debit, credit')
        .eq('organization_id', organizationId)
        .lt('date', startDate)

    if (!prevError && prevEntries) {
        prevEntries.forEach(e => {
            const current = initialBalances[e.account_code] || 0
            // Naturaleza de cuentas:
            // Activo (1), Gastos (5), Costos (6) -> Deudor (+Debit -Credit)
            // Pasivo (2), Patrimonio (3), Ingresos (4) -> Acreedor (+Credit -Debit)

            // Simplificación: Guardamos saldo algebraico (Debit - Credit) y luego interpretamos según cuenta
            initialBalances[e.account_code] = current + (e.debit || 0) - (e.credit || 0)
        })
    }

    return {
        organization,
        period: { start: startDate, end: endDate },
        entries: entries || [],
        accounts: accounts || [],
        initialBalances
    }
}
