import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Candidate } from '@/types';
import { calculateCandidateProgress } from '@/data/mockData';

interface RankingCardProps {
  candidates: Candidate[];
  title?: string;
  limit?: number;
  delay?: number;
}

export function RankingCard({
  candidates,
  title = 'Ranking de Candidatos',
  limit = 10,
  delay = 0,
}: RankingCardProps) {
  const ranked = candidates
    .map(c => ({ candidate: c, progress: calculateCandidateProgress(c) }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit);

  const podiumIcon = (position: number) => {
    if (position === 0) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (position === 1) return <Medal className="h-4 w-4 text-slate-400" />;
    if (position === 2) return <Award className="h-4 w-4 text-amber-700" />;
    return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{position + 1}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[320px] pr-3">
            <div className="space-y-3">
              {ranked.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum candidato no filtro atual
                </p>
              ) : (
                ranked.map(({ candidate, progress }, idx) => (
                  <Link
                    key={candidate.id}
                    to={`/candidates/${candidate.id}`}
                    className="block group"
                  >
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-center w-6 flex-shrink-0">
                        {podiumIcon(idx)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-medium truncate group-hover:text-primary">
                            {candidate.name}
                          </span>
                          <span className="text-xs font-bold tabular-nums flex-shrink-0">
                            {progress}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {candidate.city}, {candidate.state}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
