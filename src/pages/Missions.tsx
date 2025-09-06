import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMissions, useArchiveMission, useUpdateMission } from '@/hooks/useMissions';
import { statusMappings } from '@/lib/mappings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Download, ArrowLeft, Eye, Edit, Archive, Trash2, UserPlus, Wallet, Truck, MapPin, FileText, Phone, Mail, User, Calendar } from 'lucide-react';
import MissionRecap, { MissionRecapData } from '@/components/MissionRecap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// Dropdown retiré au profit d'actions icônes
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MissionDetailsDialog } from '@/components/MissionDetailsDialog';
import { AssignMissionDialog } from '@/components/AssignMissionDialog';
import { DeleteMissionDialog } from '@/components/DeleteMissionDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Inspection FleetCheck retirée du web

const Missions = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [selectedMission, setSelectedMission] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'details' | 'assign' | 'delete' | null>(null);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<any>(null);
  const [driverRevenueOpen, setDriverRevenueOpen] = useState(false);
  const [driverRevenueValue, setDriverRevenueValue] = useState<string>('');
  
  const navigate = useNavigate();
  const archiveMission = useArchiveMission();
  const { mutateAsync: updateMissionMutate, isPending: isUpdatingMission } = useUpdateMission();
  
  const { data: missionsData, isLoading, error } = useMissions(
    { search, status: statusFilter },
    page,
    10
  );

  // Refs pour récap PDF par mission
  const recapRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const mapMissionToRecap = (mission: any): MissionRecapData => ({
    title: mission.title || '',
    description: mission.description || '',
    pickup_address: mission.pickup_address || '',
    delivery_address: mission.delivery_address || '',
    pickup_contact_name: mission.pickup_contact_name || '',
    pickup_contact_phone: mission.pickup_contact_phone || '',
    pickup_contact_email: mission.pickup_contact_email || '',
    delivery_contact_name: mission.delivery_contact_name || '',
    delivery_contact_phone: mission.delivery_contact_phone || '',
    delivery_contact_email: mission.delivery_contact_email || '',
    pickup_date: mission.pickup_date || '',
    pickup_time: mission.pickup_time || '',
    delivery_date: mission.delivery_date || '',
    delivery_time: mission.delivery_time || '',
    vehicle_type: mission.vehicle_type || '',
    license_plate: mission.license_plate || '',
    vehicle_brand: mission.vehicle_brand || '',
    vehicle_model: mission.vehicle_model || '',
    vehicle_year: mission.vehicle_year ? String(mission.vehicle_year) : '',
    assigned_to: mission.driver_profile ? 'contact' : 'self',
    assigned_contact_id: mission.driver_id || '',
    driver_earning: mission.driver_earning ? String(mission.driver_earning) : '',
    edl_ext: mission.edl_ext || '',
    edl_int: mission.edl_int || '',
    edl_km: mission.edl_km || '',
    edl_carburant: mission.edl_carburant || '',
  });

  const handleDownloadPdf = async (missionId: string) => {
    const el = recapRefs.current[missionId];
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      let remaining = imgHeight;
      let y = 0;
      while (remaining > 0) {
        pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight, undefined, 'FAST');
        remaining -= pageHeight;
        y -= pageHeight;
        if (remaining > 0) pdf.addPage();
      }
    }
    pdf.save(`mission-${missionId}-recap.pdf`);
  };

  const openDialog = (type: 'details' | 'assign' | 'delete', mission: any) => {
    setSelectedMission(mission);
    setDialogType(type);
  };

  const closeDialog = () => {
    setSelectedMission(null);
    setDialogType(null);
  };

  const handleEdit = (mission: any) => {
    navigate(`/missions/${mission.id}/edit`);
  };

  const handleArchiveRequest = (mission: any) => {
    setArchiveTarget(mission);
    setConfirmArchiveOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    try {
      await archiveMission.mutateAsync(archiveTarget.id);
    } catch (error) {
      console.error('Error archiving mission:', error);
    } finally {
      setConfirmArchiveOpen(false);
      setArchiveTarget(null);
    }
  };

  const handleOpenDriverRevenue = (mission: any) => {
    setSelectedMission(mission);
    setDriverRevenueValue(mission?.driver_earning ? String(mission.driver_earning) : '');
    setDriverRevenueOpen(true);
  };

  const exportToCsv = () => {
    if (!missionsData?.data?.length) return;

    const headers = ['Référence', 'Titre', 'Statut', 'Donneur d\'ordre', 'Convoyeur', 'Date de création'];
    const rows = missionsData.data.map(mission => [
      mission.reference,
      mission.title,
      statusMappings.mission[mission.status] || mission.status,
      mission.donor_profile?.full_name || 'Non assigné',
      mission.driver_profile?.full_name || 'Non assigné',
      format(new Date(mission.created_at), 'dd/MM/yyyy', { locale: fr })
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `missions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Erreur</h2>
          <p className="text-muted-foreground">Impossible de charger les missions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Link>
            </Button>
            <div className="w-12 h-12 bg-gradient-royal rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-royal bg-clip-text text-transparent">
                Missions Premium
              </h1>
              <p className="text-muted-foreground">
                {missionsData?.count || 0} mission{(missionsData?.count || 0) > 1 ? 's' : ''} dans votre flotte
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            <Button variant="outline" onClick={exportToCsv} disabled={!missionsData?.data?.length}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            {/* Bouton icône coloré pour créer */}
            <Button asChild size="icon" className="rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md hover:opacity-90">
              <Link to="/missions/new" aria-label="Nouvelle mission">
                <Plus className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild className="bg-gradient-royal hover:opacity-90 hidden md:inline-flex">
              <Link to="/missions/new">
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle mission
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Recherche</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Titre ou référence..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {Object.entries(statusMappings.mission).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label as string}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setPage(0);
                  }}
                  className="w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missions List */}
        <div className="space-y-4">
          {missionsData?.data?.length === 0 ? (
            <Card className="glass-card border-border/50">
              <CardContent className="py-16">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Aucune mission trouvée</h3>
                  <p className="text-muted-foreground mb-6">
                    {search || statusFilter ? 'Essayez de modifier vos filtres.' : 'Commencez par créer votre première mission.'}
                  </p>
                  <Button asChild className="bg-gradient-royal hover:opacity-90">
                    <Link to="/missions/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Créer une mission
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            missionsData?.data?.map((mission) => (
              <Card key={mission.id} className="glass-card border-border/50 hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="w-4 h-4 text-primary" /> {mission.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" /> Ref: {mission.reference}</span>
                      </CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                      {statusMappings.mission[mission.status] || mission.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Donneur d'ordre</p>
                      <p className="font-medium">{mission.donor_profile?.full_name || 'Non assigné'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Convoyeur</p>
                      <p className="font-medium">{mission.driver_profile?.full_name || 'Non assigné'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Créé le</p>
                      <p className="font-medium">{format(new Date(mission.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}</p>
                    </div>
                  </div>

                  {(mission.pickup_address || mission.delivery_address) && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mission.pickup_address && (
                        <div className="p-3 rounded-lg border border-white/10 bg-emerald-500/10">
                          <div className="text-xs text-emerald-400 uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Départ</div>
                          <div className="text-sm">{mission.pickup_address}</div>
                          {(mission.pickup_date || mission.pickup_time) && (
                            <div className="mt-1 text-xs flex items-center gap-1 text-emerald-300/90">
                              <Calendar className="w-3 h-3" />
                              <span>{mission.pickup_date ? new Date(mission.pickup_date).toLocaleDateString() : ''} {mission.pickup_time || ''}</span>
                            </div>
                          )}
                          {(mission.pickup_contact_name || mission.pickup_contact_phone || mission.pickup_contact_email) && (
                            <div className="mt-2 text-xs space-y-1">
                              {mission.pickup_contact_name && (
                                <div className="flex items-center gap-2 text-emerald-300/90"><User className="w-3 h-3" /> {mission.pickup_contact_name}</div>
                              )}
                              {mission.pickup_contact_phone && (
                                <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-emerald-300" />
                                  <a className="hover:underline" href={`tel:${mission.pickup_contact_phone}`}>{mission.pickup_contact_phone}</a>
                                </div>
                              )}
                              {mission.pickup_contact_email && (
                                <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-emerald-300" />
                                  <a className="hover:underline" href={`mailto:${mission.pickup_contact_email}`}>{mission.pickup_contact_email}</a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {mission.delivery_address && (
                        <div className="p-3 rounded-lg border border-white/10 bg-rose-500/10">
                          <div className="text-xs text-rose-400 uppercase mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Arrivée</div>
                          <div className="text-sm">{mission.delivery_address}</div>
                          {(mission.delivery_date || mission.delivery_time) && (
                            <div className="mt-1 text-xs flex items-center gap-1 text-rose-300/90">
                              <Calendar className="w-3 h-3" />
                              <span>{mission.delivery_date ? new Date(mission.delivery_date).toLocaleDateString() : ''} {mission.delivery_time || ''}</span>
                            </div>
                          )}
                          {(mission.delivery_contact_name || mission.delivery_contact_phone || mission.delivery_contact_email) && (
                            <div className="mt-2 text-xs space-y-1">
                              {mission.delivery_contact_name && (
                                <div className="flex items-center gap-2 text-rose-300/90"><User className="w-3 h-3" /> {mission.delivery_contact_name}</div>
                              )}
                              {mission.delivery_contact_phone && (
                                <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-rose-300" />
                                  <a className="hover:underline" href={`tel:${mission.delivery_contact_phone}`}>{mission.delivery_contact_phone}</a>
                                </div>
                              )}
                              {mission.delivery_contact_email && (
                                <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-rose-300" />
                                  <a className="hover:underline" href={`mailto:${mission.delivery_contact_email}`}>{mission.delivery_contact_email}</a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {mission.description && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-sm">{mission.description}</p>
                    </div>
                  )}

                  {/* Récap caché (pour export PDF) */}
                  <div style={{ position: 'absolute', left: -10000, top: 0, width: 800, backgroundColor: '#ffffff' }}>
                    <MissionRecap data={mapMissionToRecap(mission)} innerRef={(el) => { recapRefs.current[mission.id] = el; }} />
                  </div>

                  {/* Barre d'actions icônes */}
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => openDialog('details', mission)} aria-label="Voir les détails">
                      <Eye className="w-5 h-5 text-sky-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => handleEdit(mission)} aria-label="Modifier">
                      <Edit className="w-5 h-5 text-indigo-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => openDialog('assign', mission)} aria-label="Assigner">
                      <UserPlus className="w-5 h-5 text-emerald-400" />
                    </Button>
                    {mission.driver_profile && (
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => handleOpenDriverRevenue(mission)} aria-label="Revenu convoyeur">
                        <Wallet className="w-5 h-5 text-amber-400" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => handleDownloadPdf(mission.id)} aria-label="Télécharger PDF">
                      <Download className="w-5 h-5 text-fuchsia-400" />
                    </Button>
                    <Button variant="ghost" size="icon" disabled={archiveMission.isPending} className="rounded-full hover:bg-white/10" onClick={() => handleArchiveRequest(mission)} aria-label="Archiver">
                      <Archive className="w-5 h-5 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => openDialog('delete', mission)} aria-label="Supprimer">
                      <Trash2 className="w-5 h-5 text-rose-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {missionsData?.count && missionsData.count > 10 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Précédent
            </Button>
            <span className="flex items-center px-4">
              Page {page + 1} sur {Math.ceil(missionsData.count / 10)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * 10 >= missionsData.count}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      {/* Dialogs */}
      {selectedMission && (
        <>
          <MissionDetailsDialog
            mission={selectedMission}
            open={dialogType === 'details'}
            onOpenChange={closeDialog}
          />
          <AssignMissionDialog
            mission={selectedMission}
            open={dialogType === 'assign'}
            onOpenChange={closeDialog}
          />
          <DeleteMissionDialog
            mission={selectedMission}
            open={dialogType === 'delete'}
            onOpenChange={closeDialog}
          />
          {/* Confirmation d'archivage */}
          <Dialog open={confirmArchiveOpen} onOpenChange={setConfirmArchiveOpen}>
            <DialogContent className="glass-card border-white/20">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Archiver la mission</DialogTitle>
                <DialogDescription>
                  Confirmez-vous l'archivage de la mission {archiveTarget?.title ? `"${archiveTarget.title}"` : ''} ?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmArchiveOpen(false)}>Annuler</Button>
                <Button onClick={handleArchiveConfirm} disabled={archiveMission.isPending} className="bg-gradient-royal">
                  {archiveMission.isPending ? 'Archivage...' : 'Archiver'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Saisie revenu convoyeur */}
          <Dialog open={driverRevenueOpen} onOpenChange={setDriverRevenueOpen}>
            <DialogContent className="glass-card border-white/20">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Revenu convoyeur</DialogTitle>
                <DialogDescription>
                  Saisissez le revenu du convoyeur pour cette mission.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Label htmlFor="driverRevenue">Montant (€)</Label>
                <Input id="driverRevenue" type="number" step="0.01" value={driverRevenueValue} onChange={(e) => setDriverRevenueValue(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDriverRevenueOpen(false)}>Annuler</Button>
                <Button
                  onClick={async () => {
                    if (!selectedMission?.id) return;
                    const value = parseFloat(driverRevenueValue);
                    if (Number.isNaN(value)) {
                      setDriverRevenueOpen(false);
                      return;
                    }
                    try {
                      await updateMissionMutate({ id: selectedMission.id, updates: { driver_earning: value } } as any);
                      setDriverRevenueOpen(false);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="bg-gradient-cosmic"
                >
                  {isUpdatingMission ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* Wizard d'inspection retiré du web */}
        </>
      )}
    </div>
  );
};

export default Missions;