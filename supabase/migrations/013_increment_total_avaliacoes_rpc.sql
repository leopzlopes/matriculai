-- Migration 013: RPC to safely increment total_avaliacoes on avaliadores_perfil
CREATE OR REPLACE FUNCTION increment_total_avaliacoes(avaliador_uid uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE avaliadores_perfil
  SET total_avaliacoes = total_avaliacoes + 1
  WHERE user_id = avaliador_uid;
$$;
