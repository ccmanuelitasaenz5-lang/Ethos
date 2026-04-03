"use client";

import { useState, useEffect } from "react";
import { getBankTransactions, toggleReconciled } from "@/app/actions/bank";
import BankTransactionForm from "./BankTransactionForm";

interface BankTransactionListProps {
  bankAccountId: string;
  onUpdate: () => void;
}

export default function BankTransactionList({
  bankAccountId,
  onUpdate,
}: BankTransactionListProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [bankAccountId]);

  const loadTransactions = async () => {
    setLoading(true);
    const data = await getBankTransactions(bankAccountId);
    setTransactions(data);
    setLoading(false);
  };

  const handleToggleReconciled = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_reconciled: !currentStatus } : t,
      ),
    );

    const result = await toggleReconciled(id, !currentStatus);

    if (result?.error) {
      // Revert on error
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, is_reconciled: currentStatus } : t,
        ),
      );
      alert("Error al actualizar estado: " + result.error);
    } else {
      onUpdate();
    }
  };

  if (loading)
    return (
      <div className="p-12 text-center text-gray-500">
        Cargando movimientos...
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">
          Movimientos Bancarios
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
        >
          {showForm ? "Cancelar" : "+ Nuevo Movimiento"}
        </button>
      </div>

      {showForm && (
        <BankTransactionForm
          bankAccountId={bankAccountId}
          onSuccess={() => {
            setShowForm(false);
            loadTransactions();
            onUpdate();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Resumen de Totales */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Ingresos</p>
            <p className="text-xl font-black text-green-600">
              Bs. {transactions
                .filter(t => (t.transaction_type || '').toLowerCase() === 'income')
                .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount || 0)), 0)
                .toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase">Total Egresos</p>
            <p className="text-xl font-black text-red-600">
              Bs. {transactions
                .filter(t => ['expense', 'fee'].includes((t.transaction_type || '').toLowerCase()))
                .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount || 0)), 0)
                .toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm font-bold">
            <p className="text-xs font-bold text-gray-400 uppercase">Diferencia Neta</p>
            <p className={`text-xl font-black ${(transactions.reduce((acc, t) => acc + parseFloat(t.amount || 0), 0)) < 0 ? 'text-red-700' : 'text-primary-700'}`}>
              Bs. {transactions
                .reduce((acc, t) => acc + parseFloat(t.amount || 0), 0)
                .toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Referencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500 italic"
                >
                  No hay movimientos registrados para esta cuenta.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(tx.date).toLocaleDateString("es-VE")}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {tx.reference || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 py-1 text-xs font-bold rounded-full ${tx.transaction_type === "income"
                        ? "bg-green-100 text-green-700"
                        : tx.transaction_type === "expense"
                          ? "bg-red-100 text-red-700"
                          : tx.transaction_type === "fee"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                    >
                      {tx.transaction_type === "income"
                        ? "Ingreso"
                        : tx.transaction_type === "expense"
                          ? "Egreso"
                          : tx.transaction_type === "fee"
                            ? "Comisión"
                            : "Transf."}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-black ${tx.amount < 0 ? "text-red-700" : "text-green-700"}`}
                  >
                    {tx.amount?.toLocaleString("es-VE", {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <button
                      onClick={() =>
                        handleToggleReconciled(tx.id, tx.is_reconciled)
                      }
                      className={`flex items-center justify-center w-full px-2 py-1 rounded-md transition-colors ${tx.is_reconciled
                        ? "text-green-700 bg-green-50 hover:bg-green-100"
                        : "text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700"
                        }`}
                      title={
                        tx.is_reconciled
                          ? "Marcar como pendiente"
                          : "Marcar como conciliado"
                      }
                    >
                      {tx.is_reconciled ? (
                        <>
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Conciliado
                        </>
                      ) : (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-gray-400 mr-2"></span>
                          Pendiente
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
