import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, X, Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useData } from '@/context/DataContext';
import { Program, Status } from '@/types';
import { getProgramLabel, getStatusLabel } from '@/data/mockData';
import { CITIES_BY_UF } from '@/data/brazilianLocations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const programs: Program[] = ['TL', 'TE', 'TM', 'TA'];
const statuses: Status[] = ['not_started', 'in_progress', 'completed'];

export function FilterPanel() {
  const { filters, setFilters } = useData();
  const [showFilters, setShowFilters] = useState(false);

  // Todos os estados disponíveis (UFs) ordenados
  const availableStates = useMemo(() => Object.keys(CITIES_BY_UF).sort(), []);

  // Cidades: todas as cidades dos estados selecionados (ou nenhuma se nenhum estado selecionado)
  const availableCities = useMemo(() => {
    if (filters.states.length === 0) return [];
    const citySet = new Set<string>();
    filters.states.forEach(uf => {
      (CITIES_BY_UF[uf] ?? []).forEach(city => citySet.add(city));
    });
    return Array.from(citySet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [filters.states]);

  const toggleProgram = (program: Program) => {
    const newPrograms = filters.programs.includes(program)
      ? filters.programs.filter(p => p !== program)
      : [...filters.programs, program];
    setFilters({ ...filters, programs: newPrograms });
  };

  const toggleStatus = (status: Status) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    setFilters({ ...filters, status: newStatus });
  };

  const toggleCity = (city: string) => {
    const newCities = filters.cities.includes(city)
      ? filters.cities.filter(c => c !== city)
      : [...filters.cities, city];
    setFilters({ ...filters, cities: newCities });
  };

  const toggleState = (state: string) => {
    const newStates = filters.states.includes(state)
      ? filters.states.filter(s => s !== state)
      : [...filters.states, state];
    setFilters({ ...filters, states: newStates });
  };

  const clearFilters = () => {
    setFilters({
      programs: [],
      status: [],
      dateRange: { start: null, end: null },
      search: '',
      cities: [],
      states: [],
    });
  };

  const activeFiltersCount =
    filters.programs.length +
    filters.status.length +
    filters.cities.length +
    filters.states.length +
    (filters.dateRange.start ? 1 : 0) +
    (filters.dateRange.end ? 1 : 0) +
    (filters.search.trim() ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search bar — sempre visível */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, cidade ou estado..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}

        {/* Active filter badges */}
        <div className="flex gap-1 flex-wrap">
          {filters.programs.map(program => (
            <Badge key={program} variant="secondary" className="gap-1">
              {getProgramLabel(program)}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => toggleProgram(program)}
              />
            </Badge>
          ))}
          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="gap-1">
              {getStatusLabel(status)}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => toggleStatus(status)}
              />
            </Badge>
          ))}
          {filters.states.map(state => (
            <Badge key={`st-${state}`} variant="secondary" className="gap-1">
              {state}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => toggleState(state)}
              />
            </Badge>
          ))}
          {filters.cities.map(city => (
            <Badge key={`ci-${city}`} variant="secondary" className="gap-1">
              {city}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => toggleCity(city)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Programs */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Programas</p>
                  <div className="flex flex-wrap gap-2">
                    {programs.map(program => (
                      <Button
                        key={program}
                        variant={filters.programs.includes(program) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleProgram(program)}
                      >
                        {program}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(status => (
                      <Button
                        key={status}
                        variant={filters.status.includes(status) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleStatus(status)}
                      >
                        {getStatusLabel(status)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Período</p>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 flex-1">
                          <Calendar className="h-4 w-4" />
                          {filters.dateRange.start
                            ? format(filters.dateRange.start, 'dd/MM/yy', { locale: ptBR })
                            : 'Início'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateRange.start || undefined}
                          onSelect={(date) =>
                            setFilters({
                              ...filters,
                              dateRange: { ...filters.dateRange, start: date || null },
                            })
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 flex-1">
                          <Calendar className="h-4 w-4" />
                          {filters.dateRange.end
                            ? format(filters.dateRange.end, 'dd/MM/yy', { locale: ptBR })
                            : 'Fim'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={filters.dateRange.end || undefined}
                          onSelect={(date) =>
                            setFilters({
                              ...filters,
                              dateRange: { ...filters.dateRange, end: date || null },
                            })
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Estados */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Estados</p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {availableStates.map(state => (
                      <Button
                        key={state}
                        variant={filters.states.includes(state) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleState(state)}
                      >
                        {state}
                      </Button>
                    ))}
                    {availableStates.length === 0 && (
                      <span className="text-xs text-muted-foreground">Nenhum estado</span>
                    )}
                  </div>
                </div>

                {/* Cidades */}
                <div className="space-y-2 lg:col-span-2">
                  <p className="text-sm font-medium">Cidades</p>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {availableCities.map(city => (
                      <Button
                        key={city}
                        variant={filters.cities.includes(city) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleCity(city)}
                      >
                        {city}
                      </Button>
                    ))}
                    {availableCities.length === 0 && (
                      <span className="text-xs text-muted-foreground">
                        {filters.states.length === 0
                          ? 'Selecione um estado para ver as cidades'
                          : 'Nenhuma cidade'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
