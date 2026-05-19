 import { motion } from 'framer-motion';
 import { MapPin, ChevronRight } from 'lucide-react';
 import { Link } from 'react-router-dom';
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Progress } from '@/components/ui/progress';
 import { Candidate } from '@/types';
 import { calculateCandidateProgress, getProgramLabel } from '@/data/mockData';
 
 interface CandidateCardProps {
   candidate: Candidate;
   index: number;
 }
 
 export function CandidateCard({ candidate, index }: CandidateCardProps) {
   const progress = calculateCandidateProgress(candidate);
   const completedProducts = candidate.productsServices.filter(p => p.status === 'completed').length;
   const totalProducts = candidate.productsServices.length;

   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.3, delay: index * 0.05 }}
     >
       <Link to={`/candidates/${candidate.id}`}>
         <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
           <CardContent className="p-5">
             <div className="flex items-start justify-between gap-4">
               <div className="flex-1 min-w-0">
                 <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                   {candidate.name}
                 </h3>
                 <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                   <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                   <span className="truncate">{candidate.city}, {candidate.state}</span>
                 </div>
               </div>
               <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
             </div>
 
             <div className="flex flex-wrap gap-1.5 mt-3">
               {candidate.programs.map(program => (
                 <Badge key={program} variant="secondary" className="text-xs">
                   {program}
                 </Badge>
               ))}
             </div>
 
             <div className="mt-4 space-y-2">
               <div className="flex items-center justify-between text-sm">
                 <span className="text-muted-foreground">Progresso</span>
                 <span className="font-medium">{progress}%</span>
               </div>
               <Progress value={progress} className="h-2" />
               <p className="text-xs text-muted-foreground">
                 {completedProducts} de {totalProducts} produtos/serviços concluídos
               </p>
             </div>
           </CardContent>
         </Card>
       </Link>
     </motion.div>
   );
 }