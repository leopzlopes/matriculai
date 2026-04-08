-- Migration 012: Add laudo delivery fields to avaliacoes_propostas
ALTER TABLE avaliacoes_propostas
  ADD COLUMN IF NOT EXISTS laudo_url text,
  ADD COLUMN IF NOT EXISTS laudo_entregue_at timestamptz;
