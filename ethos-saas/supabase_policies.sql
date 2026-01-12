-- supabase_policies.sql
-- Consolidated script for Supabase RLS policies and related tables
-- IDEMPOTENT VERSION: Can be run multiple times.
-- ------------------------------------------------------------

-- 1. Create Type safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_main_type') THEN
        CREATE TYPE account_main_type AS ENUM (
            'ASSET',        -- Activo
            'LIABILITY',    -- Pasivo
            'EQUITY',       -- Patrimonio
            'INCOME',       -- Ingresos
            'EXPENSE'       -- Gastos
        );
    END IF;
END $$;

-- 2. Tables and Structures
-- ------------------------------------------------------------

-- Tabla de cuentas contables
CREATE TABLE IF NOT EXISTS public.accounting_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,                         -- Ej: '1.1.01'
    name TEXT NOT NULL,                         -- Ej: 'Caja Principal'
    main_type account_main_type NOT NULL,       -- Tipo principal
    parent_id UUID REFERENCES public.accounting_accounts(id) ON DELETE RESTRICT,
    level INTEGER NOT NULL DEFAULT 1,           -- Nivel de jerarquía (1, 2, 3...)
    is_movement BOOLEAN DEFAULT FALSE,          -- TRUE si permite asientos (último nivel)
    balance DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (organization_id, code)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_accounts_org ON public.accounting_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_accounts_code ON public.accounting_accounts(organization_id, code);

-- ------------------------------------------------------------
-- 3. Habilitar Row Level Security (RLS)
-- ------------------------------------------------------------
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.accounting_accounts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- 4. Clean up existing policies to avoid conflicts
-- ------------------------------------------------------------
DO $$
BEGIN
    -- Users policies
    DROP POLICY IF EXISTS user_view_self ON public.users;
    DROP POLICY IF EXISTS user_insert_self ON public.users;
    DROP POLICY IF EXISTS user_update_self ON public.users;
    DROP POLICY IF EXISTS "Users can view users in their organization" ON public.users;
    DROP POLICY IF EXISTS "Admins can manage users in their organization" ON public.users;
    DROP POLICY IF EXISTS "user_view_own_or_org" ON public.users;
    DROP POLICY IF EXISTS "admin_manage_users" ON public.users;
    
    -- Organizations policies
    DROP POLICY IF EXISTS org_insert_self ON public.organizations;
    DROP POLICY IF EXISTS org_read_self ON public.organizations;
    DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
    DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;
    DROP POLICY IF EXISTS "org_view_own" ON public.organizations;
    DROP POLICY IF EXISTS "org_insert_new" ON public.organizations;
    DROP POLICY IF EXISTS "org_update_admin" ON public.organizations;
    
    -- Accounting accounts policies
    DROP POLICY IF EXISTS acct_view_self ON public.accounting_accounts;
    DROP POLICY IF EXISTS acct_manage_admin ON public.accounting_accounts;
END $$;

-- ------------------------------------------------------------
-- 5. Create Policies
-- ------------------------------------------------------------

-- A. TABLA: users
-- Permitir que cada usuario vea su propio registro
CREATE POLICY user_view_self ON public.users
FOR SELECT USING (auth.uid() = id);

-- Permitir que cada usuario inserte su propio registro (autenticado)
CREATE POLICY user_insert_self ON public.users
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Permitir que cada usuario actualice su propio registro
CREATE POLICY user_update_self ON public.users
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Asegurar acceso total para el service_role (Admin bypass)
CREATE POLICY user_admin_all ON public.users
FOR ALL TO service_role USING (true) WITH CHECK (true);


-- B. TABLA: organizations
-- Permitir que cualquier usuario autenticado cree una organización al registrarse
CREATE POLICY org_insert_self ON public.organizations
FOR INSERT WITH CHECK (true);

-- Permitir que el usuario lea solo la organización a la que pertenece
CREATE POLICY org_read_self ON public.organizations
FOR SELECT USING (
    id IN (
        SELECT organization_id
        FROM public.users
        WHERE id = auth.uid()
    )
);

-- Asegurar acceso total para el service_role (Admin bypass)
CREATE POLICY org_admin_all ON public.organizations
FOR ALL TO service_role USING (true) WITH CHECK (true);


-- C. TABLA: accounting_accounts
-- Lectura: usuarios pueden ver cuentas de su propia organización
CREATE POLICY acct_view_self ON public.accounting_accounts
FOR SELECT USING (
    organization_id IN (
        SELECT organization_id
        FROM public.users
        WHERE id = auth.uid()
    )
);

-- Gestión completa solo para roles admin o auditor dentro de la organización
CREATE POLICY acct_manage_admin ON public.accounting_accounts
FOR ALL USING (
    organization_id IN (
        SELECT organization_id
        FROM public.users
        WHERE id = auth.uid() AND role IN ('admin', 'auditor')
    )
);

-- Asegurar acceso total para el service_role (Admin bypass)
CREATE POLICY acct_admin_all ON public.accounting_accounts
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ------------------------------------------------------------
-- 6. Actualizar tabla journal_entries si existe
-- ------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'journal_entries') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name = 'account_id') THEN
            ALTER TABLE public.journal_entries
                ADD COLUMN account_id UUID REFERENCES public.accounting_accounts(id) ON DELETE RESTRICT;
        END IF;
    END IF;
END $$;

-- Fin del script
