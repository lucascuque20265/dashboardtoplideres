import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Candidate, Demand } from '@/types';
import { differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LateDemandsAlertProps {
  candidates: Candidate[];
  delay?: number;
}

interface LateItem {
  candidateId: string;
  candidateName: string;
  productName: string;
  demand: Demand;
  daysLate: number;
}

export function LateDemandsAlert({ candidates, delay = 0 }: LateDemandsAlertProps) {
  const [expanded, setExpanded] = useState(false);

  const lateItems = useMemo<LateItem[]>(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const result: LateItem[] = [];

    candidates.forEach(c => {
      c.productsServices.forEach(p => {
        p.demands.forEach(d => {
          if (d.status === 'completed') return;
          if (!d.deliveryDate) return;
          const due = new Date(d.deliveryDate);
          if (due.getTime() < today.getTime()) {
            result.push({
              candidateId: c.id,
              candidateName: c.name,
              productName: p.name,
              demand: d,
              daysLate: differenceInDays(today, due),
            });
          }
        });
      });
    });

    return result.sort((a, b) => b.daysLate - a.daysLate);
  }, [candidates]);

  if (lateItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Alert className="border-destructive/50 bg-destructive/5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertTitle className="text-destructive flex items-center justify-between">
          <span>
            {lateItems.length} {lateItems.length === 1 ? 'demanda atrasada' : 'demandas atrasadas'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {expanded ? (
              <>
                Ocultar <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Ver detalhes <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </AlertTitle>
        <AlertDescription>
          <p className="text-sm mb-2">
            Demandas com data de entrega vencida que ainda não foram concluídas.
          </p>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 space-y-2 max-h-[300px] overflow-y-auto"
            >
              {lateItems.map((item) => (
                <Link
                  key={`${item.candidateId}-${item.demand.id}`}
                  to={`/candidates/${item.candidateId}`}
                  className="block p-3 bg-card rounded-md border hover:border-destructive/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.candidateName}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.productName}</p>
                      <p className="text-xs mt-1 line-clamp-2">{item.demand.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge variant="destructive" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {item.daysLate}d
                      </Badge>
                      {item.demand.deliveryDate && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(item.demand.deliveryDate, 'dd/MM/yy', { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
