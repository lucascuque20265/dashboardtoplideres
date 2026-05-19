 import { motion } from 'framer-motion';
 import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 
 interface TimelineChartProps {
   data: { date: string; created: number; delivered: number }[];
   title: string;
   delay?: number;
 }
 
 export function TimelineChart({ data, title, delay = 0 }: TimelineChartProps) {
   return (
     <motion.div
       initial={{ opacity: 0, scale: 0.95 }}
       animate={{ opacity: 1, scale: 1 }}
       transition={{ duration: 0.4, delay }}
     >
       <Card className="h-full">
         <CardHeader className="pb-2">
           <CardTitle className="text-base font-medium">{title}</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart
                 data={data}
                 margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
               >
                 <defs>
                   <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                 <XAxis
                   dataKey="date"
                   tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                 />
                 <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                 <Tooltip
                   contentStyle={{
                     backgroundColor: 'hsl(var(--card))',
                     border: '1px solid hsl(var(--border))',
                     borderRadius: '8px',
                   }}
                 />
                 <Legend />
                 <Area
                   type="monotone"
                   dataKey="created"
                   name="Criadas"
                   stroke="hsl(var(--chart-1))"
                   fillOpacity={1}
                   fill="url(#colorCreated)"
                   animationBegin={delay * 1000}
                   animationDuration={800}
                 />
                 <Area
                   type="monotone"
                   dataKey="delivered"
                   name="Entregues"
                   stroke="hsl(var(--chart-2))"
                   fillOpacity={1}
                   fill="url(#colorDelivered)"
                   animationBegin={delay * 1000}
                   animationDuration={800}
                 />
               </AreaChart>
             </ResponsiveContainer>
           </div>
         </CardContent>
       </Card>
     </motion.div>
   );
 }