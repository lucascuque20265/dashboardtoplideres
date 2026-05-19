-- ============================================================
-- Top Líderes Dashboard — Schema Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Tabela de candidatos
CREATE TABLE IF NOT EXISTS public.candidates (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  city        TEXT        NOT NULL,
  state       TEXT        NOT NULL,
  programs    TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de produtos/serviços (vinculados a um candidato)
CREATE TABLE IF NOT EXISTS public.products_services (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID        NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  name         TEXT        NOT NULL,
  status       TEXT        NOT NULL DEFAULT 'not_started'
                           CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  delivery_date TIMESTAMPTZ
);

-- Tabela de demandas (vinculadas a um produto/serviço)
CREATE TABLE IF NOT EXISTS public.demands (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  product_service_id  UUID        NOT NULL REFERENCES public.products_services(id) ON DELETE CASCADE,
  description         TEXT        NOT NULL,
  status              TEXT        NOT NULL DEFAULT 'not_started'
                                  CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  delivery_date       TIMESTAMPTZ,
  notes               TEXT,
  links               TEXT[]      DEFAULT '{}'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_services_candidate_id ON public.products_services(candidate_id);
CREATE INDEX IF NOT EXISTS idx_demands_product_service_id ON public.demands(product_service_id);

-- Desabilitar RLS (dashboard privado — sem auth de usuários)
ALTER TABLE public.candidates        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.demands           DISABLE ROW LEVEL SECURITY;
