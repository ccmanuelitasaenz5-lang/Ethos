import { z } from 'zod'

export const assetSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  category: z.string().min(1, 'La categoría es requerida'),
  purchase_date: z.string().min(1, 'La fecha de compra es requerida'),
  cost_usd: z.coerce
    .number()
    .positive('El costo debe ser mayor a 0'),
  useful_life_months: z.coerce
    .number()
    .int()
    .positive('La vida útil debe ser al menos 1 mes'),
  location: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'disposed']).default('active'),
  description: z.string().optional().nullable(),
})

export type AssetFormValues = z.infer<typeof assetSchema>
