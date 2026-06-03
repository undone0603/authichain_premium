-- Add AI AutoFlow fields (from AuthiChain)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS industry_id TEXT,
ADD COLUMN IF NOT EXISTS workflow JSONB,
ADD COLUMN IF NOT EXISTS story TEXT,
ADD COLUMN IF NOT EXISTS features TEXT[],
ADD COLUMN IF NOT EXISTS authenticity_features TEXT[],
ADD COLUMN IF NOT EXISTS confidence INTEGER;

-- Add QRON fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS truemark_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS verification_url TEXT,
ADD COLUMN IF NOT EXISTS scan_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP;

-- Create scans tracking table
CREATE TABLE IF NOT EXISTS product_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  truemark_id TEXT NOT NULL,
  scanned_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  location JSONB, -- {city, country, lat, lng}
  verified BOOLEAN DEFAULT TRUE,
  lead_captured BOOLEAN DEFAULT FALSE
);

-- Create leads table
CREATE TABLE IF NOT EXISTS captured_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID REFERENCES product_scans(id),
  product_id UUID REFERENCES products(id),
  name TEXT,
  email TEXT,
  company TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_industry ON products(industry_id);
CREATE INDEX IF NOT EXISTS idx_products_truemark ON products(truemark_id);
CREATE INDEX IF NOT EXISTS idx_scans_product ON product_scans(product_id);
CREATE INDEX IF NOT EXISTS idx_scans_truemark ON product_scans(truemark_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON captured_leads(email);
