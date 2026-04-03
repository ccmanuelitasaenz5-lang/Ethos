"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Definimos los tipos de cuentas permitidos según la estructura contable
export type AccountType =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "INCOME"
  | "EXPENSE";

/**
 * Función: Obtener el Plan de Cuentas completo
 * Trae todas las cuentas registradas para la organización del usuario actual.
 */
export async function getChartOfAccounts() {
  const supabase = createClient();

  // 1. Identificar al usuario conectado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");

  // 2. Obtener el ID de la organización del usuario
  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!userData?.organization_id)
    throw new Error("Usuario sin organización asignada");

  // 3. Consultar la tabla de cuentas de esa organización
  const { data, error } = await supabase
    .from("accounting_accounts")
    .select("*")
    .eq("organization_id", userData.organization_id)
    .order("code", { ascending: true }); // Ordenar por código (1, 1.1, 1.1.01...)

  if (error) {
    console.error("Error al obtener cuentas:", error);
    return [];
  }

  return data;
}

/**
 * Función: Generar Plan de Cuentas Base (VEN-NIF para OSFL)
 * Crea automáticamente la estructura de cuentas estándar para Venezuela.
 */
export async function seedDefaultAccounts(organizationId: string) {
  const { createAdminClient } = await import("@/lib/supabase/server");
  const supabase = createAdminClient();

  console.log("SEED: Iniciando proceso para organización:", organizationId);

  if (!organizationId) {
    console.error("SEED ERROR: organizationId es nulo o indefinido");
    return { error: "ID de organización no válido" };
  }

  // Estructura sugerida para Organizaciones Sin Fines de Lucro y Condominios
  const defaultAccounts = [
    // --- 1. ACTIVOS ---
    { code: "1", name: "ACTIVO", type: "ASSET", level: 1, move: false },
    {
      code: "1.1",
      name: "EFECTIVO Y EQUIVALENTES",
      type: "ASSET",
      level: 2,
      move: false,
    },
    {
      code: "1.1.01",
      name: "Caja Principal (Efectivo Bs.)",
      type: "ASSET",
      level: 3,
      move: true,
    },
    {
      code: "1.1.02",
      name: "Caja Principal (Efectivo USD)",
      type: "ASSET",
      level: 3,
      move: true,
    },
    {
      code: "1.1.03",
      name: "Banco Nacional 01",
      type: "ASSET",
      level: 3,
      move: true,
    },
    {
      code: "1.1.04",
      name: "Banco Nacional 02",
      type: "ASSET",
      level: 3,
      move: true,
    },
    {
      code: "1.1.05",
      name: "Banco Custodio (USD)",
      type: "ASSET",
      level: 3,
      move: true,
    },
    { code: "1.1.06", name: "Caja Chica", type: "ASSET", level: 3, move: true },

    // --- 2. PASIVOS ---
    { code: "2", name: "PASIVO", type: "LIABILITY", level: 1, move: false },
    {
      code: "2.1",
      name: "CUENTAS POR PAGAR",
      type: "LIABILITY",
      level: 2,
      move: false,
    },
    {
      code: "2.1.01",
      name: "Proveedores Nacionales",
      type: "LIABILITY",
      level: 3,
      move: true,
    },
    {
      code: "2.1.02",
      name: "Gastos por Pagar",
      type: "LIABILITY",
      level: 3,
      move: true,
    },

    // --- 3. PATRIMONIO ---
    { code: "3", name: "PATRIMONIO", type: "EQUITY", level: 1, move: false },
    {
      code: "3.1",
      name: "FONDO SOCIAL / RESERVAS",
      type: "EQUITY",
      level: 2,
      move: true,
    },
    {
      code: "3.2",
      name: "RESULTADOS ACUMULADOS",
      type: "EQUITY",
      level: 2,
      move: true,
    },

    // --- 4. INGRESOS ---
    { code: "4", name: "INGRESOS", type: "INCOME", level: 1, move: false },
    {
      code: "4.1",
      name: "CUOTAS ORDINARIAS",
      type: "INCOME",
      level: 2,
      move: true,
    },
    {
      code: "4.2",
      name: "CUOTAS EXTRAORDINARIAS",
      type: "INCOME",
      level: 2,
      move: true,
    },
    {
      code: "4.3",
      name: "DONACIONES / OTROS INGRESOS",
      type: "INCOME",
      level: 2,
      move: true,
    },

    // --- 5. GASTOS ---
    {
      code: "5",
      name: "GASTOS OPERATIVOS",
      type: "EXPENSE",
      level: 1,
      move: false,
    },
    {
      code: "5.1",
      name: "GASTOS DE PERSONAL",
      type: "EXPENSE",
      level: 2,
      move: true,
    },
    {
      code: "5.2",
      name: "SERVICIOS PÚBLICOS",
      type: "EXPENSE",
      level: 2,
      move: true,
    },
    {
      code: "5.3",
      name: "REPARACIONES Y MANTENIMIENTO",
      type: "EXPENSE",
      level: 2,
      move: true,
    },
    {
      code: "5.4",
      name: "GASTOS ADMINISTRATIVOS",
      type: "EXPENSE",
      level: 2,
      move: true,
    },
  ];

  // Proceso de inserción en la base de datos
  for (const acc of defaultAccounts) {
    // Verificamos si la cuenta ya existe
    const { data: existing, error: checkError } = await supabase
      .from("accounting_accounts")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("code", acc.code)
      .maybeSingle();
    
    // Optimizamos la consulta de validación (technical audit finding 6.1)

    if (checkError) {
      console.error(`Error al verificar cuenta ${acc.code}:`, checkError);
      continue;
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from("accounting_accounts")
        .insert({
          organization_id: organizationId,
          code: acc.code,
          name: acc.name,
          main_type: acc.type as AccountType,
          level: acc.level,
          is_movement: acc.move,
        });

      if (insertError) {
        console.error(
          `SEED ERROR al insertar cuenta ${acc.code}:`,
          insertError,
        );
      } else {
        console.log(`SEED SUCCESS: Cuenta ${acc.code} creada.`);
      }
    } else {
      console.log(`SEED SKIP: Cuenta ${acc.code} ya existe.`);
    }
  }

  // Refrescar la caché de la página de configuración para mostrar los cambios
  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

/**
 * Función: Crear una cuenta contable individual
 */
export async function createAccount(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!userData?.organization_id) return { error: "Sin organización" };

  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const main_type = formData.get("main_type") as AccountType;
  const is_movement = formData.get("is_movement") === "true";

  // Calcular nivel basado en puntos (ej: 1.1.01 -> nivel 3)
  const level = code.split(".").length;

  const { error } = await supabase.from("accounting_accounts").insert({
    organization_id: userData.organization_id,
    code,
    name,
    main_type,
    level,
    is_movement,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

/**
 * Función: Importar cuentas desde texto (TXT)
 * Formato esperado por línea: Código | Nombre | Tipo | Movimiento (S/N)
 * Ejemplo: 1.1.07 | Banco de Venezuela | ASSET | S
 */
export async function importAccountsFromText(text: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!userData?.organization_id) return { error: "Sin organización" };

  const lines = text.split("\n");
  const results = { success: 0, error: 0 };

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    const parts = line.split("|").map((p) => p.trim());
    if (parts.length < 3) {
      results.error++;
      continue;
    }

    const [code, name, typeStr, moveStr] = parts;
    const level = code.split(".").length;
    const is_movement =
      moveStr?.toUpperCase() === "S" || moveStr?.toUpperCase() === "SI";

    const { error } = await supabase.from("accounting_accounts").insert({
      organization_id: userData.organization_id,
      code,
      name,
      main_type: typeStr as AccountType,
      level,
      is_movement,
    });

    if (error) results.error++;
    else results.success++;
  }

  revalidatePath("/dashboard/configuracion");
  return { ...results };
}

/**
 * Función: Actualizar una cuenta contable
 */
export async function updateAccount(id: string, formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const name = formData.get("name") as string;
  const main_type = formData.get("main_type") as AccountType;
  const is_movement = formData.get("is_movement") === "true";

  const { error } = await supabase
    .from("accounting_accounts")
    .update({
      name,
      main_type,
      is_movement,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

/**
 * Función: Eliminar una cuenta contable
 */
export async function deleteAccount(id: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  // Verificar si tiene asientos asociados antes de borrar
  const { data: account } = await supabase
    .from("accounting_accounts")
    .select("code, organization_id")
    .eq("id", id)
    .single();

  if (account) {
    const { count } = await supabase
      .from("journal_entries")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", account.organization_id)
      .eq("account_code", account.code);

    if (count && count > 0) {
      return {
        error:
          "No se puede eliminar una cuenta que tiene asientos contables asociados.",
      };
    }
  }

  const { error } = await supabase
    .from("accounting_accounts")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/configuracion");
  return { success: true };
}

/**
 * Función: Verificar si un periodo está cerrado
 * Retorna true si el mes de la fecha dada ya tiene un cierre "closed".
 */
export async function isPeriodClosed(dateString: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return true;

  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!userData?.organization_id) return true;

  // Extraer año y mes de la fecha (YYYY-MM-DD)
  const datePart = dateString.split("T")[0];
  const [year, month] = datePart.split("-");
  const period = `${year}-${month}-01`;

  const { data } = await supabase
    .from("monthly_closings")
    .select("id")
    .eq("organization_id", userData.organization_id)
    .eq("period", period)
    .eq("status", "closed")
    .maybeSingle();

  return !!data;
}

/**
 * Función: Crear un Asiento Contable Manual (Bimonetario)
 * Valida la partida doble en USD y VES antes de registrar.
 */
export async function createManualJournalEntry(payload: {
  date: string;
  description: string;
  exchange_rate: number;
  items: {
    account_code: string;
    account_name: string;
    description?: string;
    debit: number;
    credit: number;
    debit_ves: number;
    credit_ves: number;
  }[];
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado" };

  const { data: userData } = await supabase
    .from("users")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (!userData?.organization_id) return { error: "Sin organización" };

  // 1. Validar Periodo
  if (await isPeriodClosed(payload.date)) {
    return { error: "El periodo contable está cerrado para esta fecha." };
  }

  // 2. Validar Partida Doble
  const totalDebitUSD = payload.items.reduce((sum, i) => sum + i.debit, 0);
  const totalCreditUSD = payload.items.reduce((sum, i) => sum + i.credit, 0);
  const totalDebitVES = payload.items.reduce((sum, i) => sum + i.debit_ves, 0);
  const totalCreditVES = payload.items.reduce((sum, i) => sum + i.credit_ves, 0);

  const diffUSD = Math.abs(totalDebitUSD - totalCreditUSD);
  const diffVES = Math.abs(totalDebitVES - totalCreditVES);

  if (diffUSD > 0.01 || diffVES > 0.01) {
    return {
      error: `El asiento no cuadra. Diferencia USD: ${diffUSD.toFixed(2)}, Diferencia VES: ${diffVES.toFixed(2)}`,
    };
  }

  // 3. Obtener siguiente número de asiento
  const { data: lastEntry } = await supabase
    .from("journal_entries")
    .select("entry_number")
    .eq("organization_id", userData.organization_id)
    .order("entry_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber = (lastEntry?.entry_number || 0) + 1;

  // 4. Preparar registros
  const entries = payload.items.map((item) => ({
    organization_id: userData.organization_id,
    date: payload.date,
    entry_number: nextNumber,
    description: item.description || payload.description,
    account_code: item.account_code,
    account_name: item.account_name,
    debit: item.debit,
    credit: item.credit,
    debit_ves: item.debit_ves,
    credit_ves: item.credit_ves,
    exchange_rate: payload.exchange_rate,
    reference_type: "manual",
    created_by: user.id,
  }));

  const { error } = await supabase.from("journal_entries").insert(entries);

  if (error) {
    console.error("Error al insertar asiento manual:", error);
    return { error: "Error en base de datos al guardar el asiento." };
  }

  revalidatePath("/dashboard/libro-digital");
  return { success: true, entry_number: nextNumber };
}
