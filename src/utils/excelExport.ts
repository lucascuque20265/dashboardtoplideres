import * as XLSX from 'xlsx';
import { Candidate } from '@/types';
import { getProgramLabel, getStatusLabel, calculateCandidateProgress } from '@/data/mockData';
import { format } from 'date-fns';

/**
 * Achata os candidatos em linhas, uma por demanda — formato adequado para análise em planilha.
 */
function flattenForExport(candidates: Candidate[]): Record<string, string | number>[] {
  const rows: Record<string, string | number>[] = [];

  candidates.forEach(c => {
    const progress = calculateCandidateProgress(c);
    if (c.productsServices.length === 0) {
      rows.push({
        Candidato: c.name,
        Cidade: c.city,
        Estado: c.state,
        Programas: c.programs.map(getProgramLabel).join(', '),
        'Progresso Candidato (%)': progress,
        'Produto/Serviço': '',
        'Status Produto': '',
        Demanda: '',
        'Status Demanda': '',
        'Data Criação': '',
        'Data Entrega': '',
        Observações: '',
        Links: '',
      });
      return;
    }
    c.productsServices.forEach(p => {
      if (p.demands.length === 0) {
        rows.push({
          Candidato: c.name,
          Cidade: c.city,
          Estado: c.state,
          Programas: c.programs.map(getProgramLabel).join(', '),
          'Progresso Candidato (%)': progress,
          'Produto/Serviço': p.name,
          'Status Produto': getStatusLabel(p.status),
          Demanda: '',
          'Status Demanda': '',
          'Data Criação': p.createdAt ? format(p.createdAt, 'dd/MM/yyyy') : '',
          'Data Entrega': p.deliveryDate ? format(p.deliveryDate, 'dd/MM/yyyy') : '',
          Observações: '',
          Links: '',
        });
        return;
      }
      p.demands.forEach(d => {
        rows.push({
          Candidato: c.name,
          Cidade: c.city,
          Estado: c.state,
          Programas: c.programs.map(getProgramLabel).join(', '),
          'Progresso Candidato (%)': progress,
          'Produto/Serviço': p.name,
          'Status Produto': getStatusLabel(p.status),
          Demanda: d.description,
          'Status Demanda': getStatusLabel(d.status),
          'Data Criação': d.createdAt ? format(d.createdAt, 'dd/MM/yyyy') : '',
          'Data Entrega': d.deliveryDate ? format(d.deliveryDate, 'dd/MM/yyyy') : '',
          Observações: d.notes || '',
          Links: (d.links || []).join(' | '),
        });
      });
    });
  });

  return rows;
}

/**
 * Exporta candidatos para .xlsx — uma aba por dimensão (Demandas, Resumo).
 */
export function exportToExcel(candidates: Candidate[], filename = 'top-lideres-export') {
  const rows = flattenForExport(candidates);
  const summary = candidates.map(c => ({
    Candidato: c.name,
    Cidade: c.city,
    Estado: c.state,
    Programas: c.programs.map(getProgramLabel).join(', '),
    'Total Produtos/Serviços': c.productsServices.length,
    'Concluídos': c.productsServices.filter(p => p.status === 'completed').length,
    'Em Andamento': c.productsServices.filter(p => p.status === 'in_progress').length,
    'Não Iniciados': c.productsServices.filter(p => p.status === 'not_started').length,
    'Progresso (%)': calculateCandidateProgress(c),
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summary), 'Resumo');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Demandas');

  const dateStr = format(new Date(), 'yyyy-MM-dd');
  XLSX.writeFile(wb, `${filename}-${dateStr}.xlsx`);
}

/**
 * Exporta candidatos para .csv (formato achatado).
 */
export function exportToCSV(candidates: Candidate[], filename = 'top-lideres-export') {
  const rows = flattenForExport(candidates);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws, { FS: ';' }); // ; é mais amigável pro Excel BR

  // BOM UTF-8 pro Excel reconhecer acentos corretamente
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  link.href = url;
  link.setAttribute('download', `${filename}-${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
