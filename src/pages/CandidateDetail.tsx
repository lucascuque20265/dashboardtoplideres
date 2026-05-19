import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, FileText } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProductServiceCard } from '@/components/candidates/ProductServiceCard';
import { CandidateDialog } from '@/components/dialogs/CandidateDialog';
import { ProductServiceDialog } from '@/components/dialogs/ProductServiceDialog';
import { DemandDialog } from '@/components/dialogs/DemandDialog';
import { useData } from '@/context/DataContext';
import { calculateCandidateProgress } from '@/data/mockData';
import { generateCandidateReport } from '@/utils/pdfExport';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Demand, ProductService } from '@/types';

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { candidates, isAdmin, deleteCandidate } = useData();

  const [candidateDialogOpen, setCandidateDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [demandDialogOpen, setDemandDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductService | undefined>();
  const [selectedProductIdForDemand, setSelectedProductIdForDemand] = useState<string>('');
  const [selectedDemandForEdit, setSelectedDemandForEdit] = useState<Demand | undefined>();

  const candidate = candidates.find(c => c.id === id);

  const progress = candidate ? calculateCandidateProgress(candidate) : 0;
  const completedProducts = candidate
    ? candidate.productsServices.filter(p => p.status === 'completed').length
    : 0;
  const inProgressProducts = candidate
    ? candidate.productsServices.filter(p => p.status === 'in_progress').length
    : 0;
  const notStartedProducts = candidate
    ? candidate.productsServices.filter(p => p.status === 'not_started').length
    : 0;

  const statusChartData = useMemo(() => {
    if (!candidate) return [];
    return [
      { name: 'Concluídos', value: completedProducts, color: 'hsl(var(--status-completed))' },
      { name: 'Em Andamento', value: inProgressProducts, color: 'hsl(var(--status-in-progress))' },
      { name: 'Não Iniciados', value: notStartedProducts, color: 'hsl(var(--status-not-started))' },
    ].filter(item => item.value > 0);
  }, [candidate, completedProducts, inProgressProducts, notStartedProducts]);

  // Timeline corrigida: chave por ano+mês com label legível, ordem cronológica
  const timelineData = useMemo(() => {
    if (!candidate) return [];
    const allDemands = candidate.productsServices.flatMap(p => p.demands);
    const buckets: Record<string, { sortKey: string; label: string; created: number; delivered: number }> = {};

    const bucketFor = (d: Date) => {
      const sortKey = format(d, 'yyyy-MM');
      const label = format(d, 'MMM/yy', { locale: ptBR });
      if (!buckets[sortKey]) {
        buckets[sortKey] = { sortKey, label, created: 0, delivered: 0 };
      }
      return buckets[sortKey];
    };

    allDemands.forEach(demand => {
      if (demand.createdAt) bucketFor(demand.createdAt).created++;
      if (demand.deliveryDate) bucketFor(demand.deliveryDate).delivered++;
    });

    return Object.values(buckets)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ label, created, delivered }) => ({ date: label, created, delivered }));
  }, [candidate]);

  if (!candidate) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground mb-4">Candidato não encontrado.</p>
        {id && <p className="text-xs text-muted-foreground mb-4">ID procurado: {id}</p>}
        <Link to="/candidates">
          <Button variant="link" className="mt-4">
            Voltar para lista
          </Button>
        </Link>
      </div>
    );
  }

  const handleDeleteCandidate = () => {
    if (confirm('Tem certeza que deseja excluir este candidato?')) {
      deleteCandidate(candidate.id);
      navigate('/candidates');
    }
  };

  const handleEditProduct = (product: ProductService) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const handleAddDemand = (productId: string) => {
    setSelectedProductIdForDemand(productId);
    setSelectedDemandForEdit(undefined);
    setDemandDialogOpen(true);
  };

  const handleEditDemand = (productId: string, demand: Demand) => {
    setSelectedProductIdForDemand(productId);
    setSelectedDemandForEdit(demand);
    setDemandDialogOpen(true);
  };

  const handleExportPdf = () => {
    generateCandidateReport(candidate);
  };

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">Voltar</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{candidate.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {candidate.city}, {candidate.state}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {candidate.programs.map(program => (
                <Badge key={program} variant="secondary">
                  {program}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportPdf} className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" onClick={() => setCandidateDialogOpen(true)} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
                <Button variant="destructive" onClick={handleDeleteCandidate} className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Progress Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progresso Geral</span>
                  <span className="text-2xl font-bold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-status-completed">{completedProducts}</p>
                  <p className="text-muted-foreground">Concluídos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-status-in-progress">{inProgressProducts}</p>
                  <p className="text-muted-foreground">Em Andamento</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-status-not-started">{notStartedProducts}</p>
                  <p className="text-muted-foreground">Não Iniciados</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      {statusChartData.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Status de Produtos/Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Timeline de Demandas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData}>
                      <defs>
                        <linearGradient id="colorCreatedDetail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorDeliveredDetail" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="created" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorCreatedDetail)" />
                      <Area type="monotone" dataKey="delivered" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorDeliveredDetail)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Products & Services */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Produtos e Serviços</h2>
          {isAdmin && (
            <Button
              onClick={() => {
                setSelectedProduct(undefined);
                setProductDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto/Serviço
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {candidate.productsServices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum produto ou serviço cadastrado.</p>
              </CardContent>
            </Card>
          ) : (
            candidate.productsServices.map(product => (
              <ProductServiceCard
                key={product.id}
                product={product}
                candidateId={candidate.id}
                onEdit={() => handleEditProduct(product)}
                onAddDemand={() => handleAddDemand(product.id)}
                onEditDemand={(demand) => handleEditDemand(product.id, demand)}
              />
            ))
          )}
        </div>
      </motion.div>

      {/* Dialogs */}
      <CandidateDialog open={candidateDialogOpen} onOpenChange={setCandidateDialogOpen} candidate={candidate} />
      <ProductServiceDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        candidateId={candidate.id}
        product={selectedProduct}
      />
      <DemandDialog
        open={demandDialogOpen}
        onOpenChange={setDemandDialogOpen}
        candidateId={candidate.id}
        productId={selectedProductIdForDemand}
        demand={selectedDemandForEdit}
      />
    </div>
  );
}
