import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { DataProvider, useData } from "@/context/DataContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import CandidatesList from "./pages/CandidatesList";
import CandidateDetail from "./pages/CandidateDetail";
import Kanban from "./pages/Kanban";
import AuditLog from "./pages/AuditLog";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Rota protegida: redireciona para /login se não autenticado
function ProtectedLayout() {
  const { user, authLoading } = useData();
  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <MainLayout />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/candidates" element={<CandidatesList />} />
              <Route path="/candidates/:id" element={<CandidateDetail />} />
              <Route path="/audit" element={<AuditLog />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </DataProvider>
  </QueryClientProvider>
);

export default App;
