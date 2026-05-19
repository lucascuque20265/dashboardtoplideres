 import { Candidate, Program, Status, Demand, ProductService } from '@/types';
 import realDataJson from './realData.json';
 
 interface RawData {
   id: number;
   role1: string;
   role2: string;
   candidate: string;
   city: string;
   state: string;
   demand: string;
   date: string;
   status: string;
   deliveryLink: string;
 }
 
 const generateId = () => Math.random().toString(36).substring(2, 9);
 
 // Lista padrão de produtos/serviços
 const standardProducts = [
   'Formulário Perfil do Candidato',
   'Infográfico do perfil do Candidato em Linha do Tempo',
   'Análise SWOT',
   'Arquétipos',
   'Perfil Comportamental - DISC',
   'Objetivos: Pré-Campanha e Campanha',
   'Pesquisa Eleitoral',
   'Plano estratégico: Objetivo, Diagnóstico, Decisão, Foco do plano',
   'Posicionamento',
   'Definição de Causas',
   'Pertencimento',
   'Logomarca, cores, fontes e aplicações',
   'Análise de Redes Sociais',
   'Cronograma de Conteúdo - Metodologia ERES',
   'Reuniões Estratégicas',
   'Ebook',
   'Livro',
   'Revista Digital',
   'Jingle',
   'Vídeo de Apresentação do Candidato',
   'Site',
   'Projeto Sala Google',
 ];
 
 // Mapeamento de demandas para produtos
 const demandToProductMap: Record<string, string> = {
   'logomarca': 'Logomarca, cores, fontes e aplicações',
   'cartão de visita': 'Logomarca, cores, fontes e aplicações',
   'revista digital': 'Revista Digital',
   'jornal do candidato': 'Revista Digital',
   'sala google': 'Projeto Sala Google',
   'reunião': 'Reuniões Estratégicas',
   'ebook': 'Ebook',
   'cronograma': 'Cronograma de Conteúdo - Metodologia ERES',
   'entrevista': 'Formulário Perfil do Candidato',
 };
 
 // Converter status de português para inglês
 const convertStatus = (status: string): Status => {
   const s = (status || '').toLowerCase().trim();
   if (s === 'realizada' || s === 'realizado' || s === 'concluída' || s === 'concluido' || s === 'concluído') {
     return 'completed';
   }
   if (s === 'em andamento' || s === 'em progresso' || s === 'iniciada' || s === 'iniciado') {
     return 'in_progress';
   }
   return 'not_started';
 };
 
 // Converter role para Program
 const convertProgram = (role: string): Program | null => {
   const programMap: Record<string, Program> = {
     'TL': 'TL',
     'TE': 'TE',
     'TM': 'TM',
     'TA': 'TA',
   };
   return programMap[role] || null;
 };
 
 // Parser de dados
 function parseRealData(): Candidate[] {
   const data = realDataJson as RawData[];
   
   // Agrupar por candidato
   const candidateMap = new Map<string, RawData[]>();
   
   data.forEach((item) => {
     const key = `${item.candidate}|${item.city}|${item.state}`;
     if (!candidateMap.has(key)) {
       candidateMap.set(key, []);
     }
     candidateMap.get(key)!.push(item);
   });
   
   // Converter para estrutura de Candidate
   const candidates: Candidate[] = [];
   
   candidateMap.forEach((items, key) => {
     const firstItem = items[0];
     
     // Coletar programas únicos
     const programsSet = new Set<Program>();
     items.forEach(item => {
       const p1 = convertProgram(item.role1);
       const p2 = convertProgram(item.role2);
       if (p1) programsSet.add(p1);
       if (p2) programsSet.add(p2);
     });
     
     // Criar mapa de produtos completados
     const completedProductsMap = new Map<string, RawData>();
     items.forEach(item => {
       const status = convertStatus(item.status);
       if (status === 'completed') {
         // Encontrar qual produto esse demand corresponde
         const demandLower = item.demand.toLowerCase();
         for (const [key, productName] of Object.entries(demandToProductMap)) {
           if (demandLower.includes(key)) {
             completedProductsMap.set(productName, item);
             break;
           }
         }
       }
     });
     
     // Gerar produtos/serviços padrão + demandas existentes
     const productsServices: ProductService[] = [];
     
     // Adicionar produtos padrão
     standardProducts.forEach((productName) => {
       const completedItem = completedProductsMap.get(productName);
       const status = completedItem ? 'completed' as Status : 'not_started' as Status;
       const createdAt = completedItem ? new Date(completedItem.date) : new Date();
       
       const demand: Demand = {
         id: completedItem ? `${completedItem.id}` : generateId(),
         description: completedItem ? completedItem.demand : `Executar: ${productName}`,
         createdAt,
         deliveryDate: status === 'completed' ? createdAt : null,
         status,
         links: completedItem && completedItem.deliveryLink ? [completedItem.deliveryLink] : [],
       };
       
       const productService: ProductService = {
         id: `ps-${productName.replace(/\s+/g, '-').toLowerCase()}`,
         name: productName,
         status,
         createdAt,
         deliveryDate: status === 'completed' ? createdAt : null,
         demands: [demand],
       };
       
       productsServices.push(productService);
     });
     
     // Adicionar demandas que não correspondem a nenhum produto padrão
     const mappedProducts = new Set(Object.values(demandToProductMap));
     items.forEach((item) => {
       const demandLower = item.demand.toLowerCase();
       let isMapped = false;
       
       for (const [key] of Object.entries(demandToProductMap)) {
         if (demandLower.includes(key)) {
           isMapped = true;
           break;
         }
       }
       
       if (!isMapped) {
         const status = convertStatus(item.status);
         const createdAt = new Date(item.date);
         
         const demand: Demand = {
           id: `${item.id}`,
           description: item.demand,
           createdAt,
           deliveryDate: status === 'completed' ? createdAt : null,
           status,
           links: item.deliveryLink ? [item.deliveryLink] : [],
         };
         
         const productService: ProductService = {
           id: `ps-${item.id}`,
           name: item.demand.substring(0, 60) + (item.demand.length > 60 ? '...' : ''),
           status,
           createdAt,
           deliveryDate: status === 'completed' ? createdAt : null,
           demands: [demand],
         };
         
         productsServices.push(productService);
       }
     });
     
     const candidate: Candidate = {
       id: `${firstItem.id}`,
       name: firstItem.candidate,
       city: firstItem.city,
       state: firstItem.state,
       programs: Array.from(programsSet),
       productsServices,
     };
     
     candidates.push(candidate);
   });
   
   return candidates;
 }
 
 export const mockCandidates: Candidate[] = parseRealData();
 
 export function calculateCandidateProgress(candidate: Candidate): number {
   const totalProducts = candidate.productsServices.length;
   if (totalProducts === 0) return 0;
   
   const completedProducts = candidate.productsServices.filter(p => p.status === 'completed').length;
   const inProgressProducts = candidate.productsServices.filter(p => p.status === 'in_progress').length;
   
   return Math.round((completedProducts + inProgressProducts * 0.5) / totalProducts * 100);
 }
 
 export function getStatusLabel(status: Status): string {
   const labels: Record<Status, string> = {
     not_started: 'Não Iniciado',
     in_progress: 'Em Andamento',
     completed: 'Concluído',
   };
   return labels[status];
 }
 
 export function getProgramLabel(program: Program): string {
   const labels: Record<Program, string> = {
     TL: 'TOP Líderes',
     TE: 'TOP Executivos',
     TM: 'TOP Municípios',
     TA: 'TOP Assessores',
   };
   return labels[program];
 }