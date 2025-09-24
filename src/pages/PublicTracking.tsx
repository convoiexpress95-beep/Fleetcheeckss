import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapboxMap } from '@/components/MapboxMap';
import { supabase } from '@/integrations/supabase/client';
import { MissionWithTracking } from '@/hooks/useRealTimeTracking';
import { 
  MapPin, 
  Clock, 
  Truck, 
  Package,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface TrackingData {
  mission: {
    id: string;
    reference: string;
    title: string;
    pickup_address: string;
    delivery_address: string;
    status: string;
  };
  tracking?: {
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    last_update: string;
  };
}

export default function PublicTracking() {
  const { token } = useParams<{ token: string }>();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrackingData = async () => {
      if (!token) {
        setError('Token de suivi manquant');
        setLoading(false);
        return;
      }

      try {
        // Utiliser l'API intégrée pour éviter toute dépendance à VITE_SUPABASE_URL
        const { data, error } = await supabase.functions.invoke('public-tracking', {
          body: { token }
        });
        if (error) throw error;
        setTrackingData(data);
      } catch (err) {
        console.error('Error loading tracking data:', err);
        setError('Lien de suivi invalide ou expiré');
      } finally {
        setLoading(false);
      }
    };

    loadTrackingData();

    // Refresh every 30 seconds
    const interval = setInterval(loadTrackingData, 30000);

    // Realtime minimal: écouter la dernière position pour la mission en direct
    // Sans complexité: on se réabonne après récupération initiale lorsque mission connue
    let channel: ReturnType<typeof supabase.channel> | null = null;
    if (token) {
      // On ne connaît l'ID mission qu'après le premier fetch; donc on met un petit délai
      setTimeout(() => {
        const missionId = (trackingData?.mission?.id) || undefined;
        if (!missionId) return;
        channel = supabase
          .channel(`public-tracking-${missionId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'mission_tracking', filter: `mission_id=eq.${missionId}` },
            (payload) => {
              try {
                const row: any = payload.new || {};
                setTrackingData((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    tracking: {
                      latitude: Number(row.latitude),
                      longitude: Number(row.longitude),
                      speed: row.speed != null ? Number(row.speed) : prev.tracking?.speed,
                      heading: row.heading != null ? Number(row.heading) : prev.tracking?.heading,
                      last_update: row.created_at || new Date().toISOString(),
                    }
                  } as any;
                });
              } catch (e) {
                console.warn('Realtime tracking update error', e);
              }
            }
          )
          .subscribe((status) => {
            // Optionnel: console.log('Realtime status', status)
          });
      }, 250);
    }

    return () => {
      clearInterval(interval);
      if (channel) supabase.removeChannel(channel);
    };
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg">Chargement du suivi...</span>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erreur de suivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || 'Aucune donnée de suivi disponible'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normaliser les données (timestamps et types numériques)
  const lastUpdate = trackingData.tracking?.last_update 
    || (trackingData as any).lastUpdate 
    || (trackingData.tracking as any)?.created_at 
    || undefined;
  const lat = trackingData.tracking?.latitude != null ? Number(trackingData.tracking.latitude) : undefined;
  const lng = trackingData.tracking?.longitude != null ? Number(trackingData.tracking.longitude) : undefined;

  const missions: MissionWithTracking[] = [{
    ...trackingData.mission,
    status: trackingData.mission.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    pickup_date: undefined,
    delivery_date: undefined,
    created_by: '', // Not needed for public view
    driver_id: undefined,
    tracking: (lat != null && lng != null) ? {
      mission_id: trackingData.mission.id,
      driver_id: undefined,
      latitude: lat,
      longitude: lng,
      last_update: lastUpdate as string | undefined,
      status: trackingData.mission.status,
      speed: trackingData.tracking?.speed != null ? Number(trackingData.tracking.speed) : undefined,
      heading: trackingData.tracking?.heading != null ? Number(trackingData.tracking.heading) : undefined,
    } : undefined,
    driver_profile: null
  }];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Suivi de Mission
          </h1>
          <p className="text-muted-foreground text-lg">
            {trackingData.mission.reference} - {trackingData.mission.title}
          </p>
        </div>

        {/* Carte de suivi */}
        <div className="mb-8">
          <Card className="border-0 shadow-2xl bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Position en Temps Réel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MapboxMap 
                missions={missions}
                height="400px"
              />
            </CardContent>
          </Card>
        </div>

        {/* Informations de la mission */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Détails de la Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Statut</span>
                <Badge className={`${getStatusColor(trackingData.mission.status)} text-white`}>
                  {getStatusLabel(trackingData.mission.status)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Enlèvement</p>
                    <p className="text-sm text-muted-foreground">
                      {trackingData.mission.pickup_address}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Livraison</p>
                    <p className="text-sm text-muted-foreground">
                      {trackingData.mission.delivery_address}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {trackingData.tracking && (
            <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Position Actuelle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Vitesse</p>
                    <p className="text-lg font-semibold">
                      {trackingData.tracking.speed || 0} km/h
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Direction</p>
                    <p className="text-lg font-semibold">
                      {trackingData.tracking.heading || 0}°
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Dernière mise à jour: {' '}
                  {new Date(trackingData.tracking.last_update).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}