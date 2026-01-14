"use client";

import { useState } from "react";
import {
  checkAccountingBalance,
  checkPendingReconciliation,
  createMonthlyClosing,
  savePDFToClosing,
} from "@/app/actions/closing";
import { getMonthlyReportData } from "@/app/actions/reports";
import PDFDownloadButton from "@/components/reports/pdf/PDFDownloadButton";
import { blobToBase64, generatePDFBlob } from "@/lib/utils/pdf-utils";

// PDF Templates
import JournalPDF from "@/components/reports/pdf/JournalPDF";
import LedgerPDF from "@/components/reports/pdf/LedgerPDF";
import ExpenseReportPDF from "@/components/reports/pdf/ExpenseReportPDF";
import PropertyStatementPDF from "@/components/reports/pdf/PropertyStatementPDF";

export default function MonthlyClosingWizard() {
  const [step, setStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  ); // YYYY-MM
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [reportData, setReportData] = useState<any>(null);
  const [savingReports, setSavingReports] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Validation Results
  const [balanceCheck, setBalanceCheck] = useState<{
    isBalanced: boolean;
    totalDebit: number;
    totalCredit: number;
    difference: number;
  } | null>(null);
  const [pendingReconciliations, setPendingReconciliations] = useState<{
    count: number;
  } | null>(null);

  // Step 1 -> 2: Run Validations
  const handleRunValidations = async () => {
    setLoading(true);
    setError(null);
    setBalanceCheck(null);
    setPendingReconciliations(null);

    try {
      // Create a date string for the 1st of the selected month to ensure compatibility
      const periodDate = `${selectedMonth}-01`;

      const [balanceRes, reconRes] = await Promise.all([
        checkAccountingBalance(periodDate),
        checkPendingReconciliation(periodDate),
      ]);

      if ("error" in balanceRes) throw new Error(balanceRes.error as string);
      if ("error" in reconRes) throw new Error(reconRes.error as string);

      setBalanceCheck(balanceRes as any);
      setPendingReconciliations(reconRes as any);
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3 -> 4: Execute Closing
  const handleCloseMonth = async () => {
    setLoading(true);
    setError(null);
    setSavedCount(0);

    try {
      // Create a date string for the 1st of the selected month
      const periodDate = `${selectedMonth}-01`;
      const [year, month] = selectedMonth.split("-").map(Number);

      const result = await createMonthlyClosing(periodDate, notes);

      if (result?.error) {
        throw new Error(result.error);
      }

      const { closingId, organizationId } = result as {
        closingId: string;
        organizationId: string;
      };

      // Fetch data for PDF generation
      const pdfData = await getMonthlyReportData(year, month);
      if ("error" in pdfData) {
        throw new Error(pdfData.error);
      }
      setReportData(pdfData);

      // --- PDF GENERATION AND STORAGE ---
      setSavingReports(true);

      const reportsToGenerate: Array<{
        type: "journal" | "ledger" | "expense" | "property-statement";
        component: React.ReactElement;
      }> = [
          { type: "journal", component: <JournalPDF data={pdfData} /> },
          { type: "ledger", component: <LedgerPDF data={pdfData} /> },
          { type: "expense", component: <ExpenseReportPDF data={pdfData} /> },
          {
            type: "property-statement",
            component: <PropertyStatementPDF data={pdfData as any} />,
          },
        ];

      for (const report of reportsToGenerate) {
        try {
          const blob = await generatePDFBlob(report.component);
          const base64 = await blobToBase64(blob);

          const saveRes = await savePDFToClosing(
            closingId,
            organizationId,
            selectedMonth,
            report.type,
            base64,
          );

          if (saveRes.error) {
            console.error(`Error saving ${report.type}:`, saveRes.error);
          } else {
            setSavedCount((prev) => prev + 1);
          }
        } catch (pdfErr) {
          console.error(`Failed to generate ${report.type}:`, pdfErr);
        }
      }

      setSavingReports(false);
      setStep(4); // Success
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setSavingReports(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getMonthName = (dateStr: string) => {
    const [year, month] = dateStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("es-VE", { month: "long", year: "numeric" });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">
          Asistente de Cierre Mensual
        </h2>
        <div className="flex items-center mt-2 space-x-2 text-sm text-gray-500">
          <span
            className={`px-2 py-1 rounded-full ${step >= 1 ? "bg-primary-100 text-primary-700" : "bg-gray-200"}`}
          >
            1. Selección
          </span>
          <span>→</span>
          <span
            className={`px-2 py-1 rounded-full ${step >= 2 ? "bg-primary-100 text-primary-700" : "bg-gray-200"}`}
          >
            2. Validación
          </span>
          <span>→</span>
          <span
            className={`px-2 py-1 rounded-full ${step >= 3 ? "bg-primary-100 text-primary-700" : "bg-gray-200"}`}
          >
            3. Confirmación
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecciona el mes a cerrar
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Se validarán todas las transacciones desde el día 1 hasta el
                último día del mes seleccionado.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="text-sm text-blue-700">
                <strong>Importante:</strong> El cierre mensual bloqueará la
                edición y creación de transacciones para el periodo
                seleccionado. Asegúrate de haber registrado todos los
                movimientos.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleRunValidations}
                disabled={loading || !selectedMonth}
                className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Validando..." : "Continuar a Validaciones"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Validation Results */}
        {step === 2 && balanceCheck && pendingReconciliations && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Resultados de Validación: {getMonthName(selectedMonth)}
            </h3>

            {/* Balance Contable */}
            <div
              className={`p-4 rounded-lg border ${balanceCheck.isBalanced ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800">
                  Partida Doble (Contabilidad)
                </span>
                {balanceCheck.isBalanced ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                    BALANCEADO
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                    DESCUADRADO
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Débitos:</span>
                  <p className="font-mono">
                    {formatCurrency(balanceCheck.totalDebit)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Total Créditos:</span>
                  <p className="font-mono">
                    {formatCurrency(balanceCheck.totalCredit)}
                  </p>
                </div>
              </div>
              {!balanceCheck.isBalanced && (
                <p className="mt-2 text-sm text-red-600 font-bold">
                  Diferencia: {formatCurrency(balanceCheck.difference)}
                </p>
              )}
            </div>

            {/* Conciliación Bancaria */}
            <div
              className={`p-4 rounded-lg border ${pendingReconciliations.count === 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800">
                  Conciliación Bancaria
                </span>
                {pendingReconciliations.count === 0 ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                    AL DÍA
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                    PENDIENTES
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {pendingReconciliations.count === 0
                  ? "Todos los movimientos bancarios del mes han sido conciliados."
                  : `Hay ${pendingReconciliations.count} movimientos bancarios sin conciliar en este periodo.`}
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!balanceCheck.isBalanced}
                className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continuar
              </button>
            </div>
            {!balanceCheck.isBalanced && (
              <p className="text-center text-xs text-red-600">
                No se puede proceder con el cierre si la contabilidad está
                descuadrada.
              </p>
            )}
          </div>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center py-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Confirmar Cierre Mensual
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Estás a punto de cerrar el periodo{" "}
                <strong>{getMonthName(selectedMonth)}</strong>.
              </p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  No se podrán agregar nuevos ingresos ni gastos con fecha de
                  este mes.
                </li>
                <li>
                  No se podrán editar ni eliminar transacciones existentes de
                  este mes.
                </li>
                <li>Se generará un registro histórico del cierre.</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas del Cierre (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Ej: Cierre realizado después de la asamblea..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Atrás
              </button>
              <button
                onClick={handleCloseMonth}
                disabled={loading || savingReports}
                className="px-4 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center"
              >
                {loading || savingReports ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {savingReports
                      ? `Guardando Reportes (${savedCount}/4)...`
                      : "Procesando..."}
                  </>
                ) : (
                  "Confirmar y Cerrar Mes"
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div className="text-center py-8 space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                ¡Cierre Exitoso!
              </h3>
              <p className="text-gray-500 mt-2">
                El periodo <strong>{getMonthName(selectedMonth)}</strong> ha
                sido cerrado correctamente.
              </p>
            </div>
            <div className="pt-4 flex flex-col items-center space-y-3">
              {reportData && (
                <>
                  <PDFDownloadButton
                    reportType="journal"
                    data={reportData}
                    fileName={`Libro_Diario_${selectedMonth}.pdf`}
                    label="Descargar Libro Diario (PDF)"
                    className="px-6 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors shadow-md flex items-center"
                  />
                  <PDFDownloadButton
                    reportType="ledger"
                    data={reportData}
                    fileName={`Libro_Mayor_${selectedMonth}.pdf`}
                    label="Descargar Libro Mayor (PDF)"
                    className="px-6 py-3 bg-white text-primary-700 border border-primary-200 font-bold rounded-lg hover:bg-primary-50 transition-colors shadow-sm flex items-center"
                  />
                  <PDFDownloadButton
                    reportType="expense"
                    data={reportData}
                    fileName={`Relacion_Gastos_${selectedMonth}.pdf`}
                    label="Descargar Relación de Gastos (PDF)"
                    className="px-6 py-3 bg-white text-primary-700 border border-primary-200 font-bold rounded-lg hover:bg-primary-50 transition-colors shadow-sm flex items-center"
                  />
                  <PDFDownloadButton
                    reportType="property-statement"
                    data={reportData}
                    fileName={`Aviso_Cobro_${selectedMonth}.pdf`}
                    label="Descargar Cuadro de Gastos (PDF)"
                    className="px-6 py-3 bg-white text-primary-700 border border-primary-200 font-bold rounded-lg hover:bg-primary-50 transition-colors shadow-sm flex items-center"
                  />
                </>
              )}

              <button
                onClick={() =>
                  (window.location.href = "/dashboard/reportes/cierre-mensual")
                }
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Volver al Historial
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
