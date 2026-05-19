import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ExternalLink, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { useData } from '@/context/DataContext';
import { Status } from '@/types';
import { getStatusLabel } from '@/data/mockData';
import { applyFilters } from '@/utils/filters';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const COLUMN_CONFIG: Record<Status, { headerColor: string; cardBg: string }> = {
  not_started: {
    headerColor: 'bg-slate-100 text-slate-700 border-slate-300',
    cardBg: 'bg-slate-50/50',
  },
  in_progress: {
    headerColor: 'bg-amber-100 text-amber-800 border-amber-300',
    cardBg: 'bg-amber-50/30',
  },
  completed: {
    headerColor: 'bg-green-100 text-green-800 border-green-300',
    cardBg: 'bg-green-50/30',
  },
};

const COLUMNS: Status[] = ['not_started', 'in_progress', 'completed'];

interface KanbanCardData {
  candidateId: string;
  candidateName: string;
  city: string;
  state: string;
  productName: string;
  demandId: string;
  demandDescription: string;
  status: Status;
  deliveryDate: Date | null;
  linkCount: number;
  isLate: boolean;
  daysLate: number;
}

export default function Kanban() {
  const { candidates, filters } = useData();

  const filtered = useMemo(() => applyFilters(candidates, filters), [candidates, filters]);

  const cardsByStatus = useMemo(() => {
    const buckets: Record<Status, KanbanCardData[]> = {
      not_started: [],
      in_progress: [],
      completed: [],
    };
    const today = new Date();

    filtered.forEach(c => {
      c.productsServices.forEach(p => {
        p.demands.forEach(d => {
          const isLate =
            d.status !== 'completed' && d.deliveryDate && d.deliveryDate.getTime() < today.getTime();
          buckets[d.status].push({
            candidateId: c.id,
            candidateName: c.name,
            city: c.city,
            state: c.state,
            productName: p.name,
            demandId: d.id,
            demandDescription: d.description,
            status: d.status,
            deliveryDate: d.deliveryDate,
            linkCount: (d.links || []).length,
            isLate: !!isLate,
            daysLate: isLate && d.deliveryDate ? differenceInDays(today, d.deliveryDate) : 0,
          });
        });
      });
    });

    // Ordenar: vencidos primeiro, depois por data
    Object.values(buckets).forEach(arr => {
      arr.sort((a, b) => {
        if (a.isLate !== b.isLate) return a.isLate ? -1 : 1;
        const ad = a.deliveryDate?.getTime() ?? Infinity;
        const bd = b.deliveryDate?.getTime() ?? Infinity;
        return ad - bd;
      });
    });

    return buckets;
  }, [filtered]);

  return (
    <div className="container py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Kanban de Demandas</h1>
        <p className="text-muted-foreground">
          Visão por status — clique em um card para abrir o candidato
        </p>
      </motion.div>

      <FilterPanel />

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((status, colIdx) => {
          const cards = cardsByStatus[status];
          const config = COLUMN_CONFIG[status];

          return (
            <motion.div
              key={status}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIdx * 0.1 }}
              className="flex flex-col"
            >
              <Card className={cn('border-2', config.cardBg)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>{getStatusLabel(status)}</span>
                    <Badge variant="outline" className={cn('font-semibold', config.headerColor)}>
                      {cards.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[600px] pr-3">
                    <div className="space-y-2">
                      {cards.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-12">
                          Nenhuma demanda nesta coluna
                        </p>
                      ) : (
                        cards.map(card => (
                          <Link
                            key={`${card.candidateId}-${card.demandId}`}
                            to={`/candidates/${card.candidateId}`}
                            className="block"
                          >
                            <Card
                              className={cn(
                                'hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer',
                                card.isLate && 'border-destructive/50'
                              )}
                            >
                              <CardContent className="p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium leading-tight line-clamp-2">
                                    {card.candidateName}
                                  </p>
                                  {card.isLate && (
                                    <Badge variant="destructive" className="gap-1 text-[10px] px-1.5 py-0 flex-shrink-0">
                                      <Clock className="h-2.5 w-2.5" />
                                      {card.daysLate}d
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  <span className="font-medium">{card.productName}:</span>{' '}
                                  {card.demandDescription}
                                </p>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t flex-wrap">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {card.city}/{card.state}
                                  </span>
                                  {card.deliveryDate && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {format(card.deliveryDate, 'dd/MM/yy', { locale: ptBR })}
                                    </span>
                                  )}
                                  {card.linkCount > 0 && (
                                    <span className="flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" />
                                      {card.linkCount}
                                    </span>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
