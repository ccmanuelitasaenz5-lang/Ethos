'use client'

import { useState, useEffect } from 'react'
import { createExpense, updateExpense } from '@/app/actions/expense'
import { useRouter } from 'next/navigation'

interface ExpenseFormProps {
    initialRate?: number
    accounts?: any[]
    initialData?: any
}

export default function ExpenseForm({ initialRate, accounts = [], initialData }: ExpenseFormProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(initialData?.status || 'draft')

    // Amounts
    const [subtotalUSD, setSubtotalUSD] = useState(initialData?.subtotal?.toString() || '')
    const [subtotalVES, setSubtotalVES] = useState(initialData?.amount_ves?.toString() || '')

    // Rates & Tax
    const [ivaPercentage, setIvaPercentage] = useState(initialData?.iva_percentage?.toString() || '16')
    const [exchangeRate, setExchangeRate] = useState(initialData?.exchange_rate?.toString() || initialRate?.toString() || '')

    // Fiscal
    const [igtfApply, setIgtfApply] = useState(initialData?.igtf_apply || false)
    const [retentionIvaPercent, setRetentionIvaPercent] = useState('75')
    const [retentionIslrPercent, setRetentionIslrPercent] = useState(initialData?.retention_islr?.toString() || '0')

    // Calculation logic
    const calculateIVA = (baseUSD: number) => {
        return (baseUSD * (parseFloat(ivaPercentage) / 100))
    }

    const calculateIGTF = (amountVES: number, method: string) => {
        // IGTF applies if paying with foreign currency (Effective logic simplification for UI)
        // Usually 3%
        if (!igtfApply) return 0
        return amountVES * 0.03
    }

    const calculateRetentionIVA = (ivaAmountUSD: number) => {
        return ivaAmountUSD * (parseFloat(retentionIvaPercent) / 100)
    }

    const calculateRetentionISLR = (baseUSD: number) => {
        return baseUSD * (parseFloat(retentionIslrPercent) / 100)
    }

    const handleUSDChange = (val: string) => {
        setSubtotalUSD(val)
        if (val && exchangeRate) {
            const ves = (parseFloat(val) * parseFloat(exchangeRate)).toFixed(2)
            setSubtotalVES(ves)
        } else if (!val) {
            setSubtotalVES('')
        }
    }

    const handleVESChange = (val: string) => {
        setSubtotalVES(val)
        if (val && exchangeRate && parseFloat(exchangeRate) > 0) {
            const usd = (parseFloat(val) / parseFloat(exchangeRate)).toFixed(2)
            setSubtotalUSD(usd)
        } else if (!val) {
            setSubtotalUSD('')
        }
    }

    const handleRateChange = (val: string) => {
        setExchangeRate(val)
        if (subtotalUSD && val) {
            const ves = (parseFloat(subtotalUSD) * parseFloat(val)).toFixed(2)
            setSubtotalVES(ves)
        }
    }

    const totalUSD = subtotalUSD ? parseFloat(subtotalUSD) + calculateIVA(parseFloat(subtotalUSD)) : 0
    const totalVES = exchangeRate && totalUSD ? totalUSD * parseFloat(exchangeRate) : 0

    // Derived values for summary
    const ivaAmountUSD = subtotalUSD ? calculateIVA(parseFloat(subtotalUSD)) : 0
    const retIvaUSD = calculateRetentionIVA(ivaAmountUSD)
    const retIslrUSD = calculateRetentionISLR(parseFloat(subtotalUSD || '0'))
    // IGTF is usually in Bs.
    const igtfAmountVES = totalVES * (igtfApply ? 0.03 : 0)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.append('status', status)
        formData.append('igtf_apply', igtfApply ? 'true' : 'false')
        formData.append('igtf_amount', igtfAmountVES.toFixed(2))

        // Append retentions if manually overridden or calculated
        formData.append('retention_iva', retIvaUSD.toFixed(2))
        formData.append('retention_islr', retIslrUSD.toFixed(2))

        if (status === 'finalized' && retIslrUSD > 0) {
            // TODO: Generate ISLR Retention Receipt
            // 1. Get next sequence number
            // 2. Format with generateRetentionCode(date, agentRif, seq)
            // 3. Store in DB (maybe new table retention_receipts)
            // 4. Generate PDF
        }

        setError(null)
        const result = initialData
            ? await updateExpense(initialData.id, formData)
            : await createExpense(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push('/dashboard/gastos')
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Fecha *
                    </label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        required
                        defaultValue={initialData?.date || new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    />
                </div>

                <div>
                    <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700">
                        Número de Factura
                    </label>
                    <input
                        type="text"
                        id="invoice_number"
                        name="invoice_number"
                        defaultValue={initialData?.invoice_number || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                        placeholder="FAC-001"
                    />
                </div>

                <div>
                    <label htmlFor="control_number" className="block text-sm font-medium text-gray-700">
                        Número de Control (Fiscal)
                    </label>
                    <input
                        type="text"
                        id="control_number"
                        name="control_number"
                        defaultValue={initialData?.control_number || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                        placeholder="00-000000"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
                        Proveedor *
                    </label>
                    <input
                        type="text"
                        id="supplier"
                        name="supplier"
                        required
                        defaultValue={initialData?.supplier || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                        placeholder="Nombre del proveedor"
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="concept" className="block text-sm font-medium text-gray-700">
                        Concepto *
                    </label>
                    <input
                        type="text"
                        id="concept"
                        name="concept"
                        required
                        defaultValue={initialData?.concept || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                        placeholder="Descripción del gasto"
                    />
                </div>

                <div>
                    <label htmlFor="account_code" className="block text-sm font-medium text-gray-700">
                        Cuenta de Gasto *
                    </label>
                    <select
                        id="account_code"
                        name="account_code"
                        required
                        defaultValue={initialData?.account_code || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    >
                        <option value="">Seleccionar cuenta...</option>
                        {accounts
                            .filter(a => (a.main_type === 'EXPENSE' || a.main_type === 'ASSET') && a.is_movement && !a.code.startsWith('1.1'))
                            .map(a => (
                                <option key={a.id} value={a.code}>
                                    {a.code} - {a.name}
                                </option>
                            ))
                        }
                    </select>
                </div>

                <div>
                    <label htmlFor="payment_account" className="block text-sm font-medium text-gray-700">
                        Cuenta de Pago (Banco/Caja) *
                    </label>
                    <select
                        id="payment_account"
                        name="payment_account"
                        required
                        defaultValue={initialData?.account_code_payment || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    >
                        <option value="">Seleccionar banco/caja...</option>
                        {accounts
                            .filter(a => a.main_type === 'ASSET' && a.is_movement && (a.code.startsWith('1.1') || a.name.toLowerCase().includes('banco') || a.name.toLowerCase().includes('caja')))
                            .map(a => (
                                <option key={a.id} value={a.code}>
                                    {a.code} - {a.name}
                                </option>
                            ))
                        }
                    </select>
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Categoría
                    </label>
                    <select
                        id="category"
                        name="category"
                        defaultValue={initialData?.category || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="Servicios">Servicios</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Suministros">Suministros</option>
                        <option value="Personal">Personal</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="iva_percentage" className="block text-sm font-medium text-gray-700">
                        IVA (%)
                    </label>
                    <input
                        type="number"
                        id="iva_percentage"
                        name="iva_percentage"
                        step="0.01"
                        min="0"
                        max="100"
                        value={ivaPercentage}
                        onChange={(e) => setIvaPercentage(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    />
                </div>

                {/* Subtotal USD */}
                <div>
                    <label htmlFor="subtotal" className="block text-sm font-medium text-gray-700">
                        Subtotal (USD) *
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id="subtotal"
                            name="subtotal"
                            required
                            step="0.01"
                            value={subtotalUSD}
                            onChange={(e) => handleUSDChange(e.target.value)}
                            className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Subtotal VES */}
                <div>
                    <label htmlFor="subtotal_ves" className="block text-sm font-medium text-gray-700">
                        Subtotal (VES)
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Bs.</span>
                        </div>
                        <input
                            type="number"
                            id="subtotal_ves"
                            name="subtotal_ves"
                            step="0.01"
                            value={subtotalVES}
                            onChange={(e) => handleVESChange(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="exchange_rate" className="block text-sm font-medium text-gray-700">
                        Tasa BCV Aplicada
                    </label>
                    <input
                        type="number"
                        id="exchange_rate"
                        name="exchange_rate"
                        step="0.0001"
                        value={exchangeRate}
                        onChange={(e) => handleRateChange(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-blue-200 bg-blue-50 text-blue-900 font-bold rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0.0000"
                    />
                </div>

                <div className="sm:col-span-2 space-y-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="igtf_apply"
                            checked={igtfApply}
                            onChange={(e) => setIgtfApply(e.target.checked)}
                            className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                        <label htmlFor="igtf_apply" className="text-sm font-medium text-gray-700">
                            Aplica IGTF (3%)
                        </label>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-500 uppercase">Resumen en USD</p>
                            <p className="text-sm text-gray-700">Base: ${parseFloat(subtotalUSD || '0').toFixed(2)}</p>
                            <p className="text-sm text-gray-700">IVA ({ivaPercentage}%): ${ivaAmountUSD.toFixed(2)}</p>
                            <div className="pt-1 border-t border-gray-200 mt-1">
                                <p className="text-xs text-red-600">Ret. IVA ({retentionIvaPercent}%): -${retIvaUSD.toFixed(2)}</p>
                                <p className="text-xs text-red-600">Ret. ISLR ({retentionIslrPercent}%): -${retIslrUSD.toFixed(2)}</p>
                            </div>
                            <p className="text-lg font-black text-gray-900 mt-2">Total a Pagar: ${(totalUSD - retIvaUSD - retIslrUSD).toFixed(2)}</p>
                        </div>
                        <div className="space-y-1 border-l border-gray-200 pl-4">
                            <p className="text-xs font-bold text-gray-500 uppercase">Resumen en Bolívares</p>
                            <p className="text-sm text-gray-700">Base: Bs. {parseFloat(subtotalVES || '0').toFixed(2)}</p>
                            <p className="text-sm text-gray-700">IVA: Bs. {(ivaAmountUSD * parseFloat(exchangeRate || '0')).toFixed(2)}</p>
                            {igtfApply && (
                                <p className="text-sm text-orange-600 font-bold">+ IGTF (3%): Bs. {igtfAmountVES.toFixed(2)}</p>
                            )}
                            <p className="text-lg font-black text-primary-700 mt-2">Total: Bs. {((totalUSD - retIvaUSD - retIslrUSD) * parseFloat(exchangeRate || '0') + igtfAmountVES).toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:col-span-2">
                    <div>
                        <label htmlFor="retention_iva" className="block text-sm font-medium text-gray-700">
                            Retención IVA (USD)
                        </label>
                        <input
                            type="number"
                            id="retention_iva"
                            value={retentionIvaPercent}
                            onChange={(e) => setRetentionIvaPercent(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            placeholder="75"
                        />
                        <p className="text-xs text-gray-500 mt-1">Porcentaje de Retención (75% / 100%)</p>
                    </div>
                    <div>
                        <label htmlFor="retention_islr_percent" className="block text-sm font-medium text-gray-700">
                            Retención ISLR (%)
                        </label>
                        <input
                            type="number"
                            id="retention_islr_percent"
                            value={retentionIslrPercent}
                            onChange={(e) => setRetentionIslrPercent(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
                            Método de Pago
                        </label>
                        <select
                            id="payment_method"
                            name="payment_method"
                            defaultValue={initialData?.payment_method || ''}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                        >
                            <option value="">Seleccionar...</option>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="pago_movil">Pago Móvil</option>
                            <option value="cheque">Cheque</option>
                            <option value="tarjeta">Tarjeta</option>
                        </select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Procesando...' : 'Guardar Borrador'}
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    onClick={() => setStatus('finalized')}
                    className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Procesando...' : 'Finalizar Gasto'}
                </button>
            </div>
        </form>
    )
}
