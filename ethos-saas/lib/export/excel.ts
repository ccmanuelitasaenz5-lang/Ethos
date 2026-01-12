import * as XLSX from 'xlsx'
import { TransactionIncome, TransactionExpense } from '@/types/database'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function exportIncomeToExcel(incomes: TransactionIncome[], organizationName: string) {
    // Preparar datos para Excel
    const data = incomes.map(income => ({
        'Fecha': format(new Date(income.date), 'dd/MM/yyyy', { locale: es }),
        'Recibo #': income.receipt_number || '-',
        'Concepto': income.concept,
        'Monto USD': income.amount_usd || 0,
        'Monto VES': income.amount_ves || 0,
        'Tasa de Cambio': income.exchange_rate || '-',
        'Método de Pago': income.payment_method?.replace('_', ' ') || '-',
        'Código de Cuenta': income.account_code || '-',
    }))

    // Crear workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    // Ajustar ancho de columnas
    const colWidths = [
        { wch: 12 }, // Fecha
        { wch: 12 }, // Recibo #
        { wch: 40 }, // Concepto
        { wch: 15 }, // Monto USD
        { wch: 15 }, // Monto VES
        { wch: 15 }, // Tasa
        { wch: 18 }, // Método
        { wch: 15 }, // Código
    ]
    ws['!cols'] = colWidths

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Ingresos')

    // Generar archivo
    const fileName = `Ingresos_${organizationName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    XLSX.writeFile(wb, fileName)
}

export function exportExpenseToExcel(expenses: TransactionExpense[], organizationName: string) {
    // Preparar datos para Excel
    const data = expenses.map(expense => ({
        'Fecha': format(new Date(expense.date), 'dd/MM/yyyy', { locale: es }),
        'Factura #': expense.invoice_number || '-',
        'Proveedor': expense.supplier,
        'Concepto': expense.concept,
        'Categoría': expense.category || '-',
        'Subtotal USD': expense.subtotal || 0,
        'IVA %': expense.iva_percentage || 0,
        'IVA USD': expense.iva_amount || 0,
        'Total USD': expense.amount_usd || 0,
        'Total VES': expense.amount_ves || 0,
        'Retención IVA': expense.retention_iva || 0,
        'Retención ISLR': expense.retention_islr || 0,
        'Método de Pago': expense.payment_method?.replace('_', ' ') || '-',
    }))

    // Crear workbook
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)

    // Ajustar ancho de columnas
    const colWidths = [
        { wch: 12 }, // Fecha
        { wch: 12 }, // Factura #
        { wch: 25 }, // Proveedor
        { wch: 35 }, // Concepto
        { wch: 15 }, // Categoría
        { wch: 15 }, // Subtotal
        { wch: 10 }, // IVA %
        { wch: 12 }, // IVA USD
        { wch: 15 }, // Total USD
        { wch: 15 }, // Total VES
        { wch: 15 }, // Ret IVA
        { wch: 15 }, // Ret ISLR
        { wch: 18 }, // Método
    ]
    ws['!cols'] = colWidths

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Gastos')

    // Generar archivo
    const fileName = `Gastos_${organizationName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    XLSX.writeFile(wb, fileName)
}

export function exportFinancialSummary(
    incomes: TransactionIncome[],
    expenses: TransactionExpense[],
    organizationName: string
) {
    const wb = XLSX.utils.book_new()

    // Hoja 1: Resumen
    const totalIncome = incomes.reduce((sum, t) => sum + (t.amount_usd || 0), 0)
    const totalExpense = expenses.reduce((sum, t) => sum + (t.amount_usd || 0), 0)
    const balance = totalIncome - totalExpense

    const summaryData = [
        { 'Concepto': 'Total Ingresos', 'Monto USD': totalIncome },
        { 'Concepto': 'Total Gastos', 'Monto USD': totalExpense },
        { 'Concepto': 'Balance', 'Monto USD': balance },
        {},
        { 'Concepto': 'Número de Ingresos', 'Monto USD': incomes.length },
        { 'Concepto': 'Número de Gastos', 'Monto USD': expenses.length },
    ]

    const wsSummary = XLSX.utils.json_to_sheet(summaryData)
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen')

    // Hoja 2: Ingresos
    const incomeData = incomes.map(income => ({
        'Fecha': format(new Date(income.date), 'dd/MM/yyyy', { locale: es }),
        'Recibo #': income.receipt_number || '-',
        'Concepto': income.concept,
        'Monto USD': income.amount_usd || 0,
        'Monto VES': income.amount_ves || 0,
    }))

    const wsIncome = XLSX.utils.json_to_sheet(incomeData)
    wsIncome['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsIncome, 'Ingresos')

    // Hoja 3: Gastos
    const expenseData = expenses.map(expense => ({
        'Fecha': format(new Date(expense.date), 'dd/MM/yyyy', { locale: es }),
        'Factura #': expense.invoice_number || '-',
        'Proveedor': expense.supplier,
        'Concepto': expense.concept,
        'Total USD': expense.amount_usd || 0,
    }))

    const wsExpense = XLSX.utils.json_to_sheet(expenseData)
    wsExpense['!cols'] = [{ wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 35 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsExpense, 'Gastos')

    // Generar archivo
    const fileName = `Resumen_Financiero_${organizationName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    XLSX.writeFile(wb, fileName)
}
