import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Candidate } from '@/types';

interface StatesProgressChartProps {
  candidates: Candidate[];
  delay?: number;
}

// Heatmap: do vermelho (0%) ao verde (100%)
function progressColor(pct: number): string {
  if (pct >= 75) return 'hsl(142, 71%, 45%)';
  if (pct >= 50) return 'hsl(85, 65%, 50%)';
  if (pct >= 25) return 'hsl(45, 90%, 55%)';
  return 'hsl(0, 75%, 60%)';
}

export function StatesProgressChart({ candidates, delay = 0 }: StatesProgressChartProps) {
  const data = useMemo(() => {
    const byState: Record<string, { total: number; completed: number; candidates: number }> = {};

    candidates.forEach(c => {
      const st = c.state || 'N/D';
      if (!byState[st]) {
        byState[st] = { total: 0, completed: 0, candidates: 0 };
      }
      byState[st].candidates++;
      c.productsServices.forEach(p => {
        byState[st].total++;
        if (p.status === 'completed') byState[st].completed++;
      });
    });

    return Object.entries(byState)
      .map(([state, v]) => ({
        state,
        candidates: v.candidates,
        total: v.total,
        completed: v.completed,
        percentage: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [candidates]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Progresso por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              Sem dados para exibir.
            </p>
          ) : (
            <div style={{ height: Math.max(220, data.length * 32) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  layout="vertical"
                  margin={{ top: 5, right: 50, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="state"
                    width={50}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(_: number, _name: string, props: { payload?: { percentage: number; completed: number; total: number; candidates: number } }) => {
                      const p = props.payload;
                      if (!p) return ['', ''];
                      return [
                        `${p.percentage}% (${p.completed}/${p.total} entregas | ${p.candidates} candidatos)`,
                        'Conclusão',
                      ];
                    }}
                  />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]} label={{ position: 'right', formatter: (v: number) => `${v}%`, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}>
                    {data.map((entry) => (
                      <Cell key={entry.state} fill={progressColor(entry.percentage)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
