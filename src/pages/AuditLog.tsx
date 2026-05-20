import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AuditEntry {
  id: number;
  tabela: string;
  acao: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string | null;
  dados_antigos: Record<string, unknown> | null;
  dados_novos: Record<string, unknown> | null;
  user_id: string | null;
  user_email: string | null;
  criado_em: string;
}

const acaoBadge: Record<string, string> = {
  INSERT: 'bg-green-500/15 text-green-700 dark:text-green-400',
  UPDATE: 'bg-blue-500/15 text-blue-700 dark:text-blue-400',
  DELETE: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

const acaoLabel: Record<string, string> = {
  INSERT: 'Criação',
  UPDATE: 'Edição',
  DELETE: 'Exclusão',
};

const tabelaLabel: Record<string, string> = {
  candidates: 'Candidatos',
  products_services: 'Produtos/Serviços',
  demands: 'Demandas',
};

type AcaoFilter = 'ALL' | 'INSERT' | 'UPDATE' | 'DELETE';

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [acaoFilter, setAcaoFilter] = useState<AcaoFilter>('ALL');
  const [tabelaFilter, setTabelaFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('criado_em', { ascending: false })
      .limit(200);
    if (!error && data) setEntries(data as AuditEntry[]);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const toggleExpand = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = entries.filter(e => {
    if (acaoFilter !== 'ALL' && e.acao !== acaoFilter) return false;
    if (tabelaFilter !== 'ALL' && e.tabela !== tabelaFilter) return false;
    return true;
  });

  const tabelas = Array.from(new Set(entries.map(e => e.tabela)));

  return (
    <div className="container py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Log de Auditoria</h1>
              <p className="text-sm text-muted-foreground">
                Histórico de todas as alterações no sistema
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </motion.div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1">
          {(['ALL', 'INSERT', 'UPDATE', 'DELETE'] as AcaoFilter[]).map(a => (
            <Button
              key={a}
              size="sm"
              variant={acaoFilter === a ? 'default' : 'outline'}
              onClick={() => setAcaoFilter(a)}
            >
              {a === 'ALL' ? 'Todas' : acaoLabel[a]}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={tabelaFilter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setTabelaFilter('ALL')}
          >
            Todas as tabelas
          </Button>
          {tabelas.map(t => (
            <Button
              key={t}
              size="sm"
              variant={tabelaFilter === t ? 'default' : 'outline'}
              onClick={() => setTabelaFilter(t)}
            >
              {tabelaLabel[t] ?? t}
            </Button>
          ))}
        </div>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">
              Nenhum registro encontrado
            </p>
          ) : (
            <div className="divide-y">
              {filtered.map(entry => (
                <div key={entry.id}>
                  <button
                    className="w-full text-left px-6 py-4 hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpand(entry.id)}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-muted-foreground w-36 shrink-0">
                        {format(new Date(entry.criado_em), "dd/MM/yy HH:mm:ss", { locale: ptBR })}
                      </span>
                      <Badge className={cn('text-xs', acaoBadge[entry.acao])}>
                        {acaoLabel[entry.acao]}
                      </Badge>
                      <span className="text-sm font-medium">
                        {tabelaLabel[entry.tabela] ?? entry.tabela}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono truncate max-w-[160px]">
                        #{entry.record_id}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {entry.user_email ?? '—'}
                      </span>
                      {expanded.has(entry.id)
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      }
                    </div>
                  </button>

                  {expanded.has(entry.id) && (
                    <div className="px-6 pb-4 grid gap-3 sm:grid-cols-2 bg-muted/30">
                      {entry.dados_antigos && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Dados anteriores
                          </p>
                          <pre className="text-xs bg-background rounded-md p-3 overflow-x-auto border max-h-48">
                            {JSON.stringify(entry.dados_antigos, null, 2)}
                          </pre>
                        </div>
                      )}
                      {entry.dados_novos && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Dados novos
                          </p>
                          <pre className="text-xs bg-background rounded-md p-3 overflow-x-auto border max-h-48">
                            {JSON.stringify(entry.dados_novos, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
