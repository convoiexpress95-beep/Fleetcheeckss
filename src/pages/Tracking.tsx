import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import { MapboxMap } from '@/components/MapboxMap';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks';
import {
  MapPin,
  Navigation,
  Clock,
  Play,
  Square,
  CheckCircle,
  RefreshCw,
  Users,
  Share2,
  Route,
  Timer,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Composant badge statut unifié (couleurs conservées)
const StatusPill: React.FC<{status:string; label?:string; className?:string}> = ({ status, label, className }) => {
  const color = status==='pending' ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40'
    : status==='in_progress' ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
    : status==='completed' ? 'bg-green-600/15 text-green-300 border-green-600/40'
    : status==='cancelled' ? 'bg-red-600/15 text-red-300 border-red-600/40'
    : 'bg-zinc-600/15 text-zinc-300 border-zinc-500/40';
  const lbl = label || (status==='pending' ? 'En attente' : status==='in_progress' ? 'En cours' : status==='completed' ? 'Terminée' : status==='cancelled' ? 'Annulée' : 'Inconnu');
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border shadow-inner ${color} ${className||''}`}>{lbl}</span>;
};

// Mini carte KPI
const KpiCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; trend?: string; accent?: string }> = ({ icon, label, value, trend, accent }) => (
  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-sm p-4 flex flex-col gap-2 group">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground/70">
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br ${accent || 'from-primary/40 to-primary/10'} text-primary group-hover:scale-105 transition`}>{icon}</span>
      {label}
    </div>
    <div className="text-2xl font-semibold tracking-tight">{value}</div>
    {trend && <div className="text-[11px] text-muted-foreground/70">{trend}</div>}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition pointer-events-none bg-radial-at-t from-white/5 via-transparent to-transparent" />
  </div>
);

