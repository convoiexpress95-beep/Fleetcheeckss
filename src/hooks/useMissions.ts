import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// NOTE: Ce fichier est revenu à la version fonctionnelle précédente. Les any seront traités plus tard.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';
import { useEffect } from 'react';

export const useMissions = (filters: any = {}, page = 0, pageSize = 10) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['missions', user?.id, filters, page, pageSize],
  queryFn: async () => {
      if (!user?.id) {
        // Return demo data when not authenticated
  const demoMissions = [
          {
            id: 'demo-1',
            title: 'Transport véhicule de collection',
            reference: 'REF-2025-001',
            description: 'Transport d\'une Porsche 911 de 1973 de Paris à Nice pour exposition',
            pickup_address: '123 rue de Rivoli, 75001 Paris',
            delivery_address: '456 Promenade des Anglais, 06000 Nice',
            pickup_date: '2025-01-15T09:00:00+01:00',
            delivery_date: '2025-01-16T17:00:00+01:00',
            pickup_contact_name: 'Jean Dupont',
            pickup_contact_phone: '01.23.45.67.89',
            pickup_contact_email: 'j.dupont@email.fr',
            delivery_contact_name: 'Marie Leclerc',
            delivery_contact_phone: '04.93.87.65.43',
            delivery_contact_email: 'm.leclerc@nice.fr',
            vehicle_type: 'Porte-voiture',
            vehicle_brand: 'Iveco',
            vehicle_model_name: 'Daily',
            vehicle_body_type: 'utilitaire',
            vehicle_image_path: null,
            license_plate: 'AB-123-CD',
            donor_earning: 800.00,
            driver_earning: 600.00,
            status: 'pending',
            created_at: '2025-01-10T10:00:00Z',
            updated_at: '2025-01-10T10:00:00Z',
            created_by: 'demo-user',
            donor_id: 'demo-user',
            driver_id: null,
            donor_profile: { full_name: 'Jean Dupont', email: 'jean.dupont@demo.fr' },
            driver_profile: null,
            creator_profile: { full_name: 'Demo User', email: 'demo@convoiexpress.fr' }
          },
          {
            id: 'demo-2',
            title: 'Livraison urgente pièces détachées',
            reference: 'REF-2025-002',
            description: 'Transport urgent de pièces détachées automobiles',
            pickup_address: '789 Zone Industrielle, 69100 Villeurbanne',
            delivery_address: '321 rue de l\'Industrie, 13000 Marseille',
            pickup_date: '2025-01-10T08:00:00+01:00',
            delivery_date: '2025-01-10T18:00:00+01:00',
            pickup_contact_name: 'Pierre Garage',
            pickup_contact_phone: '04.78.12.34.56',
            pickup_contact_email: 'p.garage@auto.fr',
            delivery_contact_name: 'Sophie Mécaniques',
            delivery_contact_phone: '04.91.23.45.67',
            delivery_contact_email: 's.mecaniques@pieces.fr',
            vehicle_type: 'Fourgon',
            vehicle_brand: 'Renault',
            vehicle_model_name: 'Master',
            vehicle_body_type: 'utilitaire',
            vehicle_image_path: null,
            license_plate: 'EF-456-GH',
            donor_earning: 450.00,
            driver_earning: 350.00,
            status: 'completed',
            created_at: '2025-01-08T10:00:00Z',
            updated_at: '2025-01-10T18:00:00Z',
            created_by: 'demo-user',
            donor_id: 'demo-user',
            driver_id: 'demo-driver',
            donor_profile: { full_name: 'Pierre Garage', email: 'pierre@garage.fr' },
            driver_profile: { full_name: 'Marc Conducteur', email: 'marc@driver.fr' },
            creator_profile: { full_name: 'Demo User', email: 'demo@convoiexpress.fr' }
          },
          {
            id: 'demo-3',
            title: 'Déménagement partiel',
            reference: 'REF-2025-003',
            description: 'Transport de mobilier et électroménager pour déménagement',
            pickup_address: '654 rue du Départ, 33000 Bordeaux',
            delivery_address: '987 avenue de l\'Arrivée, 31000 Toulouse',
            pickup_date: '2025-01-20T10:00:00+01:00',
            delivery_date: '2025-01-20T16:00:00+01:00',
            pickup_contact_name: 'Laurent Déménage',
            pickup_contact_phone: '05.56.78.90.12',
            pickup_contact_email: 'l.demenage@email.fr',
            delivery_contact_name: 'Isabelle Nouvelleille',
            delivery_contact_phone: '05.61.34.56.78',
            delivery_contact_email: 'i.nouvelle@toulouse.fr',
            vehicle_type: 'Camion 20m³',
            vehicle_brand: 'Mercedes',
            vehicle_model_name: 'Sprinter',
            vehicle_body_type: 'utilitaire',
            vehicle_image_path: null,
            license_plate: 'IJ-789-KL',
            donor_earning: 600.00,
            driver_earning: 500.00,
            status: 'in_progress',
            created_at: '2025-01-18T10:00:00Z',
            updated_at: '2025-01-19T10:00:00Z',
            created_by: 'demo-user',
            donor_id: 'demo-user',
            driver_id: 'demo-driver',
            donor_profile: { full_name: 'Laurent Déménage', email: 'laurent@demo.fr' },
            driver_profile: { full_name: 'Sophie Transport', email: 'sophie@transport.fr' },
            creator_profile: { full_name: 'Demo User', email: 'demo@convoiexpress.fr' }
          }
        ];

        // Apply filters to demo data
  let filteredMissions = demoMissions;
        if (filters.status && filters.status !== 'all') {
          filteredMissions = filteredMissions.filter(m => m.status === filters.status);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredMissions = filteredMissions.filter(m => 
            m.title.toLowerCase().includes(searchLower) || 
            m.reference.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        const start = page * pageSize;
        const end = start + pageSize;
        const paginatedMissions = filteredMissions.slice(start, end);

        return { data: paginatedMissions, count: filteredMissions.length };
      }

      // First get missions
      // Attempt select with join; if it fails (relation missing), fallback to simple select
  let missions: any[] | null = null;
  let count: number | null = null;
      try {
        // Requête principale avec jointure optionnelle vers vehicle_models
  let q1: any = supabase
          .from('missions')
          .select(`*, vehicle_model:vehicle_models!missions_vehicle_model_id_fkey(id, make, model, body_type, generation, image_path)`, { count: 'exact' }) // join vehicle model
          .order('created_at', { ascending: false });
        if (filters.status && filters.status !== 'all') q1 = q1.eq('status', filters.status);
        if (filters.kind) q1 = q1.eq('kind', filters.kind);
        if (filters.vehicleGroup && filters.vehicleGroup !== 'all') {
          const groupLists: Record<string, string[]> = {
            leger: ['berline','suv','hatchback','break','monospace','moto','autre'],
            utilitaire: ['utilitaire','pickup'],
            poids_lourd: ['camion'],
          };
          const arr = groupLists[filters.vehicleGroup] || [];
          if (arr.length) {
            const inList = `(${arr.map(v => `"${v}"`).join(',')})`;
            q1 = q1.or(`vehicle_body_type.in.${inList},vehicle_model.body_type.in.${inList}`);
          }
        }
        // Text search (optional)
        if (filters.search) q1 = q1.or(`title.ilike.%${filters.search}%,reference.ilike.%${filters.search}%`);
        // City filters
        if (filters.departCity) q1 = q1.ilike('pickup_address', `%${filters.departCity}%`);
        if (filters.arrivalCity) q1 = q1.ilike('delivery_address', `%${filters.arrivalCity}%`);
        // Date filter (pickup_date in selected day)
        if (filters.pickupDate) {
          const start = new Date(filters.pickupDate + 'T00:00:00');
          const end = new Date(start); end.setDate(end.getDate() + 1);
          q1 = q1.gte('pickup_date', start.toISOString()).lt('pickup_date', end.toISOString());
        }
        // Service type: convoyage vs transport
        if (filters.serviceType === 'convoyage') q1 = q1.eq('requirement_convoyeur', true);
        if (filters.serviceType === 'transport') q1 = q1.eq('requirement_transporteur_plateau', true);
        const res1 = await q1.range(page * pageSize, (page + 1) * pageSize - 1);
        if (res1.error) throw res1.error;
  missions = res1.data || [];
  count = (res1 as any).count ?? null;
      } catch (_e) {
        // Fallback sans jointure si la relation n'existe pas encore
  let q2: any = supabase
    .from('missions')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (filters.status && filters.status !== 'all') q2 = q2.eq('status', filters.status);
  if (filters.kind) q2 = q2.eq('kind', filters.kind);
        if (filters.vehicleGroup && filters.vehicleGroup !== 'all') {
          const groupLists: Record<string, string[]> = {
            leger: ['berline','suv','hatchback','break','monospace','moto','autre'],
            utilitaire: ['utilitaire','pickup'],
            poids_lourd: ['camion'],
          };
          const arr = groupLists[filters.vehicleGroup] || [];
          if (arr.length) q2 = q2.in('vehicle_body_type', arr as string[]);
        }
        if (filters.search) q2 = q2.or(`title.ilike.%${filters.search}%,reference.ilike.%${filters.search}%`);
        if (filters.departCity) q2 = q2.ilike('pickup_address', `%${filters.departCity}%`);
        if (filters.arrivalCity) q2 = q2.ilike('delivery_address', `%${filters.arrivalCity}%`);
        if (filters.pickupDate) {
          const start = new Date(filters.pickupDate + 'T00:00:00');
          const end = new Date(start); end.setDate(end.getDate() + 1);
          q2 = q2.gte('pickup_date', start.toISOString()).lt('pickup_date', end.toISOString());
        }
        if (filters.serviceType === 'convoyage') q2 = q2.eq('requirement_convoyeur', true);
        if (filters.serviceType === 'transport') q2 = q2.eq('requirement_transporteur_plateau', true);
        const res2 = await q2.range(page * pageSize, (page + 1) * pageSize - 1);
        if (res2.error) throw res2.error;
  missions = res2.data || [];
  count = (res2 as any).count ?? null;
      }

      // Then get profile information for each mission
    const enrichedMissions = await Promise.all(
  (missions || []).map(async (mission) => {
          const profileQueries = [];

          // Get donor profile
          if (mission.donor_id) {
            profileQueries.push(
              supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('user_id', mission.donor_id)
                .maybeSingle()
                .then(({ data }) => ({ donor_profile: data }))
            );
          } else {
            profileQueries.push(Promise.resolve({ donor_profile: null }));
          }

          // Get driver profile
          if (mission.driver_id) {
            profileQueries.push(
              supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('user_id', mission.driver_id)
                .maybeSingle()
                .then(({ data }) => ({ driver_profile: data }))
            );
          } else {
            profileQueries.push(Promise.resolve({ driver_profile: null }));
          }

          // Get creator profile
          if (mission.created_by) {
            profileQueries.push(
              supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('user_id', mission.created_by)
                .maybeSingle()
                .then(({ data }) => ({ creator_profile: data }))
            );
          } else {
            profileQueries.push(Promise.resolve({ creator_profile: null }));
          }

          const profiles = await Promise.all(profileQueries);
          
          return {
            ...mission,
            ...profiles[0], // donor_profile
            ...profiles[1], // driver_profile  
            ...profiles[2], // creator_profile
          };
        })
      );

      return { data: enrichedMissions, count: count || 0 };
    },
    enabled: true, // Always enabled to show demo data
  });

  useEffect(() => {
    if (!user?.id) return;
    // Filtre par acteur (created_by ou driver_id) pour limiter le trafic
    const channel = supabase
      .channel('missions-realtime-web')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'missions',
        filter: `created_by=eq.${user.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['missions'] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'missions',
        filter: `driver_id=eq.${user.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['missions'] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return query;
};

export const useMission = (id: string) => {
  return useQuery({
    queryKey: ['mission', id],
    queryFn: async () => {
      // Get mission
      const { data: mission, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Get related profiles
      const profilePromises = [];
      
  if (mission.donor_id) {
        profilePromises.push(
          supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('user_id', mission.donor_id)
    .maybeSingle()
            .then(({ data }) => ({ donor_profile: data }))
        );
      } else {
        profilePromises.push(Promise.resolve({ donor_profile: null }));
      }

  if (mission.driver_id) {
        profilePromises.push(
          supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('user_id', mission.driver_id)
    .maybeSingle()
            .then(({ data }) => ({ driver_profile: data }))
        );
      } else {
        profilePromises.push(Promise.resolve({ driver_profile: null }));
      }

  if (mission.created_by) {
        profilePromises.push(
          supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('user_id', mission.created_by)
    .maybeSingle()
            .then(({ data }) => ({ creator_profile: data }))
        );
      } else {
        profilePromises.push(Promise.resolve({ creator_profile: null }));
      }

      const profiles = await Promise.all(profilePromises);
      
      return {
        ...mission,
        ...profiles[0],
        ...profiles[1], 
        ...profiles[2],
      };
    },
    enabled: !!id,
  });
};

export const useCreateMission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (mission: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Consommer un crédit pour créer une mission
      const { data: creditResult, error: creditError } = await supabase
        .rpc('consume_credit', {
          _user_id: user.id,
          _mission_id: null,
          _credits: 1,
          _type: 'mission_creation',
          _description: 'Création d\'une mission'
        });

      if (creditError || !creditResult) {
        throw new Error('Crédits insuffisants. Rechargez votre compte pour créer une nouvelle mission.');
      }

      // Generate unique reference
      const reference = `MISSION-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const { data, error } = await supabase
        .from('missions')
        .insert({
          ...mission,
          // champ kind supprimé (plus de marketplace)
          reference,
          created_by: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // On laisse la version optimiste et on invalide pour rafraîchir les autres pages
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast({
        title: "Mission créée",
        description: "La mission a été créée avec succès",
      });
    },
    onMutate: async (newMission: any) => {
      if (!user?.id) return;
      await queryClient.cancelQueries({ queryKey: ['missions'] });
      const previous = queryClient.getQueriesData({ queryKey: ['missions'] });
      // Insertion optimiste en tête
      previous.forEach(([key, value]) => {
        if (!value) return;
        queryClient.setQueryData(key, (old: any) => {
          if (!old) return old;
          const optimisticMission = {
            id: 'optimistic-' + Date.now(),
            reference: 'PENDING',
            created_by: user.id,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            donor_profile: { full_name: 'Moi', email: user.email },
            driver_profile: null,
            creator_profile: { full_name: 'Moi', email: user.email },
            ...newMission,
          };
          return { ...old, data: [optimisticMission, ...(old.data||[])] };
        });
      });
      return { previous };
    },
    onError: (error: any, _newMission, context: any) => {
      context?.previous?.forEach(([key, val]: any) => queryClient.setQueryData(key, val));
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    }
  });
};

export const useUpdateMission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['mission'] });
      toast({
        title: "Mission mise à jour",
        description: "La mission a été mise à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast({
        title: "Mission supprimée",
        description: "La mission a été supprimée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useArchiveMission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('missions')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast({
        title: "Mission archivée",
        description: "La mission a été archivée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAssignMission = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, driverId }: { id: string; driverId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('missions')
        .update({ 
          driver_id: driverId,
          status: 'in_progress'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast({
        title: "Mission assignée",
        description: "La mission a été assignée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};