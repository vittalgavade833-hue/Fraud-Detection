-- ============================================================
-- FraudShield AI - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  reset_password_token VARCHAR(255),
  reset_password_expire TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- 2. TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id VARCHAR(20) NOT NULL UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
  type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'transfer', 'withdrawal', 'deposit', 'payment', 'refund')),
  location VARCHAR(200),
  country VARCHAR(100),
  currency VARCHAR(3) DEFAULT 'USD',
  description VARCHAR(500),
  device_info VARCHAR(500),
  ip_address VARCHAR(45),
  payment_method VARCHAR(20) CHECK (payment_method IN ('credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'crypto', 'other')),
  merchant_name VARCHAR(200),
  merchant_category VARCHAR(200),
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR(10) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  prediction VARCHAR(100),
  is_fraud BOOLEAN DEFAULT false,
  is_reviewed BOOLEAN DEFAULT false,
  reasons TEXT[],
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_transaction_id ON transactions(transaction_id);
CREATE INDEX idx_transactions_risk_level ON transactions(risk_level);
CREATE INDEX idx_transactions_is_fraud ON transactions(is_fraud);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================================
-- 3. FRAUD_ALERTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('high_risk', 'medium_risk', 'pattern_detected', 'velocity_check', 'location_anomaly')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR(10) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  description TEXT,
  reasons TEXT[],
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'confirmed_fraud', 'false_positive', 'investigating')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  investigation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraud_alerts_user_id ON fraud_alerts(user_id);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX idx_fraud_alerts_risk_level ON fraud_alerts(risk_level);
CREATE INDEX idx_fraud_alerts_created_at ON fraud_alerts(created_at DESC);

-- ============================================================
-- 4. FRAUD_PREDICTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS fraud_predictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  model_version VARCHAR(20) DEFAULT '1.0.0',
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_level VARCHAR(10) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
  prediction VARCHAR(100),
  confidence DECIMAL(5, 4) CHECK (confidence >= 0 AND confidence <= 1),
  features JSONB,
  reasons TEXT[],
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fraud_predictions_transaction_id ON fraud_predictions(transaction_id);

-- ============================================================
-- 5. INVESTIGATION_REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS investigation_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  alert_id UUID REFERENCES fraud_alerts(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  investigator_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  findings TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'escalated')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  actions JSONB DEFAULT '[]'::jsonb,
  conclusion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investigation_reports_alert_id ON investigation_reports(alert_id);
CREATE INDEX idx_investigation_reports_investigator_id ON investigation_reports(investigator_id);
CREATE INDEX idx_investigation_reports_status ON investigation_reports(status);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_fraud_alerts_updated_at BEFORE UPDATE ON fraud_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_investigation_reports_updated_at BEFORE UPDATE ON investigation_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- DISABLE RLS FOR SERVICE ROLE ACCESS (backend uses service key)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_reports ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (default when using service key)
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON fraud_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON fraud_predictions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON investigation_reports FOR ALL USING (true) WITH CHECK (true);

