import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Estado {
  uf: string;
  nome: string;
}

// Cache em nível de módulo — compartilhado entre todas as instâncias, limpo ao recarregar a página
let statesCache: Estado[] | null = null;
const citiesCache: Record<string, string[]> = {};

/**
 * Busca os 27 estados do Supabase (tabela `estados`).
 * Resultado fica em cache após a primeira requisição.
 */
export function useStates() {
  const [states, setStates] = useState<Estado[]>(statesCache ?? []);
  const [loading, setLoading] = useState(statesCache === null);

  useEffect(() => {
    if (statesCache !== null) {
      setStates(statesCache);
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('estados')
      .select('uf, nome')
      .order('uf')
      .then(({ data, error }) => {
        if (!error && data) {
          statesCache = data as Estado[];
          setStates(statesCache);
        }
        setLoading(false);
      });
  }, []);

  return { states, loading };
}

/**
 * Busca cidades do Supabase (tabela `municipios`) para as UFs fornecidas.
 * Cada UF é cacheada individualmente após a primeira busca.
 */
export function useCities(ufs: string[]) {
  const sortedKey = [...ufs].sort().join(',');

  const [citiesByUF, setCitiesByUF] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    ufs.forEach(uf => {
      if (citiesCache[uf]) initial[uf] = citiesCache[uf];
    });
    return initial;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUFs = sortedKey ? sortedKey.split(',') : [];

    if (currentUFs.length === 0) {
      setCitiesByUF({});
      return;
    }

    const missing = currentUFs.filter(uf => !citiesCache[uf]);

    if (missing.length === 0) {
      const result: Record<string, string[]> = {};
      currentUFs.forEach(uf => { result[uf] = citiesCache[uf] ?? []; });
      setCitiesByUF(result);
      return;
    }

    setLoading(true);
    supabase
      .from('municipios')
      .select('nome, uf')
      .in('uf', missing)
      .order('nome')
      .then(({ data, error }) => {
        if (!error && data) {
          missing.forEach(uf => {
            citiesCache[uf] = (data as { nome: string; uf: string }[])
              .filter(r => r.uf === uf)
              .map(r => r.nome);
          });
        }
        const result: Record<string, string[]> = {};
        currentUFs.forEach(uf => { result[uf] = citiesCache[uf] ?? []; });
        setCitiesByUF(result);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedKey]);

  return { citiesByUF, loading };
}
