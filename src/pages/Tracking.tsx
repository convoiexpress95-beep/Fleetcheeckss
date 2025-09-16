import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRealTimeTracking } from '@/hooks/useRealTimeTracking';
import { MapboxMap } from '@/components/MapboxMap';
import { NativeMissionTracking } from '@/components/NativeMissionTracking';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Truck, 
  Play, 
  Square, 
  CheckCircle,
  RefreshCw,
  Users,
  Package,
  Share2,
  Route,
  Timer,
  Copy,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function Tracking() {
  const { missions, loading, error, updateMissionStatus, calculateETA } = useRealTimeTracking();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [followMission, setFollowMission] = useState<Record<string, boolean>>({});
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'in_progress': return <Navigation className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <AlertCircle className="h-3 w-3" />;
      default: return <AlertCircle className="h-3 w-3" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
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

      // Copy to clipboard with robust fallback
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
        title: "Lien généré",
        description: (
          <span>
            Lien copié. <a href={trackingUrl} target="_blank" rel="noreferrer" className="underline">Ouvrir</a>
          </span>
        )
      });
    } catch (error) {
      console.error('Error generating tracking link:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le lien de suivi",
        variant: "destructive",
      });
    } finally {
      setCopyingId(null);
    }
  };

  // Retirer les estimations simulées de distance/temps pour n'afficher que des données réelles

  const handleStatusChange = async (missionId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    const success = await updateMissionStatus(missionId, newStatus);
    if (success) {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la mission a été modifié avec succès.",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la mission.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg">Chargement des missions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erreur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-6">
        {/* En-tête */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Suivi Temps Réel
            </h1>
            <p className="text-muted-foreground mt-1">Géolocalisation live et mises à jour automatiques</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Actualiser
          </Button>
        </div>

        {/* Grille deux colonnes: liste à gauche, carte à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          {/* Colonne gauche: missions actives */}
          <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Missions en cours ({missions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {missions.length === 0 ? (
                <div className="text-center py-10">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Aucune mission active</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                  {missions.map((mission) => (
                    <div
                      key={mission.id}
                      onClick={() => setSelectedMission(mission.id)}
                      className={`w-full text-left p-3 rounded-lg border transition hover:bg-accent/10 cursor-pointer ${
                        selectedMission === mission.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{mission.title}</span>
                            <Badge className={`${getStatusColor(mission.status)} text-white`}>{getStatusLabel(mission.status)}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">Réf: {mission.reference}</p>
                          {mission.tracking && (
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1"><Navigation className="h-3 w-3" /> {mission.tracking.speed?.toFixed(0) || 0} km/h</div>
                              <div>{mission.tracking.latitude?.toFixed(4)}, {mission.tracking.longitude?.toFixed(4)}</div>
                              <div className="col-span-2">MAJ: {new Date(mission.tracking.last_update).toLocaleTimeString()}</div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedMission(mission.id); }} className="h-8 px-2">
                            <MapPin className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant={followMission[mission.id] ? 'destructive' : 'default'} onClick={(e) => { e.stopPropagation(); setFollowMission(prev => ({...prev, [mission.id]: !prev[mission.id]})); }} className="h-8 px-2">
                            {followMission[mission.id] ? <Square className="h-3 w-3" /> : <Navigation className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); generatePublicTrackingLink(mission.id); }}
                            disabled={copyingId === mission.id}
                            className="h-8 px-2"
                            title={copyingId === mission.id ? 'Copie en cours...' : 'Copier le lien public'}
                          >
                            <Share2 className={`h-3 w-3 ${copyingId === mission.id ? 'animate-pulse' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Colonne droite: carte + détails mission sélectionnée */}
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Carte Interactive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MapboxMap
                  missions={missions}
                  onMissionSelect={(m) => setSelectedMission(m.id)}
                  selectedMissionId={selectedMission || undefined}
                  follow={selectedMission ? followMission[selectedMission] === true : false}
                  height="65vh"
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Détails de la mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedMission ? (
                  <p className="text-muted-foreground">Sélectionnez une mission dans la liste pour afficher les détails.</p>
                ) : (
                  (() => {
                    const mission = missions.find(m => m.id === selectedMission);
                    if (!mission) return <p className="text-muted-foreground">Mission introuvable.</p>;
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-800 dark:text-green-300">Enlèvement</p>
                              <p className="text-sm text-green-700 dark:text-green-400">{mission.pickup_address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                            <MapPin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-800 dark:text-red-300">Livraison</p>
                              <p className="text-sm text-red-700 dark:text-red-400">{mission.delivery_address}</p>
                            </div>
                          </div>
                        </div>

                        {mission.tracking && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                              <Navigation className="h-4 w-4" />
                              Position Temps Réel
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-blue-600 dark:text-blue-400">Vitesse</p>
                                <p className="font-semibold text-blue-800 dark:text-blue-200">{mission.tracking.speed?.toFixed(0) || 0} km/h</p>
                              </div>
                              <div>
                                <p className="text-blue-600 dark:text-blue-400">Coordonnées</p>
                                <p className="font-semibold text-blue-800 dark:text-blue-200">{mission.tracking.latitude?.toFixed(5)}, {mission.tracking.longitude?.toFixed(5)}</p>
                              </div>
                              <div>
                                <p className="text-blue-600 dark:text-blue-400">Dernière MAJ</p>
                                <p className="font-semibold text-blue-800 dark:text-blue-200">{new Date(mission.tracking.last_update).toLocaleTimeString()}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {mission.status === 'pending' && (
                            <Button size="sm" variant="secondary" onClick={() => handleStatusChange(mission.id, 'in_progress')} className="flex items-center gap-1">
                              <Play className="h-3 w-3" /> Démarrer
                            </Button>
                          )}
                          {/* Bouton Terminer retiré */}
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