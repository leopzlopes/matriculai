-- Tabela para histórico de minutas geradas pelos usuários
CREATE TABLE public.documentos_gerados (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('escritura', 'contrato')),
  subtipo     TEXT NOT NULL,
  titulo      TEXT NOT NULL,
  texto       TEXT NOT NULL,
  dados       JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON public.documentos_gerados (user_id, created_at DESC);

ALTER TABLE public.documentos_gerados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios veem proprios documentos"
  ON public.documentos_gerados FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "usuarios inserem proprios documentos"
  ON public.documentos_gerados FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios deletam proprios documentos"
  ON public.documentos_gerados FOR DELETE
  USING (auth.uid() = user_id);
