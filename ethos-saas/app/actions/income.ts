"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isPeriodClosed } from "@/app/actions/accounting";

export async function createIncome(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  // Get user's organization
  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!userData?.organization_id) {
    return { error: "Usuario no asociado a una organización" };
  }

  const date = formData.get("date") as string;
  if (await isPeriodClosed(date)) {
    return { error: "El periodo contable para esta fecha está cerrado." };
  }

  const amountUSD = parseFloat(formData.get("amount_usd") as string) || 0;
  const exchangeRate =
    parseFloat(formData.get("exchange_rate") as string) || null;
  const amountVES = exchangeRate ? amountUSD * exchangeRate : 0;

  const { data: incomeData, error } = await supabase
    .from("transactions_income")
    .insert({
      organization_id: userData.organization_id,
      date: formData.get("date") as string,
      receipt_number: (formData.get("receipt_number") as string) || null,
      control_number: (formData.get("control_number") as string) || null,
      property_id: (formData.get("property_id") as string) || null,
      status:
        (formData.get("status") as "draft" | "finalized" | "annulled") ||
        "draft",
      concept: formData.get("concept") as string,
      amount_usd: amountUSD,
      amount_ves: amountVES,
      exchange_rate: exchangeRate,
      account_code: (formData.get("account_code") as string) || null,
      payment_method: (formData.get("payment_method") as string) || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // --- RESOLVER NOMBRES DE CUENTAS ---
  const { data: accounts } = await supabase
    .from("accounting_accounts")
    .select("code, name, id")
    .eq("organization_id", userData.organization_id)
    .in(
      "code",
      [
        formData.get("bank_account") as string,
        formData.get("account_code") as string,
      ].filter(Boolean),
    );

  const accountsMap: Record<string, string> = {};
  const accountsIds: Record<string, string> = {};
  accounts?.forEach((a) => {
    accountsMap[a.code] = a.name;
    accountsIds[a.code] = a.id;
  });

  // --- GENERAR ASIENTO CONTABLE ---
  // 1. Obtener siguiente número de asiento
  const { data: lastEntry } = await supabase
    .from("journal_entries")
    .select("entry_number")
    .eq("organization_id", userData.organization_id)
    .order("entry_number", { ascending: false })
    .limit(1)
    .single();

  const nextEntryNumber = (lastEntry?.entry_number || 0) + 1;

  // 2. Insertar partida doble
  const journalEntries = [
    {
      organization_id: userData.organization_id,
      date: formData.get("date") as string,
      entry_number: nextEntryNumber,
      description: `Ingreso: ${formData.get("concept") as string}`,
      account_code: (formData.get("bank_account") as string) || "1.1.01",
      account_name:
        accountsMap[formData.get("bank_account") as string] || "Caja y Bancos",
      debit: amountUSD,
      debit_ves: amountVES,
      credit: 0,
      credit_ves: 0,
      reference_id: incomeData.id,
      reference_type: "income",
      created_by: user.id,
    },
    {
      organization_id: userData.organization_id,
      date: formData.get("date") as string,
      entry_number: nextEntryNumber,
      description: `Ingreso: ${formData.get("concept") as string}`,
      account_code: (formData.get("account_code") as string) || "4.1.01",
      account_name:
        accountsMap[formData.get("account_code") as string] ||
        "Ingresos por Actividad",
      debit: 0,
      debit_ves: 0,
      credit: amountUSD,
      credit_ves: amountVES,
      reference_id: incomeData.id,
      reference_type: "income",
      created_by: user.id,
    },
  ];

  const { data: createdEntries } = await supabase
    .from("journal_entries")
    .insert(journalEntries)
    .select();

  // --- INTEGRACIÓN AUTOMÁTICA CON BANCOS ---
  // Verificar si la cuenta de depósito (bank_account) corresponde a una cuenta bancaria registrada
  const depositAccountCode = formData.get("bank_account") as string;

  if (depositAccountCode && accountsIds[depositAccountCode]) {
    // Buscar si existe una cuenta bancaria asociada a esta cuenta contable
    const { data: bankAccount } = await supabase
      .from("bank_accounts")
      .select("id, currency")
      .eq("accounting_account_id", accountsIds[depositAccountCode])
      .single();

    if (bankAccount) {
      // Determinar el monto según la moneda de la cuenta bancaria
      const transactionAmount =
        bankAccount.currency === "USD" ? amountUSD : amountVES;

      // Encontrar el ID del asiento contable correspondiente (el del débito)
      const debitEntry = createdEntries?.find(
        (e) => e.account_code === depositAccountCode,
      );

      if (transactionAmount > 0) {
        await supabase.from("bank_transactions").insert({
          organization_id: userData.organization_id,
          bank_account_id: bankAccount.id,
          date: formData.get("date") as string,
          description: `Ingreso: ${formData.get("concept") as string}`,
          amount: transactionAmount,
          transaction_type: "income",
          reference: formData.get("receipt_number") as string,
          created_by: user.id,
          journal_entry_id: debitEntry?.id,
        });
      }
    }
  }

  revalidatePath("/dashboard/ingresos");
  revalidatePath("/dashboard/banco");
  revalidatePath("/dashboard/libro-digital");
  revalidatePath("/dashboard/reportes");
  return { success: true };
}

export async function deleteIncome(id: string) {
  const supabase = await createClient();

  // Verify ownership before delete
  const { data: income } = await supabase
    .from("transactions_income")
    .select("organization_id, date")
    .eq("id", id)
    .single();

  if (income && (await isPeriodClosed(income.date))) {
    return { error: "El periodo contable para esta fecha está cerrado." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user?.id)
    .single();

  if (income?.organization_id !== userData?.organization_id) {
    return { error: "No autorizado" };
  }

  // 1. Buscar asientos asociados para eliminar transacciones bancarias vinculadas
  const { data: linkedEntries } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("reference_id", id)
    .eq("reference_type", "income");

  if (linkedEntries && linkedEntries.length > 0) {
    const entryIds = linkedEntries.map((e) => e.id);

    // Eliminar transacciones bancarias vinculadas a estos asientos
    await supabase
      .from("bank_transactions")
      .delete()
      .in("journal_entry_id", entryIds);

    // Eliminar asientos asociados
    await supabase.from("journal_entries").delete().in("id", entryIds);
  }

  // 2. Eliminar el ingreso
  const { error } = await supabase
    .from("transactions_income")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/ingresos");
  revalidatePath("/dashboard/libro-digital");
  revalidatePath("/dashboard/reportes");
  revalidatePath("/dashboard/banco");
  return { success: true };
}
