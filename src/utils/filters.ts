import { Candidate, DashboardFilters } from '@/types';

/**
 * Aplica todos os filtros do dashboard aos candidatos.
 * Centraliza a lógica pra evitar divergência entre páginas.
 */
export function applyFilters(candidates: Candidate[], filters: DashboardFilters): Candidate[] {
  return candidates.filter(candidate => {
    // Programa: candidato precisa ter pelo menos 1 dos programas selecionados
    if (filters.programs.length > 0) {
      const hasProgram = candidate.programs.some(p => filters.programs.includes(p));
      if (!hasProgram) return false;
    }

    // Status: candidato precisa ter pelo menos 1 produto com algum dos status selecionados
    if (filters.status.length > 0) {
      const hasStatus = candidate.productsServices.some(p => filters.status.includes(p.status));
      if (!hasStatus) return false;
    }

    // Cidade
    if (filters.cities.length > 0) {
      if (!filters.cities.includes(candidate.city)) return false;
    }

    // Estado
    if (filters.states.length > 0) {
      if (!filters.states.includes(candidate.state)) return false;
    }

    // Período: candidato precisa ter pelo menos 1 demanda criada dentro da janela
    if (filters.dateRange.start || filters.dateRange.end) {
      const start = filters.dateRange.start ? filters.dateRange.start.getTime() : -Infinity;
      const end = filters.dateRange.end ? filters.dateRange.end.getTime() : Infinity;
      const hasDemandInRange = candidate.productsServices.some(p =>
        p.demands.some(d => {
          const t = d.createdAt.getTime();
          return t >= start && t <= end;
        })
      );
      if (!hasDemandInRange) return false;
    }

    // Busca textual: nome, cidade, estado ou programa
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const haystack = [
        candidate.name,
        candidate.city,
        candidate.state,
        ...candidate.programs,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
