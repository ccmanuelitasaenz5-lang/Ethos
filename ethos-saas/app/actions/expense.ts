"use server";
 
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isPeriodClosed } from "@/app/actions/accounting";
import { expenseSchema } from "@/lib/validations/expense";
import { createAuditLog } from "@/lib/security/audit";
import { logSecurityEvent, isRateLimited } from "@/lib/security/logs";
import { getRateForDate } from "@/lib/exchange";
 
export async function createExpense(formData: FormData) {
  const supabase = await createClient();
 
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  if (!user) {
    return { error: "No autenticado" };
  }

  // Rate limiting para prevenir spam de gastos (20 por minuto)
  if (await isRateLimited("expense_creation", 20, 1)) {
    return { error: "Has excedido el límite de creación de registros por minuto. Por favor, espera un momento." };
  }
 
  // 1. Validar con Zod
  const rawData = {
    date: formData.get("date"),
    invoice_number: formData.get("invoice_number"),
    control_number: formData.get("control_number"),
    supplier: formData.get("supplier"),
    concept: formData.get("concept"),
    subtotal: formData.get("subtotal"),
    exchange_rate: formData.get("exchange_rate"),
    iva_percentage: formData.get("iva_percentage"),
    payment_method: formData.get("payment_method"),
    status: formData.get("status"),
    igtf_apply: formData.get("igtf_apply") === "true",
    category: formData.get("category"),
    account_code: formData.get("account_code"),
    payment_account: formData.get("payment_account"),
  };
 
  const parsed = expenseSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
 
  const values = parsed.data;
 
  // Get user's organization
  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();
 
  if (!userData?.organization_id) {
    return { error: "Usuario no asociado a una organización" };
  }
 
  if (await isPeriodClosed(values.date)) {
    return { error: "El periodo contable para esta fecha está cerrado." };
  }
 
  // 3. Cálculos derivados (Audit Finding: Centralizar lógica)
  const ivaAmount = values.subtotal * (values.iva_percentage / 100);
  const amountUSD = values.subtotal + ivaAmount;
  
  // Usar tasa ingresada o buscar la histórica del día
  let finalExchangeRate = values.exchange_rate;
  if (!finalExchangeRate || isNaN(finalExchangeRate)) {
      finalExchangeRate = await getRateForDate(values.date);
  }
  
  const amountVES_base = amountUSD * finalExchangeRate;
  const igtfAmount = values.igtf_apply ? amountVES_base * 0.03 : 0;
  const amountVES = amountVES_base + igtfAmount;
 
  const { data: expenseData, error: insertError } = await supabase
    .from("transactions_expense")
    .insert({
      organization_id: userData.organization_id,
      date: values.date,
      invoice_number: values.invoice_number,
      control_number: values.control_number,
      supplier: values.supplier,
      concept: values.concept,
      subtotal: values.subtotal,
      iva_percentage: values.iva_percentage,
      iva_amount: ivaAmount,
      amount_usd: amountUSD,
      amount_ves: amountVES,
      exchange_rate: finalExchangeRate,
      retention_iva: parseFloat(formData.get("retention_iva") as string) || null,
      retention_islr: parseFloat(formData.get("retention_islr") as string) || null,
      igtf_apply: values.igtf_apply,
      igtf_amount: igtfAmount,
      status: values.status,
      category: values.category,
      payment_method: values.payment_method,
      created_by: user.id,
    })
    .select()
    .single();
 
  if (insertError) {
    return { error: `Error al crear el gasto: ${insertError.message}` };
  }
 
  // 5. Audit Log
  await createAuditLog({
    organizationId: userData.organization_id,
    userId: user.id,
    action: "CREATE",
    tableName: "transactions_expense",
    recordId: expenseData.id,
    newData: values,
  });
 
  // --- GENERACIÓN AUTOMÁTICA DESACTIVADA (Transición a Libro Diario Manual) ---
  /*
  if (values.status === "finalized") {
      // ... (Lógica de asientos y bancos omitida para control manual) ...
  }
  */
 
  revalidatePath("/dashboard/gastos");
  revalidatePath("/dashboard/banco");
  revalidatePath("/dashboard/libro-digital");
  revalidatePath("/dashboard/reportes");
  return { success: true };
}
 
export async function deleteExpense(id: string) {
  // Ahora usamos soft delete por defecto
  const { softDeleteTransaction } = await import("./soft-delete");
  return softDeleteTransaction("transactions_expense", id);
}
 
export async function getExpense(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions_expense")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
 
  if (error) {
    console.error("Error fetching expense:", error);
    return null;
  }
  return data;
}
 
export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };
 
  const { data: oldRecord } = await supabase
    .from("transactions_expense")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();
 
  if (!oldRecord) return { error: "Gasto no encontrado" };
  if (oldRecord.status === "finalized") return { error: "No se puede editar un gasto finalizado" };
 
  const rawData = {
    date: formData.get("date"),
    invoice_number: formData.get("invoice_number"),
    control_number: formData.get("control_number"),
    supplier: formData.get("supplier"),
    concept: formData.get("concept"),
    subtotal: formData.get("subtotal"),
    exchange_rate: formData.get("exchange_rate"),
    iva_percentage: formData.get("iva_percentage"),
    payment_method: formData.get("payment_method"),
    status: formData.get("status"),
    igtf_apply: formData.get("igtf_apply") === "true",
    category: formData.get("category"),
    account_code: formData.get("account_code"),
    payment_account: formData.get("payment_account"),
  };
 
  const parsed = expenseSchema.safeParse(rawData);
  if (!parsed.success) return { error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  const values = parsed.data;
 
  const ivaAmount = values.subtotal * (values.iva_percentage / 100);
  const amountUSD = values.subtotal + ivaAmount;
  const amountVES_base = amountUSD * values.exchange_rate;
  const igtfAmount = values.igtf_apply ? amountVES_base * 0.03 : 0;
  const amountVES = amountVES_base + igtfAmount;
 
  const { error: updateError } = await supabase
    .from("transactions_expense")
    .update({
      date: values.date,
      invoice_number: values.invoice_number,
      control_number: values.control_number,
      supplier: values.supplier,
      concept: values.concept,
      subtotal: values.subtotal,
      iva_percentage: values.iva_percentage,
      iva_amount: ivaAmount,
      amount_usd: amountUSD,
      amount_ves: amountVES,
      exchange_rate: values.exchange_rate,
      igtf_apply: values.igtf_apply,
      igtf_amount: igtfAmount,
      status: values.status,
      category: values.category,
      payment_method: values.payment_method,
    })
    .eq("id", id);
 
  if (updateError) return { error: updateError.message };
 
  await createAuditLog({
    organizationId: oldRecord.organization_id,
    userId: user.id,
    action: "UPDATE",
    tableName: "transactions_expense",
    recordId: id,
    oldData: oldRecord,
    newData: values,
  });
 
  // ... lógica de finalized igual que en create ...
  // (Omitida para brevedad pero sigue el mismo patrón que create si values.status === 'finalized')
 
  revalidatePath("/dashboard/gastos");
  return { success: true };
}
