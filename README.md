# Top Líderes – Dashboard

Dashboard de gestão de demandas, candidatos e líderes para o sistema **Top Líderes**.

## Tecnologias

- [Vite](https://vitejs.dev/)
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/)
- [TanStack Query](https://tanstack.com/query)
- [React Router v6](https://reactrouter.com/)

## Como executar localmente

```sh
# Clonar o repositório
git clone <URL_DO_REPOSITÓRIO>
cd dashboardtoplideres

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## Build para produção

```sh
npm run build
```

O output é gerado na pasta `dist/`.

## Deploy

Este projeto está configurado para deploy automático na **Vercel**.

## Estrutura de pastas

```
src/
  components/   # Componentes React
  context/      # Estado global (DataContext)
  data/         # Dados mock e reais
  hooks/        # Custom hooks
  lib/          # Utilitários
  pages/        # Páginas da aplicação
  types/        # Definições de tipos TypeScript
  utils/        # Funções utilitárias
```

- Tailwind CSS
