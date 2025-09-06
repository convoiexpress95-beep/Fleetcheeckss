import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Navigation, Clock, Zap, Battery, Signal } from 'lucide-react';
import { useNativeGeolocation } from '@/hooks/useNativeGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface NativeMissionTrackingProps {
  missionId: string;
  isActive?: boolean;
}

export const NativeMissionTracking = ({ missionId, isActive = false }: NativeMissionTrackingProps) => {
  const { user } = useAuth();
  const {
    isNative,
    position,
    isTracking,
    error,
    startTracking,
    stopTracking,
  } = useNativeGeolocation();
  
  const [trackingStats, setTrackingStats] = useState({
    duration: 0,
    distance: 0,
    points: 0,
    lastUpdate: null as Date | null,
  });
  
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  // Calculer la distance entre deux points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Sauvegarder la position en base de données
  const saveTrackingPoint = async (position: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('mission_tracking')
        .insert({
          mission_id: missionId,
          driver_id: user.id,
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed,
          heading: position.heading,
          battery_level: batteryLevel,
        });

      if (error) {
        console.error('Error saving tracking point:', error);
      }
    } catch (error) {
      console.error('Error saving tracking point:', error);
    }
  };

  // Démarrer le suivi
  const handleStartTracking = async () => {
    if (!isActive) {
      toast({
        title: 'Mission inactive',
        description: 'Vous devez d\'abord activer la mission',
        variant: 'destructive',
      });
      return;
    }

    await startTracking((position) => {
      // Sauvegarder le point de tracking
      saveTrackingPoint(position);

      // Calculer les statistiques
      if (lastPositionRef.current) {
        const distance = calculateDistance(
          lastPositionRef.current.lat,
          lastPositionRef.current.lng,
          position.latitude,
          position.longitude
        );
        setTrackingStats(prev => ({
          ...prev,
          distance: prev.distance + distance,
          points: prev.points + 1,
          lastUpdate: new Date(),
        }));
      }

      lastPositionRef.current = {
        lat: position.latitude,
        lng: position.longitude,
      };
    });

    // Démarrer le compteur de durée
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      setTrackingStats(prev => ({
        ...prev,
        duration: Math.floor((Date.now() - startTime) / 1000),
      }));
    }, 1000);

    toast({
      title: 'Suivi démarré',
      description: 'Le GPS suit maintenant votre position',
    });
  };

  // Arrêter le suivi
  const handleStopTracking = async () => {
    await stopTracking();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    toast({
      title: 'Suivi arrêté',
      description: 'Le suivi GPS a été arrêté',
    });
  };

  // Nettoyer les intervals à la destruction du composant
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Obtenir le niveau de batterie (simulation)
  useEffect(() => {
    const getBatteryLevel = async () => {
      try {
        // @ts-ignore - Battery API peut ne pas être disponible
        const battery = await navigator.getBattery?.();
        if (battery) {
          setBatteryLevel(Math.round(battery.level * 100));
        }
      } catch (error) {
        // Simulation pour les plateformes sans API batterie
        setBatteryLevel(Math.floor(Math.random() * 40) + 60);
      }
    };

    getBatteryLevel();
  }, []);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isNative) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Le suivi GPS natif n'est disponible que sur mobile
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Suivi GPS Natif
            </span>
            <Badge variant={isTracking ? 'default' : 'secondary'}>
              {isTracking ? 'Actif' : 'Inactif'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Suivi GPS haute précision pour votre mission
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex gap-2">
            {!isTracking ? (
              <Button onClick={handleStartTracking} className="flex-1">
                <Zap className="w-4 h-4 mr-2" />
                Démarrer le suivi
              </Button>
            ) : (
              <Button onClick={handleStopTracking} variant="destructive" className="flex-1">
                <Clock className="w-4 h-4 mr-2" />
                Arrêter le suivi
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          {isTracking && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{formatDuration(trackingStats.duration)}</p>
                <p className="text-sm text-muted-foreground">Durée</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{trackingStats.distance.toFixed(2)} km</p>
                <p className="text-sm text-muted-foreground">Distance</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{trackingStats.points}</p>
                <p className="text-sm text-muted-foreground">Points GPS</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {position?.speed ? `${(position.speed * 3.6).toFixed(0)} km/h` : '0 km/h'}
                </p>
                <p className="text-sm text-muted-foreground">Vitesse</p>
              </div>
            </div>
          )}

          {/* Device Info */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              <span className="text-sm">Batterie</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={batteryLevel || 0} className="w-16" />
              <span className="text-sm">{batteryLevel || '?'}%</span>
            </div>
          </div>

          {position && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Signal className="h-4 w-4" />
                <span className="text-sm">Précision GPS</span>
              </div>
              <Badge variant="outline">
                ±{position.accuracy?.toFixed(0) || '?'}m
              </Badge>
            </div>
          )}

          {/* Current Position */}
          {position && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Position actuelle</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Lat: {position.latitude.toFixed(6)}<br />
                Lng: {position.longitude.toFixed(6)}
              </p>
              {trackingStats.lastUpdate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Mise à jour: {trackingStats.lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};