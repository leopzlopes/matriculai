-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  pdf_url TEXT,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  client_id UUID,
  client_name TEXT
);

-- Create analysis_details table
CREATE TABLE IF NOT EXISTS analysis_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  extracted_data JSONB,
  alerts JSONB,
  chain_of_title JSONB,
  notes TEXT
);

-- Create indexes
CREATE INDEX idx_analyses_client_id ON analyses(client_id);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_created_at ON analyses(created_at);
CREATE INDEX idx_analysis_details_analysis_id ON analysis_details(analysis_id);

-- Enable RLS (Row Level Security)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_details ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all access for authenticated users" ON analyses
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON analysis_details
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