export default function Tracking() {
  const { missions, loading, error, updateMissionStatus } = useRealTimeTracking();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [followMission, setFollowMission] = useState<Record<string, boolean>>({});
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const { toast } = useToast();

  // KPI calculés (memo pour éviter recalculs)
  const kpis = useMemo(()=>{
    const total = missions.length;
    const pending = missions.filter(m=>m.status==='pending').length;
    const active = missions.filter(m=>m.status==='in_progress').length;
    const done = missions.filter(m=>m.status==='completed').length;
    const cancelled = missions.filter(m=>m.status==='cancelled').length;
    return { total, pending, active, done, cancelled };
  },[missions]);

  // Timeline synthétique (événements déduits)
  const buildTimeline = (mission: any) => {
    const events: {label:string; icon:React.ReactNode; at?:string; tone:string}[] = [];
    events.push({ label:'Création', icon:<Clock className="h-3 w-3" />, at: mission.created_at || mission.createdAt, tone:'default'});
    if(mission.status==='pending') events.push({ label:'En attente départ', icon:<Timer className="h-3 w-3" />, tone:'warn'});
    if(mission.status==='in_progress') events.push({ label:'En cours', icon:<Navigation className="h-3 w-3" />, tone:'info'});
    if(mission.status==='completed') events.push({ label:'Terminée', icon:<CheckCircle className="h-3 w-3" />, tone:'success', at: mission.completed_at });
    if(mission.status==='cancelled') events.push({ label:'Annulée', icon:<AlertCircle className="h-3 w-3" />, tone:'error', at: mission.cancelled_at });
    if(mission.tracking) events.push({ label:'Dernière position', icon:<MapPin className="h-3 w-3" />, at: mission.tracking.last_update, tone:'info'});
    return events;
  };

  const generatePublicTrackingLink = async (missionId: string) => {
    try {
      setCopyingId(missionId);
      const { data, error } = await supabase.functions.invoke('generate-tracking-link', {
        body: { missionId }
      });
      if (error) throw error;
      const trackingToken: string | undefined = data?.trackingToken;
      const trackingUrl: string = trackingToken ? `${window.location.origin}/public-tracking/${trackingToken}` : '';
      if (!trackingUrl) throw new Error('Tracking URL non disponible');
      try {
        await navigator.clipboard.writeText(trackingUrl);
      } catch {
        const el = document.createElement('textarea');
        el.value = trackingUrl;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      toast({
        title: 'Lien généré',
        description: (<span>Lien copié. <a href={trackingUrl} target="_blank" rel="noreferrer" className="underline">Ouvrir</a></span>)
      });
    } catch (err) {
      console.error('Error generating tracking link:', err);
      toast({ title: 'Erreur', description: 'Impossible de générer le lien de suivi', variant: 'destructive' });
    } finally {
      setCopyingId(null);
    }
  };

  const handleStatusChange = async (missionId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    const success = await updateMissionStatus(missionId, newStatus);
    toast({
      title: success ? 'Statut mis à jour' : 'Erreur',
      description: success ? 'Le statut de la mission a été modifié avec succès.' : 'Impossible de mettre à jour le statut de la mission.',
      variant: success ? undefined : 'destructive'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Chargement des missions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">Erreur de chargement des missions.</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* En-tête & KPI */}
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">Suivi Temps Réel</h1>
            <p className="text-muted-foreground text-sm">Visualisation live des positions & statuts des missions.</p>
            <div className="flex gap-2 flex-wrap text-xs">
              <StatusPill status="pending" />
              <StatusPill status="in_progress" />
              <StatusPill status="completed" />
              <StatusPill status="cancelled" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 flex-1">
            <KpiCard icon={<Route className="h-3 w-3" />} label="Total" value={kpis.total} />
            <KpiCard icon={<Clock className="h-3 w-3" />} label="En attente" value={kpis.pending} accent="from-yellow-500/30 to-yellow-500/5" />
            <KpiCard icon={<Navigation className="h-3 w-3" />} label="En cours" value={kpis.active} accent="from-blue-500/30 to-blue-500/5" />
            <KpiCard icon={<CheckCircle className="h-3 w-3" />} label="Terminées" value={kpis.done} accent="from-green-600/40 to-green-600/5" />
            <KpiCard icon={<AlertCircle className="h-3 w-3" />} label="Annulées" value={kpis.cancelled} accent="from-red-600/40 to-red-600/5" />
          </div>
          <div className="flex gap-2 self-start xl:self-auto">
            <Button onClick={() => window.location.reload()} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Actualiser
            </Button>
          </div>
        </div>

          {/* Grille principale */}
          <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">
            {/* Liste missions */}
            <Card className="border border-white/10 shadow-xl bg-card/60 backdrop-blur-md relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between w-full">
                  <span className="text-lg font-semibold tracking-tight">Missions ({missions.length})</span>
                  <Button size="sm" variant="outline" onClick={() => window.location.reload()} className="h-8 gap-1">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {missions.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucune mission disponible.</p>
                )}
                <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1 custom-scrollbar">
                  {missions.map(mission => {
                    const isSelected = selectedMission === mission.id;
                    return (
                      <div
                        key={mission.id}
                        onClick={() => setSelectedMission(mission.id)}
                        className={`group relative w-full p-3 rounded-lg border transition cursor-pointer overflow-hidden flex gap-3 items-start ${isSelected ? 'border-primary/60 bg-primary/5 shadow-inner shadow-primary/10' : 'border-border/60 hover:border-border'} `}
                      >
                        <div className="flex flex-col items-center pt-1">
                          <span className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse shadow shadow-primary/40" />
                          {mission.tracking && <span className="mt-2 text-[10px] text-muted-foreground/60 font-mono">{mission.tracking.speed?.toFixed(0) || 0} km/h</span>}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate text-sm tracking-tight">{mission.title}</span>
                            <StatusPill status={mission.status} />
                          </div>
                          <p className="text-[11px] text-muted-foreground/80 truncate">Réf: {mission.reference}</p>
                          {mission.tracking && (
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> {mission.tracking.latitude?.toFixed(3)}, {mission.tracking.longitude?.toFixed(3)}</span>
                              <span className="opacity-70">MAJ {new Date(mission.tracking.last_update).toLocaleTimeString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-auto">
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedMission(mission.id); }} className="h-7 w-8 px-0">
                            <MapPin className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant={followMission[mission.id] ? 'destructive' : 'default'} onClick={(e) => { e.stopPropagation(); setFollowMission(prev => ({...prev, [mission.id]: !prev[mission.id]})); }} className="h-7 w-8 px-0">
                            {followMission[mission.id] ? <Square className="h-3 w-3" /> : <Navigation className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); generatePublicTrackingLink(mission.id); }}
                            disabled={copyingId === mission.id}
                            className="h-7 w-8 px-0"
                            title={copyingId === mission.id ? 'Copie en cours...' : 'Copier le lien public'}
                          >
                            <Share2 className={`h-3 w-3 ${copyingId === mission.id ? 'animate-pulse' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Carte + détails */}
            <div className="space-y-6">
              <Card className="border border-white/10 shadow-2xl bg-card/60 backdrop-blur-md relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.05),transparent_70%)]" />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" /> Carte Interactive
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MapboxMap
                    missions={missions}
                    onMissionSelect={(m) => setSelectedMission(m.id)}
                    selectedMissionId={selectedMission || undefined}
                    follow={selectedMission ? followMission[selectedMission] === true : false}
                    height="55vh"
                  />
                </CardContent>
              </Card>

              <Card className="border border-white/10 shadow-xl bg-card/60 backdrop-blur-md relative overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Détails de la mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedMission ? (
                    <p className="text-muted-foreground text-sm">Sélectionnez une mission dans la liste pour afficher les détails.</p>
                  ) : (
                    (() => {
                      const mission = missions.find(m => m.id === selectedMission);
                      if (!mission) return <p className="text-muted-foreground">Mission introuvable.</p>;
                      const timeline = buildTimeline(mission);
                      return (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/15 rounded-lg border border-green-200/60 dark:border-green-800/40">
                              <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-green-800 dark:text-green-300">Enlèvement</p>
                                <p className="text-xs text-green-700 dark:text-green-400 truncate">{mission.pickup_address}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/15 rounded-lg border border-red-200/60 dark:border-red-800/40">
                              <MapPin className="h-4 w-4 text-red-600 dark:text-red-400 mt-1 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-red-800 dark:text-red-300">Livraison</p>
                                <p className="text-xs text-red-700 dark:text-red-400 truncate">{mission.delivery_address}</p>
                              </div>
                            </div>
                          </div>

                          {mission.tracking && (
                            <div className="p-4 rounded-lg border bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/40">
                              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2 text-sm">
                                <Navigation className="h-4 w-4" /> Position Temps Réel
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
                                <div>
                                  <p className="text-blue-600 dark:text-blue-400">Vitesse</p>
                                  <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm">{mission.tracking.speed?.toFixed(0) || 0} km/h</p>
                                </div>
                                <div>
                                  <p className="text-blue-600 dark:text-blue-400">Coord.</p>
                                  <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm">{mission.tracking.latitude?.toFixed(5)}, {mission.tracking.longitude?.toFixed(5)}</p>
                                </div>
                                <div>
                                  <p className="text-blue-600 dark:text-blue-400">Dernière MAJ</p>
                                  <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm">{new Date(mission.tracking.last_update).toLocaleTimeString()}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Timeline */}
                          <div>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-4 w-4" /> Historique (synthétique)
                            </h4>
                            <ol className="space-y-2 relative pl-3">
                              {timeline.map((ev, idx) => (
                                <li key={idx} className="flex gap-2 text-[11px] items-center">
                                  <span className="w-1 h-1 rounded-full bg-primary block" />
                                  <span className="font-medium">{ev.label}</span>
                                  {ev.at && <span className="opacity-60">{new Date(ev.at).toLocaleTimeString()}</span>}
                                </li>
                              ))}
                            </ol>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {mission.status === 'pending' && (
                              <Button size="sm" variant="secondary" onClick={() => handleStatusChange(mission.id, 'in_progress')} className="flex items-center gap-1">
                                <Play className="h-3 w-3" /> Démarrer
                              </Button>
                            )}
                            {/* Autres actions potentielles ici */}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </div>
  );
}