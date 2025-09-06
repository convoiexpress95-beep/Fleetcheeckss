import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { Report } from '@/hooks/useReports';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportViewerProps {
  report: Report | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ report, open, onOpenChange }) => {
  const generatePDF = async () => {
    if (!report) return;

    const element = document.getElementById('report-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${report.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    }
  };

  if (!report) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'complete': return 'Rapport Complet';
      case 'financial': return 'Rapport Financier';
      case 'mileage': return 'Rapport Kilométrique';
      case 'inspection': return 'Rapport d\'Inspection';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'generated': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary-glow" />
            {report.title}
          </DialogTitle>
          <DialogDescription className="text-foreground/80 flex items-center gap-4">
            <Badge className={`${getStatusColor(report.status)} text-white border-0`}>
              {report.status}
            </Badge>
            <span>{getReportTypeLabel(report.report_type)}</span>
            <span>•</span>
            <span>Du {formatDate(report.date_from)} au {formatDate(report.date_to)}</span>
          </DialogDescription>
        </DialogHeader>

        <div id="report-content" className="space-y-6 p-4 bg-white/5 rounded-lg">
          {/* Header */}
          <div className="text-center pb-6 border-b border-white/10">
            <h1 className="text-3xl font-bold text-white mb-2">{report.title}</h1>
            <p className="text-foreground/80">
              Période: {formatDate(report.date_from)} - {formatDate(report.date_to)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Généré le {formatDate(report.created_at)}
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-cosmic rounded-lg">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Missions</p>
                    <p className="text-lg font-bold text-white">{report.missions_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-sunset rounded-lg">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(report.total_revenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {report.total_km && (
              <Card className="glass-card border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-ocean rounded-lg">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Kilométrage</p>
                      <p className="text-lg font-bold text-white">{report.total_km} km</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="glass-card border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-royal rounded-lg">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bénéfice net</p>
                    <p className="text-lg font-bold text-white">{formatCurrency(report.net_profit)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Content based on report type */}
          {report.report_type === 'financial' && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Détail Financier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chiffre d'affaires total:</span>
                    <span className="text-white font-semibold">{formatCurrency(report.total_revenue)}</span>
                  </div>
                  {report.fuel_costs && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frais de carburant:</span>
                      <span className="text-red-300">-{formatCurrency(report.fuel_costs)}</span>
                    </div>
                  )}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Bénéfice net:</span>
                      <span className="text-green-300">{formatCurrency(report.net_profit)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {report.report_type === 'mileage' && report.total_km && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Détail Kilométrique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance totale:</span>
                    <span className="text-white font-semibold">{report.total_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Missions effectuées:</span>
                    <span className="text-white font-semibold">{report.missions_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance moyenne par mission:</span>
                    <span className="text-white font-semibold">
                      {report.missions_count > 0 ? Math.round(report.total_km / report.missions_count) : 0} km
                    </span>
                  </div>
                  {report.fuel_costs && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coût du carburant:</span>
                      <span className="text-white font-semibold">{formatCurrency(report.fuel_costs)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {report.metadata && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Informations additionnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-muted-foreground text-sm overflow-x-auto">
                  {JSON.stringify(report.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="glass-card text-foreground border-border hover:bg-muted/50"
          >
            Fermer
          </Button>
          <Button
            onClick={generatePDF}
            className="bg-gradient-cosmic hover:scale-105 transition-all duration-300"
          >
            <Download className="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportViewer;