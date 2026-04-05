-- Adicionar campos CRECI para corretores de imóveis
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS creci_numero TEXT,
  ADD COLUMN IF NOT EXISTS creci_uf     CHAR(2);

-- Atualizar trigger para incluir CRECI no metadata do auth
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipo TEXT;
BEGIN
  v_tipo := NEW.raw_user_meta_data->>'tipo_usuario';
  INSERT INTO public.profiles
    (id, plan, tipo_usuario, oab_numero, oab_uf, is_advogado, creci_numero, creci_uf)
  VALUES (
    NEW.id,
    'freemium',
    CASE WHEN v_tipo IN ('comprador','advogado','corretor','credor') THEN v_tipo ELSE NULL END,
    NEW.raw_user_meta_data->>'oab_numero',
    NEW.raw_user_meta_data->>'oab_uf',
    COALESCE(v_tipo = 'advogado', false),
    NEW.raw_user_meta_data->>'creci_numero',
    NEW.raw_user_meta_data->>'creci_uf'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
