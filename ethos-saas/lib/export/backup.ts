import { TransactionIncome, TransactionExpense, Organization } from '@/types/database'
import { format } from 'date-fns'

interface BackupData {
    organization: Organization
    incomes: TransactionIncome[]
    expenses: TransactionExpense[]
    metadata: {
        exportDate: string
        version: string
        totalIncomes: number
        totalExpenses: number
    }
}

export function generateBackup(
    organization: Organization,
    incomes: TransactionIncome[],
    expenses: TransactionExpense[]
): void {
    const backupData: BackupData = {
        organization,
        incomes,
        expenses,
        metadata: {
            exportDate: new Date().toISOString(),
            version: '2.0.1',
            totalIncomes: incomes.length,
            totalExpenses: expenses.length,
        }
    }

    // Convert to JSON
    const jsonString = JSON.stringify(backupData, null, 2)

    // Create blob
    const blob = new Blob([jsonString], { type: 'application/json' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Backup_${organization.name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export function generateCSVBackup(
    incomes: TransactionIncome[],
    expenses: TransactionExpense[],
    organizationName: string
): void {
    // Generate CSV for incomes
    const incomesCSV = convertToCSV(
        incomes.map(i => ({
            Fecha: format(new Date(i.date), 'yyyy-MM-dd'),
            Recibo: i.receipt_number || '',
            Concepto: i.concept,
            MontoUSD: i.amount_usd || 0,
            MontoVES: i.amount_ves || 0,
            TasaCambio: i.exchange_rate || '',
            MetodoPago: i.payment_method || '',
            CodigoCuenta: i.account_code || '',
        }))
    )

    // Generate CSV for expenses
    const expensesCSV = convertToCSV(
        expenses.map(e => ({
            Fecha: format(new Date(e.date), 'yyyy-MM-dd'),
            Factura: e.invoice_number || '',
            Proveedor: e.supplier,
            Concepto: e.concept,
            Categoria: e.category || '',
            Subtotal: e.subtotal || 0,
            IVA: e.iva_amount || 0,
            TotalUSD: e.amount_usd || 0,
            TotalVES: e.amount_ves || 0,
            RetencionIVA: e.retention_iva || 0,
            RetencionISLR: e.retention_islr || 0,
        }))
    )

    // Download incomes CSV
    downloadCSV(incomesCSV, `Ingresos_${organizationName}_${format(new Date(), 'yyyy-MM-dd')}.csv`)

    // Download expenses CSV
    setTimeout(() => {
        downloadCSV(expensesCSV, `Gastos_${organizationName}_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    }, 100)
}

function convertToCSV(data: any[]): string {
    if (data.length === 0) return ''

    const headers = Object.keys(data[0])
    const csvRows = []

    // Add headers
    csvRows.push(headers.join(','))

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header]
            // Escape quotes and wrap in quotes if contains comma
            const escaped = String(value).replace(/"/g, '""')
            return escaped.includes(',') ? `"${escaped}"` : escaped
        })
        csvRows.push(values.join(','))
    }

    return csvRows.join('\n')
}

function downloadCSV(csvContent: string, fileName: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
