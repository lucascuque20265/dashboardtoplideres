 import { Calendar, ExternalLink, Pencil, Trash2 } from 'lucide-react';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import { Demand, Status } from '@/types';
 import { getStatusLabel } from '@/data/mockData';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 import { useData } from '@/context/DataContext';
 import { cn } from '@/lib/utils';
 
 interface DemandItemProps {
   demand: Demand;
   candidateId: string;
   productId: string;
   onEdit?: () => void;
 }
 
 const statusDotColors: Record<Status, string> = {
   not_started: 'bg-status-not-started',
   in_progress: 'bg-status-in-progress',
   completed: 'bg-status-completed',
 };
 
 export function DemandItem({ demand, candidateId, productId, onEdit }: DemandItemProps) {
   const { isAdmin, deleteDemand } = useData();
 
   return (
     <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
       <div className={cn("h-2 w-2 rounded-full mt-2 flex-shrink-0", statusDotColors[demand.status])} />
       <div className="flex-1 min-w-0">
         <p className="text-sm font-medium break-words">{demand.description}</p>
         <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
           <span className="flex items-center gap-1 whitespace-nowrap">
             <Calendar className="h-3 w-3" />
             Criado: {format(demand.createdAt, 'dd/MM/yy', { locale: ptBR })}
           </span>
           {demand.deliveryDate && (
             <span className="flex items-center gap-1 whitespace-nowrap">
               <Calendar className="h-3 w-3" />
               Entregue: {format(demand.deliveryDate, 'dd/MM/yy', { locale: ptBR })}
             </span>
           )}
           <Badge variant="outline" className="text-xs py-0">
             {getStatusLabel(demand.status)}
           </Badge>
         </div>
         {demand.notes && (
           <p className="text-xs text-muted-foreground mt-2 break-words">{demand.notes}</p>
         )}
         {demand.links && demand.links.length > 0 && (
           <div className="flex flex-wrap gap-2 mt-2">
             {demand.links.map((link, idx) => (
               <a
                 key={idx}
                 href={link}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-xs text-primary hover:underline flex items-center gap-1 break-all"
                 title={link}
               >
                 <ExternalLink className="h-3 w-3 flex-shrink-0" />
                 <span className="truncate max-w-xs">{link}</span>
               </a>
             ))}
           </div>
         )}
       </div>
       {isAdmin && (
         <div className="flex items-center gap-1">
           <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
             <Pencil className="h-3 w-3" />
           </Button>
           <Button
             variant="ghost"
             size="icon"
             className="h-7 w-7 text-destructive hover:text-destructive"
             onClick={() => deleteDemand(candidateId, productId, demand.id)}
           >
             <Trash2 className="h-3 w-3" />
           </Button>
         </div>
       )}
     </div>
   );
 }