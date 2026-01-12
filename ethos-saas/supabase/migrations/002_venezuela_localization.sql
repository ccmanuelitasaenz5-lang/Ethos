-- =====================================================
-- MIGRATION: 002_venezuela_localization
-- Add support for VEN-NIF, SENIAT Fiscal Requirements
-- =====================================================

-- 1. Update Organization for Entity Type and Fiscal Config
ALTER TABLE organizations 
ADD COLUMN entity_type TEXT CHECK (entity_type IN ('GE', 'PYME')) DEFAULT 'PYME',
ADD COLUMN fiscal_printer_ip TEXT,
ADD COLUMN digital_invoice_api_key TEXT;

-- 2. Properties (Units / Apartamentos)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations ON DELETE CASCADE NOT NULL,
  number TEXT NOT NULL, -- e.g. "D-23"
  owner_name TEXT,
  aliquot DECIMAL(10,6) DEFAULT 0, -- Porcentaje de participación
  balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, number)
);

-- 3. Chart of Accounts (VEN-NIF)
-- 3. Chart of Accounts (VEN-NIF) -> Table name 'accounting_accounts' to match app actions
CREATE TABLE accounting_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  level INTEGER NOT NULL,
  parent_id UUID REFERENCES accounting_accounts(id),
  main_type TEXT CHECK (main_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE')),
  is_movement BOOLEAN DEFAULT TRUE, -- Defines if it can receive journal entries
  is_monetary BOOLEAN DEFAULT TRUE, -- For inflation adjustment
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, code)
);

-- 4. Inflation Indices (INPC)
CREATE TABLE inflation_indices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  index_value DECIMAL(10,4) NOT NULL,
  is_estimated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, month)
);

-- 5. Fiscal Events Log (Inalterable)
CREATE TABLE fiscal_events_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'INVOICE_GENERATED', 'REPORT_X', 'REPORT_Z'
  details JSONB,
  hash TEXT NOT NULL, -- SHA256 of the event details
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Update Transactions for Fiscal Compliance
ALTER TABLE transactions_income
ADD COLUMN property_id UUID REFERENCES properties(id),
ADD COLUMN control_number TEXT,
ADD COLUMN status TEXT CHECK (status IN ('draft', 'finalized', 'annulled')) DEFAULT 'draft';

ALTER TABLE transactions_expense
ADD COLUMN control_number TEXT,
ADD COLUMN igtf_apply BOOLEAN DEFAULT FALSE,
ADD COLUMN igtf_amount DECIMAL(12,2) DEFAULT 0,
ADD COLUMN status TEXT CHECK (status IN ('draft', 'finalized', 'annulled')) DEFAULT 'draft';

-- RLS Policies for new tables

-- Properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view properties" ON properties FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Admins can manage properties" ON properties FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Chart of Accounts
ALTER TABLE accounting_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view accounts" ON accounting_accounts FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Admins can manage accounts" ON accounting_accounts FOR ALL USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Fiscal Events Log (Read only for admins/auditors)
ALTER TABLE fiscal_events_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins/Auditors can view logs" ON fiscal_events_log FOR SELECT USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'auditor')));

-- Triggers for updated_at
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounting_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
