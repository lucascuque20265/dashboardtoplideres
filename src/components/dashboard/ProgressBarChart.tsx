 import { motion } from 'framer-motion';
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 
 interface ProgressBarChartProps {
   data: { name: string; progress: number; color?: string }[];
   title: string;
   delay?: number;
 }
 
 export function ProgressBarChart({ data, title, delay = 0 }: ProgressBarChartProps) {
   const getBarColor = (progress: number) => {
     if (progress >= 75) return 'hsl(var(--status-completed))';
     if (progress >= 40) return 'hsl(var(--status-in-progress))';
     return 'hsl(var(--status-not-started))';
   };
 
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
               <BarChart
                 data={data}
                 layout="vertical"
                 margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
               >
                 <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                 <XAxis
                   type="number"
                   domain={[0, 100]}
                   tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                   tickFormatter={(value) => `${value}%`}
                 />
                 <YAxis
                   type="category"
                   dataKey="name"
                   tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                   width={100}
                 />
                 <Tooltip
                   formatter={(value: number) => [`${value}%`, 'Progresso']}
                   contentStyle={{
                     backgroundColor: 'hsl(var(--card))',
                     border: '1px solid hsl(var(--border))',
                     borderRadius: '8px',
                   }}
                 />
                 <Bar
                   dataKey="progress"
                   radius={[0, 4, 4, 0]}
                   animationBegin={delay * 1000}
                   animationDuration={800}
                 >
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={getBarColor(entry.progress)} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
         </CardContent>
       </Card>
     </motion.div>
   );
 }