'use client'

import { useState, useEffect } from 'react'
import { createIncome, updateIncome } from '@/app/actions/income'
import { useRouter } from 'next/navigation'

interface IncomeFormProps {
    initialRate?: number
    accounts?: any[]
    properties?: any[]
    initialData?: any
}

export default function IncomeForm({ initialRate, accounts = [], properties = [], initialData }: IncomeFormProps) {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [exchangeRate, setExchangeRate] = useState(initialData?.exchange_rate?.toString() || initialRate?.toString() || '')
    const [amountUSD, setAmountUSD] = useState(initialData?.amount_usd?.toString() || '')
    const [amountVES, setAmountVES] = useState(initialData?.amount_ves?.toString() || '')
    const [status, setStatus] = useState(initialData?.status || 'draft')

    // Bidirectional conversion
    const handleUSDChange = (val: string) => {
        setAmountUSD(val)
        if (val && exchangeRate) {
            const ves = (parseFloat(val) * parseFloat(exchangeRate)).toFixed(2)
            setAmountVES(ves)
        } else if (!val) {
            setAmountVES('')
        }
    }

    const handleVESChange = (val: string) => {
        setAmountVES(val)
        if (val && exchangeRate && parseFloat(exchangeRate) > 0) {
            const usd = (parseFloat(val) / parseFloat(exchangeRate)).toFixed(2)
            setAmountUSD(usd)
        } else if (!val) {
            setAmountUSD('')
        }
    }

    const handleRateChange = (val: string) => {
        setExchangeRate(val)
        // If rate changes, re-calculate VES based on USD
        if (amountUSD && val) {
            const ves = (parseFloat(amountUSD) * parseFloat(val)).toFixed(2)
            setAmountVES(ves)
        }
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setError(null)

        // Append status manually since it might not be a form input in some designs, 
        // but here we will make it a submit button value or hidden input.
        formData.append('status', status)

        if (status === 'finalized') {
            // TODO: Integrate FiscalPrinterService here
            // If using a local fiscal printer (IP based):
            // const printer = new MockFiscalPrinter({ ip: '192.168.1.100' })
            // const result = await printer.printInvoice({ ... })
            // formData.append('fiscal_serial', result.fiscalSerial)
        }

        const result = initialData?.id
            ? await updateIncome(initialData.id, formData)
            : await createIncome(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            router.push('/dashboard/ingresos')
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
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    />
                </div>

                <div>
                    <label htmlFor="property_id" className="block text-sm font-medium text-gray-700">
                        Inmueble / Unidad
                    </label>
                    <select
                        id="property_id"
                        name="property_id"
                        defaultValue={initialData?.property_id || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    >
                        <option value="">Seleccionar...</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.number} {p.owner_name ? `- ${p.owner_name}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="receipt_number" className="block text-sm font-medium text-gray-700">
                        Número de Recibo
                    </label>
                    <input
                        type="text"
                        id="receipt_number"
                        name="receipt_number"
                        defaultValue={initialData?.receipt_number || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                        placeholder="REC-001"
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
                        placeholder="Pago de condominio"
                    />
                </div>

                <div>
                    <label htmlFor="account_code" className="block text-sm font-medium text-gray-700">
                        Cuenta de Ingreso *
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
                            .filter(a => a.main_type === 'INCOME' && a.is_movement)
                            .map(a => (
                                <option key={a.id} value={a.code}>
                                    {a.code} - {a.name}
                                </option>
                            ))
                        }
                    </select>
                </div>

                <div>
                    <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700">
                        Cuenta de Destino (Banco/Caja) *
                    </label>
                    <select
                        id="bank_account"
                        name="bank_account"
                        required
                        defaultValue={initialData?.bank_account || ''}
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

                {/* Monto USD */}
                <div>
                    <label htmlFor="amount_usd" className="block text-sm font-medium text-gray-700">
                        Monto USD
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id="amount_usd"
                            name="amount_usd"
                            step="0.01"
                            value={amountUSD}
                            onChange={(e) => handleUSDChange(e.target.value)}
                            className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                {/* Monto VES */}
                <div>
                    <label htmlFor="amount_ves" className="block text-sm font-medium text-gray-700">
                        Monto Bolívares (VES)
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Bs.</span>
                        </div>
                        <input
                            type="number"
                            id="amount_ves"
                            name="amount_ves"
                            step="0.01"
                            value={amountVES}
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
                        className="mt-1 block w-full px-3 py-2 border border-blue-200 bg-blue-50 text-blue-900 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 font-bold"
                        placeholder="0.0000"
                    />
                    <p className="mt-1 text-xs text-blue-600 font-medium">Referencia oficial del Banco Central</p>
                </div>

                <div>
                    <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">
                        Método de Pago
                    </label>
                    <select
                        id="payment_method"
                        name="payment_method"
                        defaultValue={initialData?.payment_method || ''}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
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

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                    {loading ? 'Procesando...' : 'Guardar Borrador'}
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    onClick={() => setStatus('finalized')}
                    className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    {loading ? 'Procesando...' : 'Finalizar y Fiscalizar'}
                </button>
            </div>
        </form>
    )
}
