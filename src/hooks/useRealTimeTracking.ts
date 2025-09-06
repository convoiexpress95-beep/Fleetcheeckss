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
      const { data, error } = await supabase
        .from('missions')
        .select(`
          id,
          reference,
          title,
          description,
          pickup_address,
          delivery_address,
          pickup_date,
          delivery_date,
          status,
          driver_id,
          created_by
        `)
        .or(`created_by.eq.${user.id},donor_id.eq.${user.id},driver_id.eq.${user.id}`)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const missionsWithTracking: MissionWithTracking[] = (data || []).map(mission => ({
        ...mission,
        status: mission.status as 'pending' | 'in_progress' | 'completed' | 'cancelled',
        driver_profile: null, // Will be loaded separately if needed
        tracking: null // sera mis à jour par le chargement initial + abonnement temps réel
      }));

      setMissions(missionsWithTracking);
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
  const updateMissionStatus = async (missionId: string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('missions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', missionId);

      if (error) throw error;

      setMissions(prev => prev.map(m => 
        m.id === missionId 
          ? { ...m, status }
          : m
      ));

      return true;
    } catch (err) {
      console.error('Error updating mission status:', err);
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