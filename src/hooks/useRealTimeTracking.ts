import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TrackingData {
  mission_id: string;
  driver_id?: string;
  latitude?: number;
  longitude?: number;
  last_update: string;
  status: string;
  speed?: number;
  heading?: number;
}

export interface MissionWithTracking {
  id: string;
  reference: string;
  title: string;
  description?: string;
  pickup_address: string;
  delivery_address: string;
  pickup_date?: string;
  delivery_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  driver_id?: string;
  created_by: string;
  tracking?: TrackingData;
  driver_profile?: {
    full_name: string;
    email: string;
  } | null;
}

export const useRealTimeTracking = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<MissionWithTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les missions avec tracking
  const loadMissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Vue SQL "missions_simplified" non déclarée dans les types générés => cast any
      // Tentative via la vue simplifiée
      const { data, error } = await (supabase as any)
        .from('missions_simplified')
        .select(`
          id,reference,title,description,pickup_address,delivery_address,pickup_date,delivery_date,raw_status,ui_status,driver_id,created_by,donor_id,created_at
        `)
        .or(`created_by.eq.${user.id},donor_id.eq.${user.id},driver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      let missionsWithTracking: MissionWithTracking[] = [];

      if (error) {
        // Si la vue n'existe pas encore (migrations non appliquées en local) => fallback table missions
        // Code PostgREST: PGRST205 table not found (schema cache)
        if ((error as any).code === 'PGRST205') {
          console.warn('[missions_simplified] Vue absente - fallback sur table missions');
          const { data: baseData, error: baseErr } = await supabase
            .from('missions')
            .select(`
              id,reference,title,description,pickup_address,delivery_address,pickup_date,delivery_date,status,driver_id,created_by,donor_id,created_at
            `)
            .or(`created_by.eq.${user.id},donor_id.eq.${user.id},driver_id.eq.${user.id}`)
            .order('created_at', { ascending: false });
          if (baseErr) throw baseErr;
          const mapRawToUi = (s: string | null | undefined): MissionWithTracking['status'] => {
            switch (s) {
              case 'draft':
              case 'published':
              case 'assigned':
                return 'pending';
              case 'picked_up':
              case 'in_transit':
              case 'delivered':
                return 'in_progress';
              case 'completed':
                return 'completed';
              case 'cancelled':
                return 'cancelled';
              default:
                return 'pending';
            }
          };
          missionsWithTracking = (baseData || []).map((m: any) => ({
            id: m.id,
            reference: m.reference,
            title: m.title,
            description: m.description,
            pickup_address: m.pickup_address,
            delivery_address: m.delivery_address,
            pickup_date: m.pickup_date,
            delivery_date: m.delivery_date,
            status: mapRawToUi(m.status),
            driver_id: m.driver_id,
            created_by: m.created_by,
            tracking: null,
            driver_profile: null,
          }));
        } else {
          throw error;
        }
      } else {
        missionsWithTracking = (data || []).map((mission: any) => ({
          id: mission.id,
          reference: mission.reference,
          title: mission.title,
          description: mission.description,
          pickup_address: mission.pickup_address,
          delivery_address: mission.delivery_address,
          pickup_date: mission.pickup_date,
          delivery_date: mission.delivery_date,
          status: (mission.ui_status || 'pending') as MissionWithTracking['status'],
          driver_id: mission.driver_id,
          created_by: mission.created_by,
          tracking: null,
          driver_profile: null,
        }));
      }

  // Ne garder que les missions "en cours" (ui_status = in_progress)
  const inProgress = missionsWithTracking.filter(m => m.status === 'in_progress');
  setMissions(inProgress);
      // Charger les derniers points de tracking pour ces missions (initial state)
      const missionIds = missionsWithTracking.map(m => m.id);
      if (missionIds.length) {
        const { data: tracks, error: trackErr } = await supabase
          .from('mission_tracking')
          .select('mission_id, driver_id, latitude, longitude, speed, heading, created_at')
          .in('mission_id', missionIds)
          .order('created_at', { ascending: false });
        if (!trackErr && tracks) {
          const latestByMission = new Map<string, any>();
          for (const t of tracks) {
            if (!latestByMission.has(t.mission_id)) {
              latestByMission.set(t.mission_id, t);
            }
          }
          setMissions(prev => prev.map(m => {
            const t = latestByMission.get(m.id);
            if (!t) return m;
            return {
              ...m,
              tracking: {
                mission_id: m.id,
                driver_id: t.driver_id || m.driver_id,
                latitude: t.latitude,
                longitude: t.longitude,
                last_update: t.created_at,
                status: m.status,
                speed: t.speed ?? undefined,
                heading: t.heading ?? undefined,
              },
            };
          }));
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error loading missions:', err);
      setError('Erreur lors du chargement des missions');
    } finally {
      setLoading(false);
    }
  };

  // Abonnement Realtime aux inserts de mission_tracking
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('realtime:mission_tracking')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mission_tracking',
        },
        (payload: any) => {
          const row = payload.new;
          if (!row?.mission_id) return;
          setMissions(prev => prev.map(m => {
            if (m.id !== row.mission_id) return m;
            return {
              ...m,
              tracking: {
                mission_id: row.mission_id,
                driver_id: row.driver_id ?? m.driver_id,
                latitude: row.latitude,
                longitude: row.longitude,
                last_update: row.created_at,
                status: m.status,
                speed: row.speed ?? undefined,
                heading: row.heading ?? undefined,
              },
            };
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Mettre à jour le statut d'une mission
  const updateMissionStatus = async (missionId: string, status: MissionWithTracking['status']) => {
    if (!user) return false;

    // Dans le modèle "statut virtuel" (pas de colonne status physique),
    // on ne persiste pas ce changement côté DB car la vue le dérive d'autres événements.
    // On applique donc seulement une MAJ optimiste locale.
    try {
      // TODO: si plus tard une colonne réelle est ajoutée, réintroduire le mapping UI->raw ici.
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, status } : m));
      return true;
    } catch (err) {
      console.error('Error updating mission status (virtual mode):', err);
      return false;
    }
  };

  // Calculer l'ETA basé sur la position actuelle
  const calculateETA = (tracking: TrackingData | null | undefined, deliveryAddress: string): string => {
    if (!tracking || !tracking.latitude || !tracking.longitude) {
      return 'N/A';
    }

    // Calcul simplifié - dans un vrai système, utiliser Google Directions API
    const avgSpeed = tracking.speed || 50; // km/h
    const estimatedDistance = Math.random() * 200 + 50; // km simulé
    const eta = estimatedDistance / avgSpeed; // heures
    
    const now = new Date();
    now.setHours(now.getHours() + eta);
    
    return now.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  useEffect(() => {
    loadMissions();
  }, [user]);

  // Pas de simulation auto; l'alimentation vient d'Expo (mission_tracking)

  return {
    missions,
    loading,
    error,
    loadMissions,
    updateMissionStatus,
    calculateETA,
  };
};