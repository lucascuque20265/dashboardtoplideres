 import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
 import { Candidate, ProductService, Demand, Program, Status, DashboardFilters } from '@/types';
 import { supabase } from '@/lib/supabase';
 import { toast } from 'sonner';
 import type { User } from '@supabase/supabase-js';
 
 // ── Tipos das linhas do banco (snake_case) ──────────────────────────
 interface DBDemand {
   id: string;
   product_service_id: string;
   description: string;
   status: string;
   created_at: string;
   delivery_date: string | null;
   notes: string | null;
   links: string[] | null;
 }
 
 interface DBProductService {
   id: string;
   candidate_id: string;
   name: string;
   status: string;
   created_at: string;
   delivery_date: string | null;
   demands?: DBDemand[];
 }
 
 interface DBCandidate {
   id: string;
   name: string;
   city: string;
   state: string;
   programs: string[];
   products_services?: DBProductService[];
 }
 
 // ── Mappers DB → TypeScript ─────────────────────────────────────────
 function mapDemand(d: DBDemand): Demand {
   return {
     id: d.id,
     description: d.description,
     status: d.status as Status,
     createdAt: new Date(d.created_at),
     deliveryDate: d.delivery_date ? new Date(d.delivery_date) : null,
     notes: d.notes ?? undefined,
     links: d.links ?? [],
   };
 }
 
 function mapProductService(p: DBProductService): ProductService {
   return {
     id: p.id,
     name: p.name,
     status: p.status as Status,
     createdAt: new Date(p.created_at),
     deliveryDate: p.delivery_date ? new Date(p.delivery_date) : null,
     demands: (p.demands ?? []).map(mapDemand),
   };
 }
 
 function mapCandidate(c: DBCandidate): Candidate {
   return {
     id: c.id,
     name: c.name,
     city: c.city,
     state: c.state,
     programs: c.programs as Program[],
     productsServices: (c.products_services ?? []).map(mapProductService),
   };
 }
 
 // ── Busca todos os candidatos com dados aninhados ───────────────────
 async function fetchAllCandidates(): Promise<Candidate[]> {
   const { data, error } = await supabase
     .from('candidates')
     .select(`
       id, name, city, state, programs,
       products_services (
         id, candidate_id, name, status, created_at, delivery_date,
         demands (
           id, product_service_id, description, status, created_at, delivery_date, notes, links
         )
       )
     `)
     .order('name');
 
   if (error) throw error;
   return (data ?? []).map(mapCandidate);
 }
 
 // ── Interface do contexto ───────────────────────────────────────────
 interface DataContextType {
   candidates: Candidate[];
   isLoading: boolean;
   authLoading: boolean;
   user: User | null;
   filters: DashboardFilters;
   isAdmin: boolean;
   signIn: (email: string, password: string) => Promise<{ error: string | null }>;
   signInWithGoogle: () => Promise<void>;
   signOut: () => Promise<void>;
   setFilters: (filters: DashboardFilters) => void;
   addCandidate: (candidate: Omit<Candidate, 'id' | 'productsServices'>) => void;
   updateCandidate: (id: string, data: Partial<Candidate>) => void;
   deleteCandidate: (id: string) => void;
   addProductService: (candidateId: string, product: Omit<ProductService, 'id' | 'demands'>) => void;
   updateProductService: (candidateId: string, productId: string, data: Partial<ProductService>) => void;
   deleteProductService: (candidateId: string, productId: string) => void;
   addDemand: (candidateId: string, productId: string, demand: Omit<Demand, 'id'>) => void;
   updateDemand: (candidateId: string, productId: string, demandId: string, data: Partial<Demand>) => void;
   deleteDemand: (candidateId: string, productId: string, demandId: string) => void;
 }
 
 const DataContext = createContext<DataContextType | undefined>(undefined);
 
 export function DataProvider({ children }: { children: React.ReactNode }) {
   const [candidates, setCandidates] = useState<Candidate[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [user, setUser] = useState<User | null>(null);
   const [authLoading, setAuthLoading] = useState(true);
   const [filters, setFilters] = useState<DashboardFilters>({
     programs: [],
     status: [],
     dateRange: { start: null, end: null },
     search: '',
     cities: [],
     states: [],
   });

   const isAdmin = !!user;

   // Verifica sessão Supabase Auth
   useEffect(() => {
     supabase.auth.getSession().then(({ data: { session } }) => {
       setUser(session?.user ?? null);
       setAuthLoading(false);
     });
     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       setUser(session?.user ?? null);
     });
     return () => subscription.unsubscribe();
   }, []);

   // Carrega dados quando o usuário autentica
   useEffect(() => {
     if (!user) {
       setCandidates([]);
       setIsLoading(false);
       return;
     }
     setIsLoading(true);
     fetchAllCandidates()
       .then(setCandidates)
       .catch(() => {
         toast.error('Erro ao carregar dados', {
           description: 'Não foi possível conectar ao banco de dados.',
         });
       })
       .finally(() => setIsLoading(false));
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [user?.id]);

   const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
     const { error } = await supabase.auth.signInWithPassword({ email, password });
     return { error: error?.message ?? null };
   };

   const signInWithGoogle = async () => {
     await supabase.auth.signInWithOAuth({
       provider: 'google',
       options: { redirectTo: window.location.origin },
     });
   };

   const signOut = async () => {
     await supabase.auth.signOut();
   };
 
   // ── Candidatos ──────────────────────────────────────────────────
   const addCandidate = useCallback((candidate: Omit<Candidate, 'id' | 'productsServices'>) => {
     supabase
       .from('candidates')
       .insert({
         name: candidate.name,
         city: candidate.city,
         state: candidate.state,
         programs: candidate.programs,
       })
       .select('id, name, city, state, programs')
       .single()
       .then(({ data, error }) => {
         if (error || !data) {
           toast.error('Erro ao adicionar candidato');
           return;
         }
         setCandidates(prev => [...prev, mapCandidate({ ...data, products_services: [] })]);
       });
   }, []);
 
   const updateCandidate = useCallback((id: string, data: Partial<Candidate>) => {
     // Atualiza otimisticamente
     setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
 
     const dbData: Record<string, unknown> = {};
     if (data.name !== undefined) dbData.name = data.name;
     if (data.city !== undefined) dbData.city = data.city;
     if (data.state !== undefined) dbData.state = data.state;
     if (data.programs !== undefined) dbData.programs = data.programs;
 
     supabase.from('candidates').update(dbData).eq('id', id).then(({ error }) => {
       if (error) toast.error('Erro ao atualizar candidato');
     });
   }, []);
 
   const deleteCandidate = useCallback((id: string) => {
     setCandidates(prev => prev.filter(c => c.id !== id));
     supabase.from('candidates').delete().eq('id', id).then(({ error }) => {
       if (error) toast.error('Erro ao excluir candidato');
     });
   }, []);
 
   // ── Produtos / Serviços ─────────────────────────────────────────
   const addProductService = useCallback((candidateId: string, product: Omit<ProductService, 'id' | 'demands'>) => {
     supabase
       .from('products_services')
       .insert({
         candidate_id: candidateId,
         name: product.name,
         status: product.status,
         created_at: product.createdAt.toISOString(),
         delivery_date: product.deliveryDate?.toISOString() ?? null,
       })
       .select('id, candidate_id, name, status, created_at, delivery_date')
       .single()
       .then(({ data, error }) => {
         if (error || !data) {
           toast.error('Erro ao adicionar produto/serviço');
           return;
         }
         setCandidates(prev => prev.map(c => {
           if (c.id === candidateId) {
             return {
               ...c,
               productsServices: [...c.productsServices, mapProductService({ ...data, demands: [] })],
             };
           }
           return c;
         }));
       });
   }, []);
 
   const updateProductService = useCallback((candidateId: string, productId: string, data: Partial<ProductService>) => {
     setCandidates(prev => prev.map(c => {
       if (c.id === candidateId) {
         return {
           ...c,
           productsServices: c.productsServices.map(p => p.id === productId ? { ...p, ...data } : p),
         };
       }
       return c;
     }));
 
     const dbData: Record<string, unknown> = {};
     if (data.name !== undefined) dbData.name = data.name;
     if (data.status !== undefined) dbData.status = data.status;
     if (data.deliveryDate !== undefined) dbData.delivery_date = data.deliveryDate?.toISOString() ?? null;
 
     supabase.from('products_services').update(dbData).eq('id', productId).then(({ error }) => {
       if (error) toast.error('Erro ao atualizar produto/serviço');
     });
   }, []);
 
   const deleteProductService = useCallback((candidateId: string, productId: string) => {
     setCandidates(prev => prev.map(c => {
       if (c.id === candidateId) {
         return { ...c, productsServices: c.productsServices.filter(p => p.id !== productId) };
       }
       return c;
     }));
     supabase.from('products_services').delete().eq('id', productId).then(({ error }) => {
       if (error) toast.error('Erro ao excluir produto/serviço');
     });
   }, []);
 
   // ── Demandas ────────────────────────────────────────────────────
   const addDemand = useCallback((candidateId: string, productId: string, demand: Omit<Demand, 'id'>) => {
     supabase
       .from('demands')
       .insert({
         product_service_id: productId,
         description: demand.description,
         status: demand.status,
         created_at: demand.createdAt.toISOString(),
         delivery_date: demand.deliveryDate?.toISOString() ?? null,
         notes: demand.notes ?? null,
         links: demand.links ?? [],
       })
       .select('id, product_service_id, description, status, created_at, delivery_date, notes, links')
       .single()
       .then(({ data, error }) => {
         if (error || !data) {
           toast.error('Erro ao adicionar demanda');
           return;
         }
         setCandidates(prev => prev.map(c => {
           if (c.id === candidateId) {
             return {
               ...c,
               productsServices: c.productsServices.map(p => {
                 if (p.id === productId) {
                   return { ...p, demands: [...p.demands, mapDemand(data)] };
                 }
                 return p;
               }),
             };
           }
           return c;
         }));
       });
   }, []);
 
   const updateDemand = useCallback((candidateId: string, productId: string, demandId: string, data: Partial<Demand>) => {
     setCandidates(prev => prev.map(c => {
       if (c.id === candidateId) {
         return {
           ...c,
           productsServices: c.productsServices.map(p => {
             if (p.id === productId) {
               return { ...p, demands: p.demands.map(d => d.id === demandId ? { ...d, ...data } : d) };
             }
             return p;
           }),
         };
       }
       return c;
     }));
 
     const dbData: Record<string, unknown> = {};
     if (data.description !== undefined) dbData.description = data.description;
     if (data.status !== undefined) dbData.status = data.status;
     if (data.deliveryDate !== undefined) dbData.delivery_date = data.deliveryDate?.toISOString() ?? null;
     if (data.notes !== undefined) dbData.notes = data.notes ?? null;
     if (data.links !== undefined) dbData.links = data.links ?? [];
 
     supabase.from('demands').update(dbData).eq('id', demandId).then(({ error }) => {
       if (error) toast.error('Erro ao atualizar demanda');
     });
   }, []);
 
   const deleteDemand = useCallback((candidateId: string, productId: string, demandId: string) => {
     setCandidates(prev => prev.map(c => {
       if (c.id === candidateId) {
         return {
           ...c,
           productsServices: c.productsServices.map(p => {
             if (p.id === productId) {
               return { ...p, demands: p.demands.filter(d => d.id !== demandId) };
             }
             return p;
           }),
         };
       }
       return c;
     }));
     supabase.from('demands').delete().eq('id', demandId).then(({ error }) => {
       if (error) toast.error('Erro ao excluir demanda');
     });
   }, []);
 
   return (
     <DataContext.Provider value={{
       candidates,
       isLoading,
       authLoading,
       user,
       filters,
       isAdmin,
       signIn,
       signInWithGoogle,
       signOut,
       setFilters,
       addCandidate,
       updateCandidate,
       deleteCandidate,
       addProductService,
       updateProductService,
       deleteProductService,
       addDemand,
       updateDemand,
       deleteDemand,
     }}>
       {(authLoading || isLoading) ? (
         <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
           <p className="text-muted-foreground text-sm">Carregando dados...</p>
         </div>
       ) : null}
       {children}
     </DataContext.Provider>
   );
 }
 
 export function useData() {
   const context = useContext(DataContext);
   if (!context) throw new Error('useData deve ser usado dentro de DataProvider');
   return context;
 }
