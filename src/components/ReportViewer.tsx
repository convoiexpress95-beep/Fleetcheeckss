import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { Report } from '@/hooks/useReports';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getPublicUrlForMissionPhoto, normalizePhotoList } from '@/integrations/supabase/storage';
import { supabase } from '@/integrations/supabase/client';

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'generated': return 'Généré';
      case 'processing': return 'En cours';
      default: return status;
    }
  };

  // Extraction éventuelle des données d'inspections depuis le metadata
  const inspections = (report.metadata && typeof report.metadata === 'object') ? (report.metadata as any) : {};
  const [fallbackDeparture, setFallbackDeparture] = useState<any | null>(null);
  const [fallbackArrival, setFallbackArrival] = useState<any | null>(null);
  const [loadingFallback, setLoadingFallback] = useState(false);

  // Tentative d'extraction de mission_id depuis le metadata
  const missionIdFromMetadata = useMemo(() => {
    const m = inspections?.mission_id
      || inspections?.mission?.id
      || inspections?.missions?.[0]?.id
      || inspections?.summary?.mission_id
      || inspections?.summary?.missions?.[0]?.id
      || inspections?.latest_mission?.id
      || null;
    return typeof m === 'string' ? m : null;
  }, [inspections]);

  const departure = inspections.departure || inspections.inspection_departure || fallbackDeparture || null;
  const arrival = inspections.arrival || inspections.inspection_arrival || fallbackArrival || null;

  useEffect(() => {
    const needDep = !inspections.departure && !inspections.inspection_departure;
    const needArr = !inspections.arrival && !inspections.inspection_arrival;
    if (!missionIdFromMetadata || (!needDep && !needArr)) return;
    let cancelled = false;
    (async () => {
      try {
        setLoadingFallback(true);
        if (needDep) {
          const { data: depRow } = await supabase
            .from('inspection_departures')
            .select('*')
            .eq('mission_id', missionIdFromMetadata)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (!cancelled && depRow) setFallbackDeparture(depRow);
        }
        if (needArr) {
          const { data: arrRow } = await supabase
            .from('inspection_arrivals')
            .select('*')
            .eq('mission_id', missionIdFromMetadata)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (!cancelled && arrRow) setFallbackArrival(arrRow);
        }
      } finally {
        if (!cancelled) setLoadingFallback(false);
      }
    })();
    return () => { cancelled = true; };
  }, [missionIdFromMetadata, inspections.departure, inspections.inspection_departure, inspections.arrival, inspections.inspection_arrival]);

  // Helper pour mapper une liste de clés Storage vers des URLs publiques
  const mapToPublicUrls = (list: any): string[] => normalizePhotoList(list).map(getPublicUrlForMissionPhoto).filter(Boolean) as string[];

  const depPhotoUrls = mapToPublicUrls(departure?.photos);
  const arrPhotoUrls = mapToPublicUrls(arrival?.photos);
  const depSignatureUrl = getPublicUrlForMissionPhoto(departure?.client_signature_url);
  const arrSignatureUrl = getPublicUrlForMissionPhoto(arrival?.client_signature_url);

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
              {getStatusLabel(report.status)}
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

          {/* Photos & Signatures d'inspection */}
          {(depPhotoUrls.length > 0 || arrPhotoUrls.length > 0 || depSignatureUrl || arrSignatureUrl) && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Preuves d'inspection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingFallback && (
                  <div className="text-sm text-muted-foreground">Chargement des preuves...</div>
                )}
                {depPhotoUrls.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Photos Départ</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {depPhotoUrls.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="block">
                          <img src={url} alt={`Photo départ ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border border-white/10" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {depSignatureUrl && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Signature client (Départ)</h4>
                    <div className="bg-white p-3 rounded-md inline-block">
                      <img src={depSignatureUrl} alt="Signature client départ" className="max-h-40" />
                    </div>
                  </div>
                )}
                {arrPhotoUrls.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Photos Arrivée</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {arrPhotoUrls.map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noreferrer" className="block">
                          <img src={url} alt={`Photo arrivée ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border border-white/10" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {arrSignatureUrl && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Signature client (Arrivée)</h4>
                    <div className="bg-white p-3 rounded-md inline-block">
                      <img src={arrSignatureUrl} alt="Signature client arrivée" className="max-h-40" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata brut (debug) */}
          {report.metadata && (
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Informations additionnelles (brut)</CardTitle>
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