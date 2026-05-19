 import { useState, useEffect, useRef, useMemo } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Candidate, Program } from '@/types';
 import { useData } from '@/context/DataContext';

 // ── Dados base brasileiros ──────────────────────────────────────────
 const BR_STATES = [
   'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
   'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
   'RO','RR','RS','SC','SE','SP','TO',
 ];

 const BASE_CITY_STATE: Record<string, string> = {
   'Blumenau': 'SC', 'Carapicuiba': 'SP', 'Cotia': 'SP', 'Fortaleza': 'CE',
   'Goiania': 'GO', 'Gravataí': 'RS', 'Guarujá': 'SP', 'Jacareí': 'SP',
   'Jaú': 'SP', 'João Pessoa': 'PB', 'Juiz de Fora': 'MG', 'Jundiaí': 'SP',
   'Macapá': 'AP', 'Mogi das Cruzes': 'SP', 'Palhoça': 'SC', 'Praia Grande': 'SP',
   'Sapiranga': 'RS', 'Sertãozinho': 'SP', 'São Paulo': 'SP',
   'São Vicente': 'SP', 'Vitória': 'ES',
 };

 // ── Componente de input com sugestões ──────────────────────────────
 function AutocompleteInput({
   id, value, onChange, options, placeholder, maxLength, required, uppercase,
 }: {
   id: string;
   value: string;
   onChange: (v: string) => void;
   options: string[];
   placeholder?: string;
   maxLength?: number;
   required?: boolean;
   uppercase?: boolean;
 }) {
   const [open, setOpen] = useState(false);
   const ref = useRef<HTMLDivElement>(null);

   const filtered = value.trim().length > 0
     ? options.filter(o => o.toLowerCase().startsWith(value.toLowerCase()) && o.toLowerCase() !== value.toLowerCase())
     : [];

   useEffect(() => {
     function handleClick(e: MouseEvent) {
       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
     }
     document.addEventListener('mousedown', handleClick);
     return () => document.removeEventListener('mousedown', handleClick);
   }, []);

   return (
     <div ref={ref} className="relative">
       <Input
         id={id}
         value={value}
         onChange={(e) => {
           const v = uppercase ? e.target.value.toUpperCase() : e.target.value;
           onChange(v);
           setOpen(true);
         }}
         onFocus={() => setOpen(true)}
         placeholder={placeholder}
         maxLength={maxLength}
         required={required}
         autoComplete="off"
       />
       {open && filtered.length > 0 && (
         <ul className="absolute z-50 w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md max-h-48 overflow-y-auto text-sm">
           {filtered.slice(0, 8).map(option => (
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
     state: '',
     programs: [] as Program[],
   });

   useEffect(() => {
     if (candidate) {
       setFormData({
         name: candidate.name,
         city: candidate.city,
         state: candidate.state,
         programs: candidate.programs,
       });
     } else {
       setFormData({ name: '', city: '', state: '', programs: [] });
     }
   }, [candidate, open]);

   // Combina cidades dos candidatos existentes com a lista base
   const citySuggestions = useMemo(() => {
     const set = new Set([
       ...Object.keys(BASE_CITY_STATE),
       ...candidates.map(c => c.city).filter(Boolean),
     ]);
     return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'));
   }, [candidates]);

   // Mapa cidade → estado (existentes + base)
   const cityStateMap = useMemo(() => {
     const map: Record<string, string> = { ...BASE_CITY_STATE };
     candidates.forEach(c => { if (c.city && c.state) map[c.city] = c.state; });
     return map;
   }, [candidates]);

   const handleCityChange = (city: string) => {
     const autoState = cityStateMap[city];
     setFormData(prev => ({ ...prev, city, state: autoState ?? prev.state }));
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
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label htmlFor="city">Cidade</Label>
                 <AutocompleteInput
                   id="city"
                   value={formData.city}
                   onChange={handleCityChange}
                   options={citySuggestions}
                   placeholder="Digite a cidade"
                   required
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="state">Estado</Label>
                 <AutocompleteInput
                   id="state"
                   value={formData.state}
                   onChange={(v) => setFormData(prev => ({ ...prev, state: v }))}
                   options={BR_STATES}
                   placeholder="UF"
                   maxLength={2}
                   required
                   uppercase
                 />
               </div>
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
