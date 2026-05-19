 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Candidate, Program } from '@/types';
 import { useData } from '@/context/DataContext';
 import { getProgramLabel } from '@/data/mockData';
 
 interface CandidateDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   candidate?: Candidate;
 }
 
 const programs: Program[] = ['TL', 'TE', 'TM', 'TA'];
 
 export function CandidateDialog({ open, onOpenChange, candidate }: CandidateDialogProps) {
   const { addCandidate, updateCandidate } = useData();
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
         : [...prev.programs, program]
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
                 <Input
                   id="city"
                   value={formData.city}
                   onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                   required
                 />
               </div>
               <div className="space-y-2">
                 <Label htmlFor="state">Estado</Label>
                 <Input
                   id="state"
                   value={formData.state}
                   onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                   maxLength={2}
                   required
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