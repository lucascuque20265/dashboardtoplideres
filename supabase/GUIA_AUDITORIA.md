# Guia de Auditoria — Como Recuperar Dados e Rastrear Exclusões

Todos os comandos abaixo devem ser executados no **Supabase Dashboard → SQL Editor**.

---

## 1. Ver todos os registros apagados

```sql
SELECT
  criado_em AT TIME ZONE 'America/Sao_Paulo' AS horario,
  tabela,
  record_id,
  user_email,
  dados_antigos
FROM audit_log
WHERE acao = 'DELETE'
ORDER BY criado_em DESC;
```

---

## 2. Saber quem apagou um candidato específico

Substitua `%Nome%` pelo nome (ou parte do nome) do candidato:

```sql
SELECT
  criado_em AT TIME ZONE 'America/Sao_Paulo' AS horario,
  user_email                                  AS quem_apagou,
  dados_antigos->>'nome'                      AS nome_candidato,
  dados_antigos->>'cidade'                    AS cidade,
  dados_antigos->>'estado'                    AS estado,
  record_id
FROM audit_log
WHERE acao    = 'DELETE'
  AND tabela  = 'candidates'
  AND dados_antigos->>'nome' ILIKE '%Nome%'
ORDER BY criado_em DESC;
```

---

## 3. Ver o histórico completo de um candidato (criação, edições, exclusão)

Substitua `'id-do-candidato'` pelo ID que aparece na coluna `record_id`:

```sql
SELECT
  criado_em AT TIME ZONE 'America/Sao_Paulo' AS horario,
  acao,
  user_email,
  dados_antigos,
  dados_novos
FROM audit_log
WHERE tabela     = 'candidates'
  AND record_id  = 'id-do-candidato'
ORDER BY criado_em;
```

---

## 4. Recuperar (restaurar) um candidato apagado

### Passo 1 — Confirme os dados antes de restaurar

```sql
SELECT dados_antigos
FROM audit_log
WHERE acao   = 'DELETE'
  AND tabela = 'candidates'
ORDER BY criado_em DESC
LIMIT 1;
```

### Passo 2 — Restaure o registro

Substitua o `LIMIT 1` pelo `record_id` correto caso queira restaurar um específico:

```sql
INSERT INTO candidates
SELECT *
FROM jsonb_populate_record(
  null::candidates,
  (
    SELECT dados_antigos
    FROM audit_log
    WHERE acao      = 'DELETE'
      AND tabela    = 'candidates'
      AND record_id = 'id-do-candidato'   -- <-- troque aqui
    ORDER BY criado_em DESC
    LIMIT 1
  )
);
```

> **Atenção:** se o candidato tinha produtos/serviços e demandas vinculados, eles precisam ser restaurados separadamente (ver seções 6 e 7).

---

## 5. Recuperar produto/serviço apagado

```sql
INSERT INTO products_services
SELECT *
FROM jsonb_populate_record(
  null::products_services,
  (
    SELECT dados_antigos
    FROM audit_log
    WHERE acao      = 'DELETE'
      AND tabela    = 'products_services'
      AND record_id = 'id-do-produto'     -- <-- troque aqui
    ORDER BY criado_em DESC
    LIMIT 1
  )
);
```

---

## 6. Recuperar demanda apagada

```sql
INSERT INTO demands
SELECT *
FROM jsonb_populate_record(
  null::demands,
  (
    SELECT dados_antigos
    FROM audit_log
    WHERE acao      = 'DELETE'
      AND tabela    = 'demands'
      AND record_id = 'id-da-demanda'     -- <-- troque aqui
    ORDER BY criado_em DESC
    LIMIT 1
  )
);
```

---

## 7. Ver tudo que um usuário específico fez

Substitua `usuario@email.com` pelo e-mail da pessoa:

```sql
SELECT
  criado_em AT TIME ZONE 'America/Sao_Paulo' AS horario,
  acao,
  tabela,
  record_id,
  dados_antigos->>'nome' AS nome_registro
FROM audit_log
WHERE user_email = 'usuario@email.com'
ORDER BY criado_em DESC;
```

---

## 8. Resumo de atividade por usuário (últimos 30 dias)

```sql
SELECT
  user_email,
  COUNT(*) FILTER (WHERE acao = 'INSERT') AS criações,
  COUNT(*) FILTER (WHERE acao = 'UPDATE') AS edições,
  COUNT(*) FILTER (WHERE acao = 'DELETE') AS exclusões,
  MAX(criado_em) AT TIME ZONE 'America/Sao_Paulo' AS última_ação
FROM audit_log
WHERE criado_em >= NOW() - INTERVAL '30 days'
GROUP BY user_email
ORDER BY exclusões DESC, edições DESC;
```

---

## Observações importantes

- O campo `dados_antigos` contém **todos os dados do registro antes de ser apagado** — nome, cidade, programas, status, etc.
- O campo `dados_novos` contém os dados **após** uma criação ou edição.
- O campo `user_email` é preenchido automaticamente pelo trigger com o e-mail de quem estava logado no momento da ação.
- Todos os horários estão em UTC no banco. Use `AT TIME ZONE 'America/Sao_Paulo'` para ver no horário de Brasília.
