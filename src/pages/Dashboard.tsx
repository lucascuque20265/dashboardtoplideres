import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ClipboardList,
  Package,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KPICard } from '@/components/dashboard/KPICard';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { ProgressBarChart } from '@/components/dashboard/ProgressBarChart';
import { TimelineChart } from '@/components/dashboard/TimelineChart';
import { CategoriesColumn } from '@/components/dashboard/CategoriesColumn';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { RankingCard } from '@/components/dashboard/RankingCard';
import { LateDemandsAlert } from '@/components/dashboard/LateDemandsAlert';
import { StatesProgressChart } from '@/components/dashboard/StatesProgressChart';
import { useData } from '@/context/DataContext';
import { calculateCandidateProgress } from '@/data/mockData';
import { generateGlobalReport } from '@/utils/pdfExport';
import { exportToExcel, exportToCSV } from '@/utils/excelExport';
import { applyFilters } from '@/utils/filters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { candidates, filters } = useData();

  // Aplica TODOS os filtros (programa, status, datas, cidade, estado, busca)
  const filteredCandidates = useMemo(
    () => applyFilters(candidates, filters),
    [candidates, filters]
  );

  const kpis = useMemo(() => {
    const totalCandidates = filteredCandidates.length;
    const allProducts = filteredCandidates.flatMap(c => c.productsServices);
    const totalProductsServices = allProducts.length;
    const totalDemands = allProducts.reduce((sum, p) => sum + p.demands.length, 0);
    const completedProducts = allProducts.filter(p => p.status === 'completed').length;
    const completionPercentage =
      totalProductsServices > 0 ? Math.round((completedProducts / totalProductsServices) * 100) : 0;

    return { totalCandidates, totalDemands, totalProductsServices, completionPercentage };
  }, [filteredCandidates]);

  const statusChartData = useMemo(() => {
    const allProducts = filteredCandidates.flatMap(c => c.productsServices);
    return [
      {
        name: 'Concluídos',
        value: allProducts.filter(p => p.status === 'completed').length,
        color: 'hsl(var(--status-completed))',
      },
      {
        name: 'Em Andamento',
        value: allProducts.filter(p => p.status === 'in_progress').length,
        color: 'hsl(var(--status-in-progress))',
      },
      {
        name: 'Não Iniciados',
        value: allProducts.filter(p => p.status === 'not_started').length,
        color: 'hsl(var(--status-not-started))',
      },
    ];
  }, [filteredCandidates]);

  const progressBarData = useMemo(() => {
    return filteredCandidates
      .map(c => ({
        name: c.name.split(' ').slice(0, 2).join(' '),
        progress: calculateCandidateProgress(c),
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 8);
  }, [filteredCandidates]);

  // Timeline corrigida: usa ano+mês (chave estável) + ordena cronologicamente
  const timelineData = useMemo(() => {
    const allDemands = filteredCandidates.flatMap(c =>
      c.productsServices.flatMap(p => p.demands)
    );

    const buckets: Record<string, { sortKey: string; label: string; created: number; delivered: number }> = {};

    const bucketFor = (d: Date) => {
      const sortKey = format(d, 'yyyy-MM'); // chave de ordenação único por mês/ano
      const label = format(d, 'MMM/yy', { locale: ptBR });
      if (!buckets[sortKey]) {
        buckets[sortKey] = { sortKey, label, created: 0, delivered: 0 };
      }
      return buckets[sortKey];
    };

    allDemands.forEach(demand => {
      if (demand.createdAt) {
        bucketFor(demand.createdAt).created++;
      }
      if (demand.deliveryDate) {
        bucketFor(demand.deliveryDate).delivered++;
      }
    });

    return Object.values(buckets)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ label, created, delivered }) => ({ date: label, created, delivered }));
  }, [filteredCandidates]);

  const handleExportGlobalPdf = () => {
    generateGlobalReport(filteredCandidates, kpis);
  };

  return (
    <div className="container py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral de todos os candidatos e demandas</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Exportar
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportGlobalPdf} className="gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToExcel(filteredCandidates)} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Excel (.xlsx)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportToCSV(filteredCandidates)} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <FilterPanel />

      {/* Alerta de demandas atrasadas */}
      <LateDemandsAlert candidates={filteredCandidates} />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total de Candidatos" value={kpis.totalCandidates} icon={Users} delay={0} />
        <KPICard title="Total de Demandas" value={kpis.totalDemands} icon={ClipboardList} delay={0.1} />
        <KPICard title="Produtos/Serviços" value={kpis.totalProductsServices} icon={Package} delay={0.2} />
        <KPICard title="Taxa de Conclusão" value={`${kpis.completionPercentage}%`} icon={TrendingUp} delay={0.3} />
      </div>

      {/* Categories Column */}
      <CategoriesColumn candidates={filteredCandidates} delay={0.35} />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StatusChart data={statusChartData} title="Distribuição de Status" delay={0.4} />
        <ProgressBarChart data={progressBarData} title="Progresso por Candidato" delay={0.5} />
      </div>

      {/* Ranking + Estados */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RankingCard candidates={filteredCandidates} delay={0.55} />
        <StatesProgressChart candidates={filteredCandidates} delay={0.6} />
      </div>

      <TimelineChart
        data={timelineData}
        title="Timeline de Demandas (Criação vs Entrega)"
        delay={0.65}
      />
    </div>
  );
}
