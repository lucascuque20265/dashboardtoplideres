 import { Outlet } from 'react-router-dom';
 import { Header } from './Header';
 import { ErrorBoundary } from '../ErrorBoundary';
 
 export function MainLayout() {
   return (
     <div className="min-h-screen flex flex-col">
       <Header />
       <main className="flex-1">
         <ErrorBoundary>
           <Outlet />
         </ErrorBoundary>
       </main>
       <footer className="border-t py-4 bg-card">
         <div className="container text-center text-sm text-muted-foreground">
           Gestão de Demandas – TOP Líderes
         </div>
       </footer>
     </div>
   );
 }