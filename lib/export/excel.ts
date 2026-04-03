import ExcelJS from 'exceljs'
import { TransactionIncome, TransactionExpense } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export async function exportIncomeToExcel(incomes: TransactionIncome[], organizationName: string) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Ingresos')

    // Define columns
    worksheet.columns = [
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Recibo #', key: 'receipt_number', width: 15 },
        { header: 'Concepto', key: 'concept', width: 40 },
        { header: 'Monto USD', key: 'amount_usd', width: 15 },
        { header: 'Monto VES', key: 'amount_ves', width: 15 },
        { header: 'Tasa de Cambio', key: 'exchange_rate', width: 15 },
        { header: 'Método de Pago', key: 'payment_method', width: 20 },
        { header: 'Código de Cuenta', key: 'account_code', width: 15 },
    ]

    // Add rows
    incomes.forEach(income => {
        worksheet.addRow({
            date: format(new Date(income.date), 'dd/MM/yyyy', { locale: es }),
            receipt_number: income.receipt_number || '-',
            concept: income.concept,
            amount_usd: income.amount_usd || 0,
            amount_ves: income.amount_ves || 0,
            exchange_rate: income.exchange_rate || '-',
            payment_method: income.payment_method?.replace('_', ' ') || '-',
            account_code: income.account_code || '-',
        })
    })

    // Style header
    worksheet.getRow(1).font = { bold: true }

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `Ingresos_${organizationName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    anchor.click()
    window.URL.revokeObjectURL(url)
}

export async function exportExpenseToExcel(expenses: TransactionExpense[], organizationName: string) {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Gastos')

    worksheet.columns = [
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Factura #', key: 'invoice_number', width: 15 },
        { header: 'Proveedor', key: 'supplier', width: 30 },
        { header: 'Concepto', key: 'concept', width: 40 },
        { header: 'Categoría', key: 'category', width: 20 },
        { header: 'Subtotal USD', key: 'subtotal', width: 15 },
        { header: 'IVA %', key: 'iva_percentage', width: 10 },
        { header: 'IVA USD', key: 'iva_amount', width: 15 },
        { header: 'Total USD', key: 'amount_usd', width: 15 },
        { header: 'Total VES', key: 'amount_ves', width: 15 },
        { header: 'Retención IVA', key: 'retention_iva', width: 15 },
        { header: 'Retención ISLR', key: 'retention_islr', width: 15 },
        { header: 'Método de Pago', key: 'payment_method', width: 20 },
    ]

    expenses.forEach(expense => {
        worksheet.addRow({
            date: format(new Date(expense.date), 'dd/MM/yyyy', { locale: es }),
            invoice_number: expense.invoice_number || '-',
            supplier: expense.supplier,
            concept: expense.concept,
            category: expense.category || '-',
            subtotal: expense.subtotal || 0,
            iva_percentage: expense.iva_percentage || 0,
            iva_amount: expense.iva_amount || 0,
            amount_usd: expense.amount_usd || 0,
            amount_ves: expense.amount_ves || 0,
            retention_iva: expense.retention_iva || 0,
            retention_islr: expense.retention_islr || 0,
            payment_method: expense.payment_method?.replace('_', ' ') || '-',
        })
    })

    worksheet.getRow(1).font = { bold: true }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `Gastos_${organizationName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    anchor.click()
    window.URL.revokeObjectURL(url)
}

export async function exportFinancialSummary(
    incomes: TransactionIncome[],
    expenses: TransactionExpense[],
    organizationName: string
) {
    const workbook = new ExcelJS.Workbook()
    
    // Summary Sheet
    const wsSummary = workbook.addWorksheet('Resumen')
    wsSummary.columns = [
        { header: 'Concepto', key: 'concept', width: 30 },
        { header: 'Monto USD', key: 'amount', width: 20 }
    ]

    const totalIncome = incomes.reduce((sum, t) => sum + (t.amount_usd || 0), 0)
    const totalExpense = expenses.reduce((sum, t) => sum + (t.amount_usd || 0), 0)
    const balance = totalIncome - totalExpense

    wsSummary.addRows([
        { concept: 'Total Ingresos', amount: totalIncome },
        { concept: 'Total Gastos', amount: totalExpense },
        { concept: 'Balance', amount: balance },
        {},
        { concept: 'Número de Ingresos', amount: incomes.length },
        { concept: 'Número de Gastos', amount: expenses.length },
    ])
    wsSummary.getRow(1).font = { bold: true }

    // Income Sheet
    const wsIncome = workbook.addWorksheet('Ingresos')
    wsIncome.columns = [
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Recibo #', key: 'receipt_number', width: 15 },
        { header: 'Concepto', key: 'concept', width: 40 },
        { header: 'Monto USD', key: 'amount_usd', width: 15 },
        { header: 'Monto VES', key: 'amount_ves', width: 15 },
    ]
    incomes.forEach(i => wsIncome.addRow({
        date: format(new Date(i.date), 'dd/MM/yyyy', { locale: es }),
        receipt_number: i.receipt_number || '-',
        concept: i.concept,
        amount_usd: i.amount_usd || 0,
        amount_ves: i.amount_ves || 0
    }))
    wsIncome.getRow(1).font = { bold: true }

    // Expense Sheet
    const wsExpense = workbook.addWorksheet('Gastos')
    wsExpense.columns = [
        { header: 'Fecha', key: 'date', width: 15 },
        { header: 'Factura #', key: 'invoice_number', width: 15 },
        { header: 'Proveedor', key: 'supplier', width: 30 },
        { header: 'Concepto', key: 'concept', width: 40 },
        { header: 'Total USD', key: 'amount_usd', width: 15 }
    ]
    expenses.forEach(e => wsExpense.addRow({
        date: format(new Date(e.date), 'dd/MM/yyyy', { locale: es }),
        invoice_number: e.invoice_number || '-',
        supplier: e.supplier,
        concept: e.concept,
        amount_usd: e.amount_usd || 0
    }))
    wsExpense.getRow(1).font = { bold: true }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `Resumen_Financiero_${organizationName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    anchor.click()
    window.URL.revokeObjectURL(url)
}
