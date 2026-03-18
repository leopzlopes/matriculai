-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create analyses table
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_name TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  pdf_url TEXT,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create analysis_data table
CREATE TABLE IF NOT EXISTS analysis_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  tab_name TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_status ON analyses(status);
CREATE INDEX idx_analyses_created_at ON analyses(created_at);
CREATE INDEX idx_analysis_data_analysis_id ON analysis_data(analysis_id);
CREATE INDEX idx_analysis_data_tab_name ON analysis_data(tab_name);

-- Enable RLS (Row Level Security)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_data ENABLE ROW LEVEL SECURITY;

-- Create policies for analyses (users can only see their own data)
CREATE POLICY "Users can view own analyses" ON analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for analysis_data (through analyses)
CREATE POLICY "Users can view own analysis data" ON analysis_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM analyses 
      WHERE analyses.id = analysis_data.analysis_id 
      AND analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own analysis data" ON analysis_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM analyses 
      WHERE analyses.id = analysis_data.analysis_id 
      AND analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own analysis data" ON analysis_data
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM analyses 
      WHERE analyses.id = analysis_data.analysis_id 
      AND analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own analysis data" ON analysis_data
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM analyses 
      WHERE analyses.id = analysis_data.analysis_id 
      AND analyses.user_id = auth.uid()
    )
  );

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_data_updated_at
  BEFORE UPDATE ON analysis_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
