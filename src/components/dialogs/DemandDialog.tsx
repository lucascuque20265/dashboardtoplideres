 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Textarea } from '@/components/ui/textarea';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Demand, Status } from '@/types';
 import { useData } from '@/context/DataContext';
 import { getStatusLabel } from '@/data/mockData';
import { AlertCircle, X, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface DemandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  productId: string;
  demand?: Demand;
}

const statuses: Status[] = ['not_started', 'in_progress', 'completed'];

export function DemandDialog({ open, onOpenChange, candidateId, productId, demand }: DemandDialogProps) {
  const { addDemand, updateDemand } = useData();
  const [formData, setFormData] = useState({
    description: '',
    status: 'not_started' as Status,
    createdAt: new Date(),
    deliveryDate: null as Date | null,
    notes: '',
    links: [] as string[],
  });
  const [newLink, setNewLink] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (demand) {
      setFormData({
        description: demand.description,
        status: demand.status,
        createdAt: demand.createdAt,
        deliveryDate: demand.deliveryDate,
        notes: demand.notes || '',
        links: demand.links || [],
      });
    } else {
      setFormData({
        description: '',
        status: 'not_started',
        createdAt: new Date(),
        deliveryDate: null,
        notes: '',
        links: [],
      });
    }
    setNewLink('');
    setErrors({});
  }, [demand, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddLink = () => {
    if (newLink.trim()) {
      // Validar URL
      try {
        new URL(newLink);
        setFormData({
          ...formData,
          links: [...formData.links, newLink],
        });
        setNewLink('');
      } catch {
        setErrors({ ...errors, link: 'URL inválida. Use http:// ou https://' });
      }
    }
  };

  const handleRemoveLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const data = {
      ...formData,
      notes: formData.notes || undefined,
      links: formData.links.length > 0 ? formData.links : undefined,
    };
    if (demand) {
      updateDemand(candidateId, productId, demand.id, data);
    } else {
      addDemand(candidateId, productId, data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>{demand ? 'Editar Demanda' : 'Nova Demanda'}</DialogTitle>
         </DialogHeader>
         <form onSubmit={handleSubmit}>
           <div className="grid gap-4 py-4">
           <div className="space-y-2">
               <Label htmlFor="description">
                 Descrição <span className="text-red-500">*</span>
               </Label>
               <Textarea
                 id="description"
                 value={formData.description}
                 onChange={(e) => {
                   setFormData({ ...formData, description: e.target.value });
                   if (errors.description) {
                     setErrors({ ...errors, description: '' });
                   }
                 }}
                 placeholder="Digite a descrição da demanda..."
                 rows={3}
                 className={errors.description ? 'border-red-500 focus:border-red-500' : ''}
               />
               {errors.description && (
                 <div className="flex items-center gap-2 text-red-500 text-sm">
                   <AlertCircle className="h-4 w-4" />
                   {errors.description}
                 </div>
               )}
             </div>
             <div className="space-y-2">
               <Label htmlFor="status">Status</Label>
               <Select
                 value={formData.status}
                 onValueChange={(value: Status) => setFormData({ ...formData, status: value })}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   {statuses.map(status => (
                     <SelectItem key={status} value={status}>
                       {getStatusLabel(status)}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <Label htmlFor="deliveryDate">Data de Entrega (opcional)</Label>
               <Input
                 id="deliveryDate"
                 type="date"
                 value={formData.deliveryDate ? formData.deliveryDate.toISOString().split('T')[0] : ''}
                 onChange={(e) => setFormData({
                   ...formData,
                   deliveryDate: e.target.value ? new Date(e.target.value) : null
                 })}
               />
             </div>
             <div className="space-y-2">
               <Label htmlFor="notes">Observações (opcional)</Label>
               <Textarea
                 id="notes"
                 value={formData.notes}
                 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                 placeholder="Digite observações adicionais..."
                 rows={2}
               />
             </div>

             {/* Links Section */}
             <div className="space-y-2 border-t pt-4">
               <Label className="flex items-center gap-2">
                 <LinkIcon className="h-4 w-4" />
                 Links Externos (opcional)
               </Label>
               <div className="flex gap-2">
                 <Input
                   value={newLink}
                   onChange={(e) => {
                     setNewLink(e.target.value);
                     if (errors.link) {
                       setErrors({ ...errors, link: '' });
                     }
                   }}
                   placeholder="https://exemplo.com"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       e.preventDefault();
                       handleAddLink();
                     }
                   }}
                 />
                 <Button
                   type="button"
                   variant="secondary"
                   onClick={handleAddLink}
                   className="whitespace-nowrap"
                 >
                   Adicionar
                 </Button>
               </div>
               {errors.link && (
                 <div className="flex items-center gap-2 text-red-500 text-sm">
                   <AlertCircle className="h-4 w-4" />
                   {errors.link}
                 </div>
               )}

               {/* List of Links */}
               {formData.links.length > 0 && (
                 <div className="space-y-2 mt-3">
                   <p className="text-sm font-medium text-slate-600">Links adicionados:</p>
                   <div className="space-y-1">
                     {formData.links.map((link, index) => (
                       <div
                         key={index}
                         className="flex items-start justify-between gap-2 p-2 bg-slate-100 rounded text-sm group overflow-hidden"
                       >
                         <a
                           href={link}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="flex items-start gap-2 text-blue-600 hover:text-blue-800 break-all flex-1 min-w-0"
                           title={link}
                         >
                           <ExternalLink className="h-3 w-3 flex-shrink-0 mt-0.5" />
                           <span className="break-words">{link}</span>
                         </a>
                         <button
                           type="button"
                           onClick={() => handleRemoveLink(index)}
                           className="text-slate-400 hover:text-red-600 transition-colors p-1 flex-shrink-0 opacity-0 group-hover:opacity-100"
                         >
                           <X className="h-4 w-4" />
                         </button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>
           </div>
           <DialogFooter>
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
               Cancelar
             </Button>
             <Button type="submit">
               {demand ? 'Salvar' : 'Criar'}
             </Button>
           </DialogFooter>
         </form>
       </DialogContent>
     </Dialog>
   );
 }