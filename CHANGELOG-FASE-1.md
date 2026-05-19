# CHANGELOG — Fase 1 (Bug fixes + Features client-side)

Esta é a entrega da **Fase 1**. Tudo aqui roda sem backend — você pode dar build e deploy direto.
A **Fase 2** (Supabase: persistência real, auth, sincronização entre devices) vai na próxima rodada.

---

## 🐛 Bugs corrigidos

### 1. Filtro de data agora funciona
- **Antes:** Os date pickers de Início/Fim no `FilterPanel` não filtravam nada — o `Dashboard.tsx` ignorava `filters.dateRange`.
- **Depois:** Criado `src/utils/filters.ts` como única fonte da verdade. Aplica programa, status, datas, cidade, estado e busca de uma vez só. Dashboard e Kanban agora compartilham essa lógica.

### 2. Labels dos programas consistentes
- **Antes:** `mockData.ts` dizia `TM = 'TOP Municípios'`, `CategoriesColumn.tsx` dizia `TM = 'Mulheres'`. `TE = 'TOP Executivos'` vs `'TL Expansão'`. Bagunça.
- **Depois:** `CategoriesColumn.tsx` agora usa `getProgramLabel()` do `mockData.ts` — fonte única.

### 3. Timeline não mistura mais anos
- **Antes:** `format(date, 'MMM')` produzia só `"jan"` — janeiro/2025 e janeiro/2026 caíam no mesmo bucket. Sem ordem cronológica.
- **Depois:** Bucket usa chave `yyyy-MM` para agrupar; label visível é `"jan/26"`. Resultados ordenados cronologicamente.
- Aplicado em `Dashboard.tsx` e `CandidateDetail.tsx`.

### 4. `convertStatus` agora reconhece "Em Andamento"
- **Antes:** Só mapeava "realizada" → completed; tudo mais → not_started. Status "Em Andamento" no JSON virava "Não Iniciado".
- **Depois:** Reconhece variações de "Realizada/Concluída" e "Em Andamento/Em Progresso/Iniciada".

### 5. Código de debug e código morto removidos
- **Antes:** `CandidateDetail.tsx` tinha `console.log('=== Debug ===')` rodando em produção (linhas 34–50) e um segundo `if (!candidate)` inalcançável dentro de um `try/catch` (linhas 133–152).
- **Depois:** Arquivo reescrito do zero, limpo, sem debug, sem branches mortos.

---

## ✨ Features novas

### Busca por nome (no Dashboard e Kanban)
Input com ícone de lupa na parte superior do `FilterPanel`. Busca em nome, cidade, estado e código de programa simultaneamente.

### Filtro por cidade e estado
Dois novos blocos no painel de filtros, populados dinamicamente a partir dos candidatos cadastrados. Badge clicável quando selecionado.

### Export Excel/CSV
Botão "Exportar" no Dashboard agora é um dropdown com 3 opções: PDF (já existia), Excel (.xlsx, com aba Resumo e aba Demandas), CSV (delimitado por `;` com BOM UTF-8 pro Excel brasileiro reconhecer acentos).
- Arquivo: `src/utils/excelExport.ts`
- Nova dependência: `xlsx@^0.18.5`

### Ranking de candidatos
Widget `RankingCard` mostrando top N candidatos por % de conclusão, com troféu/medalha/medalha de bronze nas 3 primeiras posições. Clicável → vai pro detalhe.
- Arquivo: `src/components/dashboard/RankingCard.tsx`

### Visualização Kanban
Nova página em `/kanban` (link no header), com 3 colunas (Pendente / Em Andamento / Realizada). Cada card é uma demanda; clica e vai pro candidato. Cards atrasados são destacados em vermelho com a quantidade de dias.
- Arquivo: `src/pages/Kanban.tsx`
- Drag-and-drop entre colunas vai na Fase 2 (precisa de persistência).

### Notificação de demandas atrasadas
Alerta no topo do Dashboard mostrando quantas demandas estão com prazo vencido e ainda não concluídas. Expansível pra ver detalhes (candidato, produto, descrição, dias de atraso).
- Arquivo: `src/components/dashboard/LateDemandsAlert.tsx`
- Só aparece se houver demandas atrasadas (some quando lista zera).

### Gráfico por estado (substitui o "mapa do Brasil")
Optei por barras horizontais coloridas (vermelho → amarelo → verde conforme % de conclusão) em vez do mapa SVG geográfico. Razões: (a) você só tem dados em ~8 estados, um mapa geográfico ficaria 80% vazio; (b) ranking por barras é mais legível pra ação ("onde estamos pior?"); (c) zero dependência extra. Se quiser mapa de verdade depois, troco em ~15min — só vale a pena se a quantidade de estados crescer muito.
- Arquivo: `src/components/dashboard/StatesProgressChart.tsx`

---

## 📁 Arquivos modificados

```
src/types/index.ts                          (filtros agora têm search, cities, states)
src/data/mockData.ts                        (convertStatus expandido)
src/context/DataContext.tsx                 (estado inicial dos filtros atualizado)
src/components/dashboard/CategoriesColumn.tsx  (usa getProgramLabel)
src/components/dashboard/FilterPanel.tsx    (search + cidade + estado)
src/components/layout/Header.tsx            (nav do Kanban)
src/pages/Dashboard.tsx                     (todos os filtros + timeline fix + novos widgets + export menu)
src/pages/CandidateDetail.tsx               (reescrito: limpo, timeline corrigida)
src/App.tsx                                 (rota /kanban)
package.json                                (dependência xlsx)
```

## 📁 Arquivos novos

```
src/utils/filters.ts                              (fonte única de filtragem)
src/utils/excelExport.ts                          (export Excel/CSV)
src/components/dashboard/RankingCard.tsx          (ranking)
src/components/dashboard/LateDemandsAlert.tsx     (alerta de atrasos)
src/components/dashboard/StatesProgressChart.tsx  (progresso por estado)
src/pages/Kanban.tsx                              (nova view)
```

---

## ▶️ Como rodar

```sh
cd top-leaders-dashboard-20-main
npm install
npm run dev
```

Foi validado: `tsc --noEmit` zero erros, `vite build` OK, `vitest run` passou.

---

## 🔜 Próxima fase: Supabase

Na Fase 2 vou entregar:

1. **Schema SQL** das tabelas (`candidates`, `products_services`, `demands`, `profiles`)
2. **Cliente Supabase** (`src/lib/supabase.ts`)
3. **DataContext refatorado** — em vez de `useState`, vai usar Supabase com React Query (já está instalado!)
4. **Auth real** — substitui o `ADMIN_PASSWORD = 'secomsptop'` hardcoded por login Supabase com role-based access
5. **Script de migração** — pega seu `realData.json` atual e empurra pro Supabase em 1 comando
6. **Drag-and-drop no Kanban** — com persistência funcional
7. **README atualizado** com setup do Supabase passo-a-passo

Pra Fase 2 você vai precisar criar uma conta gratuita em supabase.com (free tier sobra pra esse uso) e me passar:
- A URL do projeto (`https://xxx.supabase.co`)
- A `anon key` pública

Aí eu te dou o pacote pronto e você só roda a migração SQL no painel do Supabase.
