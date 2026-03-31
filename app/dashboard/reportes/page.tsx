import { createClient } from "@/lib/supabase/server";
import ReportsSummary from "@/components/reportes/ReportsSummary";
import FiscalReports from "@/components/reportes/FiscalReports";
import FinancialCharts from "@/components/dashboard/FinancialCharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

export default async function ReportesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user?.id)
    .maybeSingle();

  const organizationId = userData?.organization_id;

  // Get organization name (only if organizationId exists)
  let orgName = "Organización";
  let orgRif = "";
  if (organizationId) {
    const { data: orgData } = await supabase
      .from("organizations")
      .select("name, rif")
      .eq("id", organizationId)
      .maybeSingle();
    if (orgData) {
      orgName = orgData.name;
      orgRif = orgData.rif || "";
    }
  }

  // Get all income
  const { data: incomes } = organizationId
    ? await supabase
        .from("transactions_income")
        .select("*")
        .eq("organization_id", organizationId)
        .order("date", { ascending: false })
    : { data: [] };

  // Get all expenses
  const { data: expenses } = organizationId
    ? await supabase
        .from("transactions_expense")
        .select("*")
        .eq("organization_id", organizationId)
        .order("date", { ascending: false })
    : { data: [] };

  // Prepare Trend Data (Last 12 months for better report view)
  const trendMap: Record<
    string,
    { month: string; ingresos: number; gastos: number }
  > = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = format(d, "MMM", { locale: es });
    trendMap[key] = { month: key, ingresos: 0, gastos: 0 };
  }

  incomes?.forEach((t) => {
    const key = format(parseISO(t.date), "MMM", { locale: es });
    if (trendMap[key]) trendMap[key].ingresos += t.amount_usd || 0;
  });

  expenses?.forEach((t) => {
    const key = format(parseISO(t.date), "MMM", { locale: es });
    if (trendMap[key]) trendMap[key].gastos += t.amount_usd || 0;
  });

  const trendData = Object.values(trendMap);

  // Prepare Category Data
  const categoryMap: Record<string, number> = {};
  expenses?.forEach((t) => {
    const cat = t.category || "Otros";
    categoryMap[cat] = (categoryMap[cat] || 0) + (t.amount_usd || 0);
  });

  const categoryData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reportes Financieros
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Análisis visual y detallado de{" "}
            <span className="font-semibold text-primary-600">{orgName}</span>
          </p>
        </div>
        <Link
          href="/dashboard/reportes/cierre-mensual"
          className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
        >
          <svg
            className="w-5 h-5"
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
          <span className="font-bold text-sm">Cierre Mensual</span>
        </Link>
      </div>

      <FinancialCharts trendData={trendData} categoryData={categoryData} />

      <div className="pt-4">
        <ReportsSummary
          incomes={(incomes as any[]) || []}
          expenses={(expenses as any[]) || []}
          organizationName={orgName}
        />
      </div>

      <FiscalReports
        incomes={(incomes as any[]) || []}
        expenses={(expenses as any[]) || []}
        organization={{ name: orgName, rif: orgRif }}
      />
    </div>
  );
}
