 import { useState } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { ChevronDown, ChevronUp, Calendar, Pencil, Trash2, Plus } from 'lucide-react';
 import { Card, CardContent, CardHeader } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Button } from '@/components/ui/button';
 import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
 } from '@/components/ui/alert-dialog';
 import { ProductService, Status } from '@/types';
 import { getStatusLabel } from '@/data/mockData';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 import { useData } from '@/context/DataContext';
 import { DemandItem } from './DemandItem';
 import { cn } from '@/lib/utils';
 
 interface ProductServiceCardProps {
   product: ProductService;
   candidateId: string;
   onEdit?: () => void;
   onAddDemand?: () => void;
   onEditDemand?: (demand: any) => void;
 }
 
 const statusColors: Record<Status, string> = {
   not_started: 'bg-status-not-started text-white',
   in_progress: 'bg-status-in-progress text-black',
   completed: 'bg-status-completed text-white',
 };
 
 export function ProductServiceCard({ product, candidateId, onEdit, onAddDemand, onEditDemand }: ProductServiceCardProps) {
   const [expanded, setExpanded] = useState(false);
   const [confirmOpen, setConfirmOpen] = useState(false);
   const { isAdmin, deleteProductService } = useData();
 
   const completedDemands = product.demands.filter(d => d.status === 'completed').length;
   const totalDemands = product.demands.length;
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
     >
       <Card className="overflow-hidden">
         <CardHeader 
           className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
           onClick={() => setExpanded(!expanded)}
         >
           <div className="flex items-start justify-between gap-3">
             <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 flex-wrap">
                 <h4 className="font-medium break-words">{product.name}</h4>
                 <Badge className={cn("text-xs flex-shrink-0", statusColors[product.status])}>
                   {getStatusLabel(product.status)}
                 </Badge>
               </div>
               <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                 <span className="flex items-center gap-1 whitespace-nowrap">
                   <Calendar className="h-3 w-3" />
                   Criado: {format(product.createdAt, 'dd/MM/yyyy', { locale: ptBR })}
                 </span>
                 {product.deliveryDate && (
                   <span className="flex items-center gap-1 whitespace-nowrap">
                     <Calendar className="h-3 w-3" />
                     Entregue: {format(product.deliveryDate, 'dd/MM/yyyy', { locale: ptBR })}
                   </span>
                 )}
               </div>
               <p className="text-xs text-muted-foreground mt-1">
                 {completedDemands} de {totalDemands} demandas concluídas
               </p>
             </div>
             <div className="flex items-center gap-2">
               {isAdmin && (
                 <>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8"
                     onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                   >
                     <Pencil className="h-4 w-4" />
                   </Button>
                   <Button
                     variant="ghost"
                     size="icon"
                     className="h-8 w-8 text-destructive hover:text-destructive"
                     onClick={(e) => { e.stopPropagation(); setConfirmOpen(true); }}
                   >
                     <Trash2 className="h-4 w-4" />
                   </Button>
                   <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                     <AlertDialogContent>
                       <AlertDialogHeader>
                         <AlertDialogTitle>Excluir produto/serviço?</AlertDialogTitle>
                         <AlertDialogDescription>
                           Esta ação não pode ser desfeita. O item <strong>{product.name}</strong> e todas as suas demandas serão removidos permanentemente.
                         </AlertDialogDescription>
                       </AlertDialogHeader>
                       <AlertDialogFooter>
                         <AlertDialogCancel>Cancelar</AlertDialogCancel>
                         <AlertDialogAction
                           className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                           onClick={() => deleteProductService(candidateId, product.id)}
                         >
                           Sim, excluir
                         </AlertDialogAction>
                       </AlertDialogFooter>
                     </AlertDialogContent>
                   </AlertDialog>
                 </>
               )}
               {expanded ? (
                 <ChevronUp className="h-5 w-5 text-muted-foreground" />
               ) : (
                 <ChevronDown className="h-5 w-5 text-muted-foreground" />
               )}
             </div>
           </div>
         </CardHeader>
 
         <AnimatePresence>
           {expanded && (
             <motion.div
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.2 }}
             >
               <CardContent className="pt-0 pb-4 px-4">
                 <div className="border-t pt-4">
                   <div className="flex items-center justify-between mb-3">
                     <h5 className="text-sm font-medium">Demandas</h5>
                     {isAdmin && (
                       <Button size="sm" variant="outline" onClick={onAddDemand}>
                         <Plus className="h-4 w-4 mr-1" />
                         Nova Demanda
                       </Button>
                     )}
                   </div>
                   <div className="space-y-2">
                     {product.demands.length === 0 ? (
                       <p className="text-sm text-muted-foreground text-center py-4">
                         Nenhuma demanda cadastrada
                       </p>
                     ) : (
                       product.demands.map(demand => (
                         <DemandItem
                           key={demand.id}
                           demand={demand}
                           candidateId={candidateId}
                           productId={product.id}
                           onEdit={() => onEditDemand?.(demand)}
                         />
                       ))
                     )}
                   </div>
                 </div>
               </CardContent>
             </motion.div>
           )}
         </AnimatePresence>
       </Card>
     </motion.div>
   );
 }