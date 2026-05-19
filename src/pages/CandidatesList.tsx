 import { useState, useMemo } from 'react';
 import { motion } from 'framer-motion';
 import { Plus, Search } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { CandidateCard } from '@/components/candidates/CandidateCard';
 import { CandidateDialog } from '@/components/dialogs/CandidateDialog';
 import { useData } from '@/context/DataContext';
 
 export default function CandidatesList() {
   const { candidates, isAdmin } = useData();
   const [search, setSearch] = useState('');
   const [dialogOpen, setDialogOpen] = useState(false);
 
   const filteredCandidates = useMemo(() => {
     if (!search) return candidates;
     const searchLower = search.toLowerCase();
     return candidates.filter(c =>
       c.name.toLowerCase().includes(searchLower) ||
       c.city.toLowerCase().includes(searchLower) ||
       c.state.toLowerCase().includes(searchLower) ||
       c.programs.some(p => p.toLowerCase().includes(searchLower))
     );
   }, [candidates, search]);
 
   return (
     <div className="container py-6 space-y-6">
       <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
       >
         <div>
           <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Candidatos</h1>
           <p className="text-muted-foreground">{candidates.length} candidatos cadastrados</p>
         </div>
         {isAdmin && (
           <Button onClick={() => setDialogOpen(true)} className="gap-2">
             <Plus className="h-4 w-4" />
             Novo Candidato
           </Button>
         )}
       </motion.div>
 
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.1 }}
         className="relative"
       >
         <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
         <Input
           placeholder="Buscar por nome, cidade, estado ou programa..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="pl-10 max-w-md"
         />
       </motion.div>
 
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
         {filteredCandidates.map((candidate, index) => (
           <CandidateCard key={candidate.id} candidate={candidate} index={index} />
         ))}
       </div>
 
       {filteredCandidates.length === 0 && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="text-center py-12"
         >
           <p className="text-muted-foreground">
             {search ? 'Nenhum candidato encontrado para esta busca.' : 'Nenhum candidato cadastrado.'}
           </p>
         </motion.div>
       )}
 
       <CandidateDialog open={dialogOpen} onOpenChange={setDialogOpen} />
     </div>
   );
 }