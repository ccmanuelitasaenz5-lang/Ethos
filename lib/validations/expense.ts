import { z } from 'zod'
 
export const expenseSchema = z.object({
  date: z.string().min(1, 'La fecha es requerida'),
 
  invoice_number: z.string().optional().nullable(),
  control_number: z.string().optional().nullable(),
 
  supplier: z.string()
    .min(2, 'El proveedor debe tener al menos 2 caracteres'),
 
  concept: z.string()
    .min(3, 'El concepto debe tener al menos 3 caracteres'),
 
  subtotal: z.coerce
    .number()
    .positive('El subtotal debe ser mayor a 0'),
 
  exchange_rate: z.coerce
    .number()
    .positive('La tasa debe ser mayor a 0'),
 
  iva_percentage: z.coerce
    .number()
    .min(0).max(100)
    .default(16),
 
  payment_method: z.enum([
    'efectivo','transferencia','pago_movil','cheque','tarjeta'
  ]),
 
  status: z.enum(['draft','finalized','annulled']).default('draft'),
 
  igtf_apply: z.boolean().default(false),
 
  account_code: z.string().optional().nullable(),
  category:     z.string().optional().nullable(),
  payment_account: z.string().optional().nullable(),
})
 
// Tipo inferido
export type ExpenseFormValues = z.infer<typeof expenseSchema>
