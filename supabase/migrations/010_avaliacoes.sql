-- ============================================================
-- 010_avaliacoes.sql — Módulo Avaliações Imobiliárias
-- ============================================================

-- -------------------------------------------------------
-- 1. avaliadores_perfil
-- -------------------------------------------------------
CREATE TABLE public.avaliadores_perfil (
  user_id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  crea_numero           TEXT,
  crea_uf               TEXT,
  cnai_numero           TEXT,
  especialidades        TEXT[] DEFAULT '{}',
  bio                   TEXT,
  nota_media            NUMERIC(3,2) DEFAULT 0,
  total_avaliacoes      INT DEFAULT 0,
  stripe_account_id     TEXT,
  credencial_verificada BOOLEAN DEFAULT false,
  declaracao_aceita     BOOLEAN DEFAULT false,
  declaracao_aceita_at  TIMESTAMPTZ,
  parceiro_fundador     BOOLEAN DEFAULT false,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 2. avaliacoes_solicitacoes
-- -------------------------------------------------------
CREATE TABLE public.avaliacoes_solicitacoes (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_imovel         TEXT NOT NULL CHECK (tipo_imovel IN ('residencial','comercial','rural','industrial','terreno')),
  finalidade          TEXT NOT NULL CHECK (finalidade IN ('compra_venda','financiamento','judicial','seguro','inventario','outros')),
  endereco            TEXT NOT NULL,
  cidade              TEXT NOT NULL,
  uf                  TEXT NOT NULL,
  area_total_m2       NUMERIC,
  area_construida_m2  NUMERIC,
  matricula_disponivel BOOLEAN DEFAULT false,
  acesso_imovel       TEXT CHECK (acesso_imovel IN ('livre','agendamento','indisponivel')),
  caracteristicas     JSONB DEFAULT '{}',
  observacoes_livres  TEXT,
  fotos_tipo          TEXT CHECK (fotos_tipo IN ('upload','link')),
  fotos_urls          TEXT[] DEFAULT '{}',
  orcamento_min       NUMERIC,
  orcamento_max       NUMERIC,
  prazo_desejado      DATE,
  status              TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta','em_negociacao','contratada','concluida','cancelada','em_disputa')),
  avaliador_id        UUID REFERENCES auth.users(id),
  valor_pago          NUMERIC,
  from_matricula_id   UUID,
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 3. avaliacoes_propostas
-- -------------------------------------------------------
CREATE TABLE public.avaliacoes_propostas (
  id                        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitacao_id            UUID NOT NULL REFERENCES public.avaliacoes_solicitacoes(id) ON DELETE CASCADE,
  avaliador_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valor                     NUMERIC NOT NULL,
  prazo_execucao            INT NOT NULL,
  validade_proposta         DATE NOT NULL,
  metodologia               TEXT,
  observacoes               TEXT,
  status                    TEXT NOT NULL DEFAULT 'enviada' CHECK (status IN ('enviada','aceita','recusada','cancelada')),
  stripe_payment_intent_id  TEXT,
  created_at                TIMESTAMPTZ DEFAULT now(),
  UNIQUE(solicitacao_id, avaliador_id)
);

-- -------------------------------------------------------
-- 4. avaliacoes_mensagens
-- -------------------------------------------------------
CREATE TABLE public.avaliacoes_mensagens (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposta_id   UUID NOT NULL REFERENCES public.avaliacoes_propostas(id) ON DELETE CASCADE,
  remetente_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mensagem      TEXT NOT NULL,
  lida          BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- -------------------------------------------------------
-- 5. avaliacoes_reviews
-- -------------------------------------------------------
CREATE TABLE public.avaliacoes_reviews (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitacao_id       UUID NOT NULL REFERENCES public.avaliacoes_solicitacoes(id),
  avaliador_id         UUID NOT NULL REFERENCES auth.users(id),
  cliente_id           UUID NOT NULL REFERENCES auth.users(id),
  nota_ao_avaliador    INT CHECK (nota_ao_avaliador BETWEEN 1 AND 5),
  nota_ao_cliente      INT CHECK (nota_ao_cliente BETWEEN 1 AND 5),
  comentario_avaliador TEXT,
  comentario_cliente   TEXT,
  created_at           TIMESTAMPTZ DEFAULT now(),
  UNIQUE(solicitacao_id)
);

-- -------------------------------------------------------
-- 6. Índices
-- -------------------------------------------------------
CREATE INDEX ON public.avaliacoes_solicitacoes (user_id, created_at DESC);
CREATE INDEX ON public.avaliacoes_solicitacoes (status, created_at DESC);
CREATE INDEX ON public.avaliacoes_propostas (solicitacao_id);
CREATE INDEX ON public.avaliacoes_propostas (avaliador_id);
CREATE INDEX ON public.avaliacoes_mensagens (proposta_id, created_at);

-- -------------------------------------------------------
-- 7. RLS
-- -------------------------------------------------------
ALTER TABLE public.avaliadores_perfil        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_solicitacoes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_propostas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_mensagens      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_reviews        ENABLE ROW LEVEL SECURITY;

-- avaliadores_perfil
CREATE POLICY "perfil_select_todos"
  ON public.avaliadores_perfil FOR SELECT
  USING (true);

CREATE POLICY "perfil_insert_proprio"
  ON public.avaliadores_perfil FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "perfil_update_proprio"
  ON public.avaliadores_perfil FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "perfil_delete_proprio"
  ON public.avaliadores_perfil FOR DELETE
  USING (auth.uid() = user_id);

-- avaliacoes_solicitacoes
CREATE POLICY "solicitacoes_select"
  ON public.avaliacoes_solicitacoes FOR SELECT
  USING (
    auth.uid() = user_id
    OR status = 'aberta'
    OR auth.uid() = avaliador_id
  );

CREATE POLICY "solicitacoes_insert"
  ON public.avaliacoes_solicitacoes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "solicitacoes_update"
  ON public.avaliacoes_solicitacoes FOR UPDATE
  USING (auth.uid() = user_id);

-- avaliacoes_propostas
-- CRÍTICO: avaliador NÃO vê propostas de outros avaliadores para a mesma solicitação
CREATE POLICY "propostas_select"
  ON public.avaliacoes_propostas FOR SELECT
  USING (
    auth.uid() = avaliador_id
    OR solicitacao_id IN (
      SELECT id FROM public.avaliacoes_solicitacoes
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "propostas_insert"
  ON public.avaliacoes_propostas FOR INSERT
  WITH CHECK (auth.uid() = avaliador_id);

CREATE POLICY "propostas_update"
  ON public.avaliacoes_propostas FOR UPDATE
  USING (
    auth.uid() = avaliador_id
    OR solicitacao_id IN (
      SELECT id FROM public.avaliacoes_solicitacoes
      WHERE user_id = auth.uid()
    )
  );

-- avaliacoes_mensagens
CREATE POLICY "mensagens_select"
  ON public.avaliacoes_mensagens FOR SELECT
  USING (
    auth.uid() = remetente_id
    OR proposta_id IN (
      SELECT id FROM public.avaliacoes_propostas
      WHERE avaliador_id = auth.uid()
        OR solicitacao_id IN (
          SELECT id FROM public.avaliacoes_solicitacoes
          WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "mensagens_insert"
  ON public.avaliacoes_mensagens FOR INSERT
  WITH CHECK (
    auth.uid() = remetente_id
    AND proposta_id IN (
      SELECT id FROM public.avaliacoes_propostas
      WHERE avaliador_id = auth.uid()
        OR solicitacao_id IN (
          SELECT id FROM public.avaliacoes_solicitacoes
          WHERE user_id = auth.uid()
        )
    )
  );

-- avaliacoes_reviews
CREATE POLICY "reviews_select_publico"
  ON public.avaliacoes_reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_envolvidos"
  ON public.avaliacoes_reviews FOR INSERT
  WITH CHECK (auth.uid() = avaliador_id OR auth.uid() = cliente_id);

-- -------------------------------------------------------
-- 8. Storage — bucket avaliacoes-fotos
-- -------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avaliacoes-fotos',
  'avaliacoes-fotos',
  false,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "upload_proprio_avaliacao"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avaliacoes-fotos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "select_proprio_avaliacao"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'avaliacoes-fotos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "delete_proprio_avaliacao"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avaliacoes-fotos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
