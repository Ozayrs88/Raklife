-- Create table for WhatsApp sessions with RLS
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Auth state (encrypted)
  auth_state JSONB NOT NULL DEFAULT '{}',
  
  -- Connection metadata
  phone_number TEXT,
  status TEXT CHECK (status IN ('disconnected', 'connecting', 'connected')) DEFAULT 'disconnected',
  last_connected_at TIMESTAMPTZ,
  qr_code TEXT, -- Temporary, cleared once connected
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One session per business
  UNIQUE(business_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_business_id ON whatsapp_sessions(business_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_status ON whatsapp_sessions(status);

-- Enable RLS
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Business owners can view their own sessions
CREATE POLICY "Business owners can view own whatsapp sessions"
  ON whatsapp_sessions
  FOR SELECT
  USING (
    business_id IN (
      SELECT business_id 
      FROM business_staff 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Business owners can insert their own sessions
CREATE POLICY "Business owners can create own whatsapp sessions"
  ON whatsapp_sessions
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT business_id 
      FROM business_staff 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Business owners can update their own sessions
CREATE POLICY "Business owners can update own whatsapp sessions"
  ON whatsapp_sessions
  FOR UPDATE
  USING (
    business_id IN (
      SELECT business_id 
      FROM business_staff 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Business owners can delete their own sessions
CREATE POLICY "Business owners can delete own whatsapp sessions"
  ON whatsapp_sessions
  FOR DELETE
  USING (
    business_id IN (
      SELECT business_id 
      FROM business_staff 
      WHERE user_id = auth.uid()
    )
  );

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_whatsapp_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER whatsapp_sessions_updated_at
  BEFORE UPDATE ON whatsapp_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_sessions_updated_at();

-- Grant access
GRANT ALL ON whatsapp_sessions TO authenticated;
GRANT ALL ON whatsapp_sessions TO service_role;
