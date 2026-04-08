-- Migration 014: RPC to recalculate nota_media for an evaluator
CREATE OR REPLACE FUNCTION recalcular_nota_media(avaliador_uid uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE avaliadores_perfil
  SET nota_media = COALESCE(
    (SELECT AVG(nota_ao_avaliador)
     FROM avaliacoes_reviews
     WHERE avaliador_id = avaliador_uid
       AND nota_ao_avaliador IS NOT NULL),
    0
  )
  WHERE user_id = avaliador_uid;
$$;
