 import { useState, useEffect, useRef, useMemo } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Candidate, Program } from '@/types';
 import { useData } from '@/context/DataContext';

 // ── Dados brasileiros ─────────────────────────────────────────────
 const STATE_NAME_TO_UF: Record<string, string> = {
   'Acre': 'AC', 'Alagoas': 'AL', 'Amazonas': 'AM', 'Amapá': 'AP',
   'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
   'Goiás': 'GO', 'Maranhão': 'MA', 'Minas Gerais': 'MG', 'Mato Grosso do Sul': 'MS',
   'Mato Grosso': 'MT', 'Pará': 'PA', 'Paraíba': 'PB', 'Pernambuco': 'PE',
   'Piauí': 'PI', 'Paraná': 'PR', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
   'Rondônia': 'RO', 'Roraima': 'RR', 'Rio Grande do Sul': 'RS', 'Santa Catarina': 'SC',
   'Sergipe': 'SE', 'São Paulo': 'SP', 'Tocantins': 'TO',
 };

 const UF_TO_STATE_NAME: Record<string, string> = Object.fromEntries(
   Object.entries(STATE_NAME_TO_UF).map(([name, uf]) => [uf, name])
 );

 const STATE_NAMES = Object.keys(STATE_NAME_TO_UF).sort((a, b) =>
   a.localeCompare(b, 'pt-BR')
 );

 const BASE_CITIES_BY_UF: Record<string, string[]> = {
   AC: ['Rio Branco', 'Cruzeiro do Sul'],
   AL: ['Maceió', 'Arapiraca'],
   AM: ['Manaus', 'Parintins'],
   AP: ['Macapá', 'Santana'],
   BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari'],
   CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'],
   DF: ['Brasília', 'Ceilândia', 'Taguatinga'],
   ES: ['Vitória', 'Vila Velha', 'Cariacica', 'Serra'],
   GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde'],
   MA: ['São Luís', 'Imperatriz', 'Timon'],
   MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Betim', 'Juiz de Fora', 'Montes Claros'],
   MS: ['Campo Grande', 'Dourados', 'Três Lagoas'],
   MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis'],
   PA: ['Belém', 'Ananindeua', 'Santarém', 'Marabá'],
   PB: ['João Pessoa', 'Campina Grande', 'Santa Rita'],
   PE: ['Recife', 'Caruaru', 'Olinda', 'Petrolina'],
   PI: ['Teresina', 'Parnaíba'],
   PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Foz do Iguaçu', 'Cascavel'],
   RJ: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói'],
   RN: ['Natal', 'Mossoró', 'Parnamirim'],
   RO: ['Porto Velho', 'Ji-Paraná'],
   RR: ['Boa Vista'],
   RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Gravataí', 'Sapiranga', 'Novo Hamburgo'],
   SC: ['Florianópolis', 'Joinville', 'Blumenau', 'Palhoça', 'Chapecó', 'Itajaí'],
   SE: ['Aracaju', 'Nossa Senhora do Socorro'],
   SP: ['São Paulo', 'Campinas', 'Guarulhos', 'Santos', 'Ribeirão Preto', 'Sorocaba', 'São José dos Campos',
       'Osasco', 'Carapicuíba', 'Cotia', 'Guarujá', 'Jacareí', 'Jaú', 'Jundiaí', 'Mogi das Cruzes',
       'Praia Grande', 'Sertãozinho', 'São Vicente', 'Bauru', 'Santo André', 'Piracicaba'],
   TO: ['Palmas', 'Araguaína'],
 };

 // ── Componente de input com sugestões ──────────────────────────────
 function AutocompleteInput({
   id, value, onChange, options, placeholder, required, disabled,
 }: {
   id: string;
   value: string;
   onChange: (v: string) => void;
   options: string[];
   placeholder?: string;
   required?: boolean;
   disabled?: boolean;
 }) {
   const [open, setOpen] = useState(false);
   const ref = useRef<HTMLDivElement>(null);

   const filtered = useMemo(() => {
     if (disabled) return [];
     const q = value.trim().toLowerCase();
     if (!q) return options.slice(0, 10);
     return options.filter(o => o.toLowerCase().includes(q) && o.toLowerCase() !== q);
   }, [value, options, disabled]);

   useEffect(() => {
     function onMouseDown(e: MouseEvent) {
       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
     }
     document.addEventListener('mousedown', onMouseDown);
     return () => document.removeEventListener('mousedown', onMouseDown);
   }, []);

   return (
     <div ref={ref} className="relative">
       <Input
         id={id}
         value={value}
         onChange={(e) => { onChange(e.target.value); setOpen(true); }}
         onFocus={() => !disabled && setOpen(true)}
         placeholder={placeholder}
         required={required}
         disabled={disabled}
         autoComplete="off"
       />
       {open && filtered.length > 0 && (
         <ul className="absolute z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md max-h-52 overflow-y-auto text-sm">
           {filtered.map(option => (
             <li
               key={option}
               className="px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground select-none"
               onMouseDown={(e) => { e.preventDefault(); onChange(option); setOpen(false); }}
             >
               {option}
             </li>
           ))}
         </ul>
       )}
     </div>
   );
 }

 // ── Dialog principal ────────────────────────────────────────────────
 interface CandidateDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   candidate?: Candidate;
 }

 const programs: Program[] = ['TL', 'TE', 'TM', 'TA'];

 export function CandidateDialog({ open, onOpenChange, candidate }: CandidateDialogProps) {
   const { addCandidate, updateCandidate, candidates } = useData();
   const [formData, setFormData] = useState({
     name: '',
     city: '',
     state: '', // armazena UF (ex: "SP")
     programs: [] as Program[],
   });
   const [stateDisplay, setStateDisplay] = useState('');

   useEffect(() => {
     if (candidate) {
       setFormData({
         name: candidate.name,
         city: candidate.city,
         state: candidate.state,
         programs: candidate.programs,
       });
       setStateDisplay(UF_TO_STATE_NAME[candidate.state] || candidate.state);
     } else {
       setFormData({ name: '', city: '', state: '', programs: [] });
       setStateDisplay('');
     }
   }, [candidate, open]);

   // Cidades do estado selecionado
   const citySuggestions = useMemo(() => {
     const uf = formData.state;
     if (!uf) return [];
     const base = BASE_CITIES_BY_UF[uf] || [];
     const fromDb = candidates.filter(c => c.state === uf && c.city).map(c => c.city);
     const set = new Set([...base, ...fromDb]);
     return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
   }, [formData.state, candidates]);

   const handleStateChange = (name: string) => {
     setStateDisplay(name);
     const uf = STATE_NAME_TO_UF[name] ?? '';
     setFormData(prev => ({ ...prev, state: uf, city: '' }));
   };

   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (candidate) {
       updateCandidate(candidate.id, formData);
     } else {
       addCandidate(formData);
     }
     onOpenChange(false);
   };

   const toggleProgram = (program: Program) => {
     setFormData(prev => ({
       ...prev,
       programs: prev.programs.includes(program)
         ? prev.programs.filter(p => p !== program)
         : [...prev.programs, program],
     }));
   };

   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
           <DialogTitle>{candidate ? 'Editar Candidato' : 'Novo Candidato'}</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit}>
           <div className="grid gap-4 py-4">
             <div className="space-y-2">
               <Label htmlFor="name">Nome</Label>
               <Input
                 id="name"
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 required
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="state">Estado</Label>
               <AutocompleteInput
                 id="state"
                 value={stateDisplay}
                 onChange={handleStateChange}
                 options={STATE_NAMES}
                 placeholder="Digite o nome do estado"
                 required
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="city">
                 Cidade
                 {!formData.state && (
                   <span className="ml-2 text-xs text-muted-foreground">— selecione o estado primeiro</span>
                 )}
               </Label>
               <AutocompleteInput
                 id="city"
                 value={formData.city}
                 onChange={(city) => setFormData(prev => ({ ...prev, city }))}
                 options={citySuggestions}
                 placeholder={formData.state ? 'Digite a cidade' : '—'}
                 disabled={!formData.state}
                 required
               />
             </div>
             <div className="space-y-2">
               <Label>Programas</Label>
               <div className="flex flex-wrap gap-4">
                 {programs.map(program => (
                   <div key={program} className="flex items-center space-x-2">
                     <Checkbox
                       id={`program-${program}`}
                       checked={formData.programs.includes(program)}
                       onCheckedChange={() => toggleProgram(program)}
                     />
                     <label
                       htmlFor={`program-${program}`}
                       className="text-sm font-medium leading-none cursor-pointer"
                     >
                       {program}
                     </label>
                   </div>
                 ))}
               </div>
             </div>
           </div>
           <DialogFooter>
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
               Cancelar
             </Button>
             <Button type="submit">
               {candidate ? 'Salvar' : 'Criar'}
             </Button>
           </DialogFooter>
         </form>
       </DialogContent>
     </Dialog>
   );
 }
