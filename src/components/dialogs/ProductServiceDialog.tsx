 import { useState, useEffect } from 'react';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { ProductService, Status } from '@/types';
 import { useData } from '@/context/DataContext';
 import { getStatusLabel } from '@/data/mockData';
 
 interface ProductServiceDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   candidateId: string;
   product?: ProductService;
 }
 
 const statuses: Status[] = ['not_started', 'in_progress', 'completed'];
 
 export function ProductServiceDialog({ open, onOpenChange, candidateId, product }: ProductServiceDialogProps) {
   const { addProductService, updateProductService } = useData();
   const [formData, setFormData] = useState({
     name: '',
     status: 'not_started' as Status,
     createdAt: new Date(),
     deliveryDate: null as Date | null,
   });
 
   useEffect(() => {
     if (product) {
       setFormData({
         name: product.name,
         status: product.status,
         createdAt: product.createdAt,
         deliveryDate: product.deliveryDate,
       });
     } else {
       setFormData({
         name: '',
         status: 'not_started',
         createdAt: new Date(),
         deliveryDate: null,
       });
     }
   }, [product, open]);
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (product) {
       updateProductService(candidateId, product.id, formData);
     } else {
       addProductService(candidateId, formData);
     }
     onOpenChange(false);
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-[425px]">
         <DialogHeader>
           <DialogTitle>{product ? 'Editar Produto/Serviço' : 'Novo Produto/Serviço'}</DialogTitle>
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
           </div>
           <DialogFooter>
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
               Cancelar
             </Button>
             <Button type="submit">
               {product ? 'Salvar' : 'Criar'}
             </Button>
           </DialogFooter>
         </form>
       </DialogContent>
     </Dialog>
   );
 }