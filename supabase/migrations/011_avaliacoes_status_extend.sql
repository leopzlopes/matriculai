-- Migration 011: Extend CHECK constraints for avaliacoes status columns
-- Adds 'pago' and 'concluido' to avaliacoes_propostas.status
-- Adds 'aguardando_entrega' to avaliacoes_solicitacoes.status
-- Required for Stripe Connect Express webhook handlers (Phase 2)

-- Drop and recreate constraint on avaliacoes_propostas.status
ALTER TABLE avaliacoes_propostas
  DROP CONSTRAINT IF EXISTS avaliacoes_propostas_status_check;

ALTER TABLE avaliacoes_propostas
  ADD CONSTRAINT avaliacoes_propostas_status_check
  CHECK (status IN ('enviada', 'aceita', 'recusada', 'cancelada', 'pago', 'concluido'));

-- Drop and recreate constraint on avaliacoes_solicitacoes.status
ALTER TABLE avaliacoes_solicitacoes
  DROP CONSTRAINT IF EXISTS avaliacoes_solicitacoes_status_check;

ALTER TABLE avaliacoes_solicitacoes
  ADD CONSTRAINT avaliacoes_solicitacoes_status_check
  CHECK (status IN ('aberta', 'em_negociacao', 'contratada', 'aguardando_entrega', 'concluida', 'cancelada', 'em_disputa'));
