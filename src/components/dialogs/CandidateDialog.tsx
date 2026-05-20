 import { useState, useEffect, useRef, useMemo } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Candidate, Program } from '@/types';
 import { useData } from '@/context/DataContext';
 import { STATE_NAME_TO_UF, UF_TO_STATE_NAME, STATE_NAMES, CITIES_BY_UF } from '@/data/brazilianLocations';

 // ── Componente de input com sugestões ──────────────────────────────
 function AutocompleteInput({
   id, value, onChange, options, placeholder, required, disabled, showAllWhenEmpty,
 }: {
   id: string;
   value: string;
   onChange: (v: string) => void;
   options: string[];
   placeholder?: string;
   required?: boolean;
   disabled?: boolean;
   showAllWhenEmpty?: boolean;
 }) {
   const [open, setOpen] = useState(false);
   const ref = useRef<HTMLDivElement>(null);

   const filtered = useMemo(() => {
     if (disabled) return [];
     const q = value.trim().toLowerCase();
     if (!q) return showAllWhenEmpty ? options : options.slice(0, 10);
     return options.filter(o => o.toLowerCase().includes(q) && o.toLowerCase() !== q);
   }, [value, options, disabled, showAllWhenEmpty]);

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
   const [stateError, setStateError] = useState(false);

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
     setStateError(false);
   }, [candidate, open]);

   // Cidades do estado selecionado
   const citySuggestions = useMemo(() => {
     const uf = formData.state;
     if (!uf) return [];
     const base = CITIES_BY_UF[uf] || [];
     const fromDb = candidates.filter(c => c.state === uf && c.city).map(c => c.city);
     const set = new Set([...base, ...fromDb]);
     return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
   }, [formData.state, candidates]);

   const handleStateChange = (name: string) => {
     setStateDisplay(name);
     const uf = STATE_NAME_TO_UF[name] ?? '';
     setFormData(prev => ({ ...prev, state: uf, city: '' }));
     setStateError(name.trim() !== '' && uf === '');
   };

   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!formData.state) {
       setStateError(true);
       return;
     }
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
                 placeholder="Digite ou selecione o estado"
                 required
                 showAllWhenEmpty
               />
               {stateError && (
                 <p className="text-xs text-destructive">Selecione um estado válido da lista</p>
               )}
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
