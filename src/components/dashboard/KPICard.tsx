 import { motion } from 'framer-motion';
 import { Card, CardContent } from '@/components/ui/card';
 import { cn } from '@/lib/utils';
 import { LucideIcon } from 'lucide-react';
 
 interface KPICardProps {
   title: string;
   value: number | string;
   subtitle?: string;
   icon: LucideIcon;
   trend?: {
     value: number;
     isPositive: boolean;
   };
   delay?: number;
 }
 
 export function KPICard({ title, value, subtitle, icon: Icon, trend, delay = 0 }: KPICardProps) {
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.4, delay }}
     >
       <Card className="overflow-hidden">
         <CardContent className="p-6">
           <div className="flex items-start justify-between">
             <div className="space-y-2">
               <p className="text-sm font-medium text-muted-foreground">{title}</p>
               <motion.p
                 className="text-3xl font-bold tracking-tight"
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.5, delay: delay + 0.2 }}
               >
                 {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
               </motion.p>
               {subtitle && (
                 <p className="text-xs text-muted-foreground">{subtitle}</p>
               )}
               {trend && (
                 <p className={cn(
                   "text-xs font-medium",
                   trend.isPositive ? "text-status-completed" : "text-destructive"
                 )}>
                   {trend.isPositive ? '+' : ''}{trend.value}% vs. mês anterior
                 </p>
               )}
             </div>
             <div className="rounded-lg bg-primary/10 p-3">
               <Icon className="h-6 w-6 text-primary" />
             </div>
           </div>
         </CardContent>
       </Card>
     </motion.div>
   );
 }