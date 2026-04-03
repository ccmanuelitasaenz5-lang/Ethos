-- Add new fields to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS legal_representative TEXT,
ADD COLUMN IF NOT EXISTS representative_phone TEXT,
ADD COLUMN IF NOT EXISTS representative_role TEXT;

-- =====================================================
-- FIX RLS RECURSION (NUCLEAR VERSION)
-- =====================================================

-- 1. Helper Function: Get User Organization (Security Definer)
CREATE OR REPLACE FUNCTION public.get_auth_organization()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT organization_id FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Helper Function: Get User Role (Security Definer)
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. DROP ALL PROBLEM POLICIES
DROP POLICY IF EXISTS "Users can view users in their organization" ON public.users;
DROP POLICY IF EXISTS "Admins can manage users in their organization" ON public.users;
DROP POLICY IF EXISTS "user_view_self" ON public.users;
DROP POLICY IF EXISTS "user_view_org" ON public.users;
DROP POLICY IF EXISTS "user_insert_self" ON public.users;

DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON public.organizations;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.organizations;

-- 4. APPLY STABLE POLICIES: USERS
CREATE POLICY "user_view_own_or_org" ON public.users 
FOR SELECT USING (id = auth.uid() OR organization_id = get_auth_organization());

CREATE POLICY "user_insert_self" ON public.users 
FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "admin_manage_users" ON public.users 
FOR ALL USING (organization_id = get_auth_organization() AND get_auth_role() = 'admin');

-- 5. APPLY STABLE POLICIES: ORGANIZATIONS
CREATE POLICY "org_view_own" ON public.organizations 
FOR SELECT USING (id = get_auth_organization());

CREATE POLICY "org_insert_new" ON public.organizations 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "org_update_admin" ON public.organizations 
FOR UPDATE USING (id = get_auth_organization() AND get_auth_role() = 'admin');

-- 6. Indices (ensure they exist)
CREATE INDEX IF NOT EXISTS idx_users_id_org ON public.users(id, organization_id);
