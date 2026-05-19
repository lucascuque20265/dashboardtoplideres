import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Candidate, Program } from '@/types';
import { Users } from 'lucide-react';
import { getProgramLabel } from '@/data/mockData';

interface CategoriesColumnProps {
  candidates: Candidate[];
  delay?: number;
}

// Cores por programa — labels vêm de getProgramLabel pra manter consistência única
const PROGRAM_STYLES: Record<Program, { color: string; bgColor: string }> = {
  TL: {
    color: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    bgColor: 'bg-blue-50',
  },
  TE: {
    color: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    bgColor: 'bg-purple-50',
  },
  TM: {
    color: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    bgColor: 'bg-pink-50',
  },
  TA: {
    color: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
    bgColor: 'bg-amber-50',
  },
};

export function CategoriesColumn({ candidates, delay = 0 }: CategoriesColumnProps) {
  const categories: Record<Program, Candidate[]> = {
    TL: [],
    TE: [],
    TM: [],
    TA: [],
  };

  // Distribuir candidatos nas categorias
  candidates.forEach(candidate => {
    candidate.programs.forEach(program => {
      if (!categories[program].find(c => c.id === candidate.id)) {
        categories[program].push(candidate);
      }
    });
  });

  // Ordenar alfabeticamente em cada categoria
  Object.keys(categories).forEach(key => {
    categories[key as Program].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  });

  const programs: Program[] = ['TL', 'TE', 'TM', 'TA'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {programs.map((program, index) => {
          const style = PROGRAM_STYLES[program];
          const categoryBadges = categories[program];
          const label = `${getProgramLabel(program)} (${program})`;

          return (
            <motion.div
              key={program}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: delay + index * 0.1 }}
            >
              <Card className={`h-full flex flex-col overflow-hidden ${style.bgColor}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {categoryBadges.length} {categoryBadges.length === 1 ? 'candidato' : 'candidatos'}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="space-y-2">
                      {categoryBadges.length > 0 ? (
                        categoryBadges.map((candidate) => (
                          <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link to={`/candidates/${candidate.id}`}>
                              <div
                                className={`${style.color} cursor-pointer block px-2.5 py-0.5 text-xs font-semibold rounded-full border border-transparent transition-colors hover:shadow-md hover:scale-105 transform duration-150`}
                                title={candidate.name}
                              >
                                <span className="truncate block">
                                  {candidate.name.split(' ').slice(0, 2).join(' ')}
                                </span>
                              </div>
                            </Link>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-8">
                          Nenhum candidato
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
