 import { motion } from 'framer-motion';
 import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 
 interface StatusChartProps {
   data: { name: string; value: number; color: string }[];
   title: string;
   delay?: number;
 }
 
 export function StatusChart({ data, title, delay = 0 }: StatusChartProps) {
   const total = data.reduce((sum, item) => sum + item.value, 0);
 
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
           <div className="h-[240px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data}
                   cx="50%"
                   cy="50%"
                   innerRadius={50}
                   outerRadius={80}
                   paddingAngle={2}
                   dataKey="value"
                   animationBegin={delay * 1000}
                   animationDuration={800}
                 >
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip
                   formatter={(value: number) => [
                     `${value} (${((value / total) * 100).toFixed(1)}%)`,
                     ''
                   ]}
                   contentStyle={{
                     backgroundColor: 'hsl(var(--card))',
                     border: '1px solid hsl(var(--border))',
                     borderRadius: '8px',
                   }}
                 />
                 <Legend
                   verticalAlign="bottom"
                   height={36}
                   formatter={(value) => (
                     <span className="text-xs text-foreground">{value}</span>
                   )}
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>
         </CardContent>
       </Card>
     </motion.div>
   );
 }