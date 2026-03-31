'use client'
 
interface ResidentDashboardProps {
  summary: any
  lastPayments: any[]
}
 
export default function ResidentDashboard({ summary, lastPayments }: ResidentDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Saldo Pendiente</p>
          <p className="text-3xl font-black text-red-600 mt-1">
            ${summary?.current_balance_usd?.toFixed(2) || '0.00'}
          </p>
          <button className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 transition-colors">
            Reportar Pago
          </button>
        </div>
 
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Pagado</p>
          <p className="text-3xl font-black text-green-600 mt-1">
            ${summary?.total_paid_usd?.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Propiedad: {summary?.property_code || '---'}</p>
        </div>
      </div>
 
      {/* Historial de Pagos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Últimos Pagos Registrados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Concepto</th>
                <th className="px-6 py-3 text-right">Monto USD</th>
                <th className="px-6 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {lastPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No hay pagos registrados</td>
                </tr>
              ) : (
                lastPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">{p.concept}</td>
                    <td className="px-6 py-4 text-right font-bold">${p.amount_usd.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'finalized' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
