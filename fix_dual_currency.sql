-- SQL Fix for ETHOS v2.0
-- Adds dual currency support and missing columns to journal_entries

-- 1. Actualizar tabla journal_entries
ALTER TABLE public.journal_entries 
ADD COLUMN IF NOT EXISTS debit_ves DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS credit_ves DECIMAL(15,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(15,4);

-- Comentario: Las columnas 'debit' y 'credit' existentes se usarán para USD por defecto según la lógica actual del sistema.

-- 2. Asegurar que los índices existan para rendimiento
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_ref ON public.journal_entries(reference_id, reference_type);

-- 3. (Opcional) Inicializar cuentas contables para una organización específica
-- Deberás reemplazar 'TU-ORG-UUID' con el ID de tu organización si decides hacerlo por SQL.
-- O simplemente usa el botón "Inicializar Plan Base" en el Dashboard después de que hayamos arreglado el código.
