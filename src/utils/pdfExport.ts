 import jsPDF from 'jspdf';
 import autoTable from 'jspdf-autotable';
 import { Candidate, KPIData } from '@/types';
 import { calculateCandidateProgress, getStatusLabel } from '@/data/mockData';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 
 export async function generateCandidateReport(candidate: Candidate) {
   const doc = new jsPDF();
   const pageWidth = doc.internal.pageSize.getWidth();
   const margin = 20;
   
   // Header
   doc.setFillColor(37, 99, 235); // Primary blue
   doc.rect(0, 0, pageWidth, 50, 'F');
   
   doc.setTextColor(255, 255, 255);
   doc.setFontSize(24);
   doc.setFont('helvetica', 'bold');
   doc.text('TOP Líderes', margin, 25);
   
   doc.setFontSize(12);
   doc.setFont('helvetica', 'normal');
   doc.text('Relatório Individual de Candidato', margin, 35);
   doc.text(format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }), pageWidth - margin, 35, { align: 'right' });
 
   // Candidate Info
   doc.setTextColor(30, 41, 59);
   doc.setFontSize(18);
   doc.setFont('helvetica', 'bold');
   doc.text(candidate.name, margin, 70);
   
   doc.setFontSize(12);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(100, 116, 139);
   doc.text(`${candidate.city}, ${candidate.state}`, margin, 80);
   doc.text(`Programas: ${candidate.programs.join(', ')}`, margin, 88);
 
   // Progress Summary
   const progress = calculateCandidateProgress(candidate);
   const completedProducts = candidate.productsServices.filter(p => p.status === 'completed').length;
   const inProgressProducts = candidate.productsServices.filter(p => p.status === 'in_progress').length;
   const notStartedProducts = candidate.productsServices.filter(p => p.status === 'not_started').length;
   
   doc.setFillColor(241, 245, 249);
   doc.roundedRect(margin, 100, pageWidth - margin * 2, 40, 3, 3, 'F');
   
   doc.setTextColor(30, 41, 59);
   doc.setFontSize(14);
   doc.setFont('helvetica', 'bold');
   doc.text('Resumo de Progresso', margin + 10, 115);
   
   doc.setFontSize(11);
   doc.setFont('helvetica', 'normal');
   doc.text(`Progresso Geral: ${progress}%`, margin + 10, 128);
   doc.text(`Concluídos: ${completedProducts}`, margin + 80, 128);
   doc.text(`Em Andamento: ${inProgressProducts}`, margin + 140, 128);
   doc.text(`Não Iniciados: ${notStartedProducts}`, pageWidth - margin - 60, 128);
 
   // Products & Services Table
   doc.setFontSize(14);
   doc.setFont('helvetica', 'bold');
   doc.text('Produtos e Serviços', margin, 160);
   
   const productsData = candidate.productsServices.map(p => [
     p.name,
     getStatusLabel(p.status),
     format(p.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
     p.deliveryDate ? format(p.deliveryDate, 'dd/MM/yyyy', { locale: ptBR }) : '-',
     `${p.demands.filter(d => d.status === 'completed').length}/${p.demands.length}`,
   ]);
 
   autoTable(doc, {
     startY: 165,
     head: [['Nome', 'Status', 'Criação', 'Entrega', 'Demandas']],
     body: productsData,
     theme: 'striped',
     headStyles: { fillColor: [37, 99, 235] },
     styles: { fontSize: 9 },
     margin: { left: margin, right: margin },
   });
 
   // Demands section (if fits on page)
   let yPosition = (doc as any).lastAutoTable.finalY + 20;
   
   candidate.productsServices.forEach(product => {
     if (yPosition > 250) {
       doc.addPage();
       yPosition = margin;
     }
     
     doc.setFontSize(12);
     doc.setFont('helvetica', 'bold');
     doc.text(`${product.name} - Demandas`, margin, yPosition);
     
     if (product.demands.length > 0) {
       const demandsData = product.demands.map(d => [
         d.description,
         getStatusLabel(d.status),
         format(d.createdAt, 'dd/MM/yyyy', { locale: ptBR }),
         d.deliveryDate ? format(d.deliveryDate, 'dd/MM/yyyy', { locale: ptBR }) : '-',
       ]);
 
       autoTable(doc, {
         startY: yPosition + 5,
         head: [['Descrição', 'Status', 'Criação', 'Entrega']],
         body: demandsData,
         theme: 'striped',
         headStyles: { fillColor: [100, 116, 139] },
         styles: { fontSize: 8 },
         margin: { left: margin, right: margin },
       });
       
       yPosition = (doc as any).lastAutoTable.finalY + 15;
     } else {
       yPosition += 10;
       doc.setFont('helvetica', 'italic');
       doc.setFontSize(10);
       doc.text('Nenhuma demanda cadastrada', margin, yPosition);
       yPosition += 15;
     }
   });
 
   // Footer
   const pageCount = doc.getNumberOfPages();
   for (let i = 1; i <= pageCount; i++) {
     doc.setPage(i);
     doc.setFontSize(8);
     doc.setTextColor(150);
     doc.text(
       `Gestão de Demandas - TOP Líderes | Página ${i} de ${pageCount}`,
       pageWidth / 2,
       doc.internal.pageSize.getHeight() - 10,
       { align: 'center' }
     );
   }
 
   doc.save(`relatorio-${candidate.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
 }
 
 export async function generateGlobalReport(candidates: Candidate[], kpis: KPIData) {
   const doc = new jsPDF();
   const pageWidth = doc.internal.pageSize.getWidth();
   const margin = 20;
 
   // Header
   doc.setFillColor(37, 99, 235);
   doc.rect(0, 0, pageWidth, 50, 'F');
   
   doc.setTextColor(255, 255, 255);
   doc.setFontSize(24);
   doc.setFont('helvetica', 'bold');
   doc.text('TOP Líderes', margin, 25);
   
   doc.setFontSize(12);
   doc.setFont('helvetica', 'normal');
   doc.text('Relatório Global de Gestão', margin, 35);
   doc.text(format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }), pageWidth - margin, 35, { align: 'right' });
 
   // KPIs
   doc.setTextColor(30, 41, 59);
   doc.setFontSize(14);
   doc.setFont('helvetica', 'bold');
   doc.text('Indicadores Gerais', margin, 70);
 
   const kpiY = 80;
   const kpiWidth = (pageWidth - margin * 2 - 30) / 4;
   
   const kpiData = [
     { label: 'Candidatos', value: kpis.totalCandidates.toString() },
     { label: 'Demandas', value: kpis.totalDemands.toString() },
     { label: 'Produtos/Serviços', value: kpis.totalProductsServices.toString() },
     { label: 'Conclusão', value: `${kpis.completionPercentage}%` },
   ];
 
   kpiData.forEach((kpi, index) => {
     const x = margin + index * (kpiWidth + 10);
     doc.setFillColor(241, 245, 249);
     doc.roundedRect(x, kpiY, kpiWidth, 30, 3, 3, 'F');
     
     doc.setFontSize(10);
     doc.setFont('helvetica', 'normal');
     doc.setTextColor(100, 116, 139);
     doc.text(kpi.label, x + kpiWidth / 2, kpiY + 10, { align: 'center' });
     
     doc.setFontSize(16);
     doc.setFont('helvetica', 'bold');
     doc.setTextColor(30, 41, 59);
     doc.text(kpi.value, x + kpiWidth / 2, kpiY + 23, { align: 'center' });
   });
 
   // Status distribution
   const allProducts = candidates.flatMap(c => c.productsServices);
   const completed = allProducts.filter(p => p.status === 'completed').length;
   const inProgress = allProducts.filter(p => p.status === 'in_progress').length;
   const notStarted = allProducts.filter(p => p.status === 'not_started').length;
 
   doc.setFontSize(14);
   doc.setFont('helvetica', 'bold');
   doc.text('Distribuição por Status', margin, 130);
 
   doc.setFontSize(11);
   doc.setFont('helvetica', 'normal');
   doc.setTextColor(34, 197, 94);
   doc.text(`Concluídos: ${completed} (${((completed / allProducts.length) * 100).toFixed(1)}%)`, margin, 142);
   doc.setTextColor(234, 179, 8);
   doc.text(`Em Andamento: ${inProgress} (${((inProgress / allProducts.length) * 100).toFixed(1)}%)`, margin + 70, 142);
   doc.setTextColor(148, 163, 184);
   doc.text(`Não Iniciados: ${notStarted} (${((notStarted / allProducts.length) * 100).toFixed(1)}%)`, margin + 150, 142);
 
   // Candidates Table
   doc.setTextColor(30, 41, 59);
   doc.setFontSize(14);
   doc.setFont('helvetica', 'bold');
   doc.text('Progresso por Candidato', margin, 165);
 
   const candidatesData = candidates
     .map(c => ({
       name: c.name,
       location: `${c.city}, ${c.state}`,
       programs: c.programs.join(', '),
       products: c.productsServices.length,
       progress: calculateCandidateProgress(c),
     }))
     .sort((a, b) => b.progress - a.progress)
     .map(c => [
       c.name,
       c.location,
       c.programs,
       c.products.toString(),
       `${c.progress}%`,
     ]);
 
   autoTable(doc, {
     startY: 170,
     head: [['Candidato', 'Localização', 'Programas', 'Produtos', 'Progresso']],
     body: candidatesData,
     theme: 'striped',
     headStyles: { fillColor: [37, 99, 235] },
     styles: { fontSize: 9 },
     margin: { left: margin, right: margin },
   });
 
   // Footer
   const pageCount = doc.getNumberOfPages();
   for (let i = 1; i <= pageCount; i++) {
     doc.setPage(i);
     doc.setFontSize(8);
     doc.setTextColor(150);
     doc.text(
       `Gestão de Demandas - TOP Líderes | Página ${i} de ${pageCount}`,
       pageWidth / 2,
       doc.internal.pageSize.getHeight() - 10,
       { align: 'center' }
     );
   }
 
   doc.save('relatorio-global-top-lideres.pdf');
 }