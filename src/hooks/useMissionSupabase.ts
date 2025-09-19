import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';
import { instrumentDbQuery } from '@/lib/dbTracer';

export type ViewMode = 'list' | 'kanban';

export interface SupabaseMission {
  id: string;
  created_by: string;
  titre: string;
  description?: string;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  prix_propose?: number;
  statut?: 'ouverte' | 'en_negociation' | 'attribuee' | 'terminee' | 'annulee';
  vehicule_requis?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MissionFiltersState {
  search: string;
  status: string[];
  client: string[];
  dateFrom?: string;
  dateTo?: string;
}

// Type insertion (sans champs générés côté DB)
export type InsertSupabaseMission = {
  titre: string;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  description?: string;
  prix_propose?: number;
  vehicule_requis?: string;
  statut?: 'ouverte' | 'en_negociation' | 'attribuee' | 'terminee' | 'annulee';
};

const RTC_DEBUG = import.meta.env.VITE_RTC_DEBUG === '1';

export function useMissionSupabase() {
  const [missions, setMissions] = useState<SupabaseMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<MissionFiltersState>({ 
    search: '', 
    status: [], 
    client: []
  });
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{field: 'created_at'|'updated_at'|'statut'; dir: 'asc'|'desc'}>({
    field:'created_at', 
    dir:'desc'
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const pageSize = 20;

  // Charger les missions depuis Supabase
  const loadMissions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await instrumentDbQuery('missions-select', () =>
        supabase
          .from('marketplace_missions')
          .select('*')
          .order(sort.field, { ascending: sort.dir === 'asc' })
      );

      if (error) throw error;
      
      if (RTC_DEBUG) console.log('[RTC] Missions loaded:', data);
      setMissions(data || []);
    } catch (error: any) {
      console.error('Error loading missions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les missions',
        variant: 'destructive'
      });
      // Données de fallback en cas d'erreur
      setMissions([
        {
          id: 'fallback-1',
          created_by: user?.id || 'unknown',
          titre: 'Mission Paris-Lyon',
          statut: 'ouverte',
          ville_depart: 'Paris',
          ville_arrivee: 'Lyon',
          date_depart: new Date().toISOString(),
          prix_propose: 850,
          vehicule_requis: 'VL',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [sort.field, sort.dir, toast]);

  // Charger les données au montage et configurer realtime
  useEffect(() => {
    if (!user) return;

    loadMissions();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('missions-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketplace_missions'
      }, (payload) => {
        if (RTC_DEBUG) console.log('[RTC] Mission change:', payload);
        
        if (payload.eventType === 'INSERT') {
          setMissions(prev => [payload.new as SupabaseMission, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setMissions(prev => prev.map(mission => 
            mission.id === payload.new.id ? { ...mission, ...payload.new } : mission
          ));
        } else if (payload.eventType === 'DELETE') {
          setMissions(prev => prev.filter(mission => mission.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadMissions]);

  // Filtrage et tri
  const filtered = useMemo(() => {
    return missions.filter(mission => {
      const matchesSearch = !filters.search || [
        mission.titre,
        mission.ville_depart,
        mission.ville_arrivee,
        mission.vehicule_requis
      ].some(field => 
        field?.toLowerCase().includes(filters.search.toLowerCase())
      );

      const matchesStatus = filters.status.length === 0 || filters.status.includes(mission.statut || '');
      const matchesClient = filters.client.length === 0; // Pas de client_name dans le schéma

      const matchesDate = (!filters.dateFrom || (mission.created_at && mission.created_at >= filters.dateFrom)) && 
        (!filters.dateTo || (mission.created_at && mission.created_at <= filters.dateTo));

      return matchesSearch && matchesStatus && matchesClient && matchesDate;
    });
  }, [missions, filters]);

  const pageCount = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  // Actions CRUD
  const addMission = useCallback(async (missionData: {
    titre: string;
    ville_depart: string;
    ville_arrivee: string;
    date_depart: string;
    description?: string;
    prix_propose?: number;
    vehicule_requis?: string;
    statut?: 'ouverte' | 'en_negociation' | 'attribuee' | 'terminee' | 'annulee';
  }) => {
    if (!user) return;

    try {
      const { data, error } = await instrumentDbQuery('mission-insert', () =>
        supabase
          .from('marketplace_missions')
          .insert([{ ...missionData, created_by: user.id, statut: missionData.statut || 'ouverte' }])
          .select()
          .single()
      );

      if (error) throw error;
      
      toast({
        title: 'Mission créée',
        description: 'La mission a été créée avec succès'
      });

      // Pas besoin de mettre à jour l'état, le realtime s'en charge
    } catch (error: any) {
      console.error('Error creating mission:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer la mission',
        variant: 'destructive'
      });
    }
  }, [toast, user]);

  const updateMissionStatus = useCallback(async (id: string, statut: 'ouverte' | 'en_negociation' | 'attribuee' | 'terminee' | 'annulee') => {
    try {
      const { error } = await instrumentDbQuery('mission-update-status', () =>
        supabase
          .from('marketplace_missions')
          .update({ statut, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      if (error) throw error;
      
      toast({
        title: 'Mission mise à jour',
        description: 'Le statut de la mission a été modifié'
      });
    } catch (error: any) {
      console.error('Error updating mission:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier la mission',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const removeMission = useCallback(async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette mission ?')) return;

    try {
      const { error } = await instrumentDbQuery('mission-delete', () =>
        supabase
          .from('marketplace_missions')
          .delete()
          .eq('id', id)
      );

      if (error) throw error;
      
      toast({
        title: 'Mission supprimée',
        description: 'La mission a été supprimée avec succès'
      });
    } catch (error: any) {
      console.error('Error deleting mission:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de supprimer la mission',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const toggleSort = useCallback((field: 'created_at'|'updated_at'|'statut') => {
    setSort(prev => ({
      field,
      dir: prev.field === field ? (prev.dir === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  }, []);

  return {
    missions,
    loading,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    page,
    setPage,
    pageItems,
    pageCount,
    addMission,
    updateMissionStatus,
    removeMission,
    filtered,
    sort,
    toggleSort,
    loadMissions
  };
}