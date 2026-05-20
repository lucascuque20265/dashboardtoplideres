-- ============================================================
-- Tabela de auditoria
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id            BIGSERIAL     PRIMARY KEY,
  tabela        TEXT          NOT NULL,
  acao          TEXT          NOT NULL CHECK (acao IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id     TEXT,
  dados_antigos JSONB,
  dados_novos   JSONB,
  user_id       UUID,
  user_email    TEXT,
  criado_em     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_criado_em ON public.audit_log (criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_tabela    ON public.audit_log (tabela);
CREATE INDEX IF NOT EXISTS idx_audit_log_acao      ON public.audit_log (acao);

ALTER TABLE public.audit_log DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Função do trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.fn_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_log (
    tabela, acao, record_id,
    dados_antigos, dados_novos,
    user_id, user_email
  )
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
      ELSE NEW.id::TEXT
    END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid())
  );
  RETURN NULL;
END;
$$;

-- ============================================================
-- Triggers nas tabelas principais
-- ============================================================
DROP TRIGGER IF EXISTS trg_audit_candidates ON public.candidates;
CREATE TRIGGER trg_audit_candidates
  AFTER INSERT OR UPDATE OR DELETE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_products_services ON public.products_services;
CREATE TRIGGER trg_audit_products_services
  AFTER INSERT OR UPDATE OR DELETE ON public.products_services
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_demands ON public.demands;
CREATE TRIGGER trg_audit_demands
  AFTER INSERT OR UPDATE OR DELETE ON public.demands
  FOR EACH ROW EXECUTE FUNCTION public.fn_audit_log();
