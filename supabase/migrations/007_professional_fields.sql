-- Adicionar colunas profissionais à tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tipo_usuario TEXT
    CHECK (tipo_usuario IN ('comprador', 'advogado', 'corretor', 'credor')),
  ADD COLUMN IF NOT EXISTS oab_numero  TEXT,
  ADD COLUMN IF NOT EXISTS oab_uf      CHAR(2),
  ADD COLUMN IF NOT EXISTS is_advogado BOOLEAN NOT NULL DEFAULT false;

-- Recriar trigger para popular campos do metadata do auth
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
  INSERT INTO public.profiles (id, plan, tipo_usuario, oab_numero, oab_uf, is_advogado)
  VALUES (
    NEW.id,
    'freemium',
    CASE WHEN v_tipo IN ('comprador','advogado','corretor','credor') THEN v_tipo ELSE NULL END,
    NEW.raw_user_meta_data->>'oab_numero',
    NEW.raw_user_meta_data->>'oab_uf',
    COALESCE(v_tipo = 'advogado', false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
