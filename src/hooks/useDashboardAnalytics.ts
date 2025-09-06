import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Hook pour récupérer les données des missions par semaine
export const useWeeklyMissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly-missions', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        // Return demo weekly data when not authenticated
        return [
          { week: 'S-6', missions: 2, completed: 1, pending: 1, inProgress: 0 },
          { week: 'S-5', missions: 3, completed: 2, pending: 0, inProgress: 1 },
          { week: 'S-4', missions: 1, completed: 1, pending: 0, inProgress: 0 },
          { week: 'S-3', missions: 4, completed: 2, pending: 1, inProgress: 1 },
          { week: 'S-2', missions: 2, completed: 1, pending: 0, inProgress: 1 },
          { week: 'S-1', missions: 3, completed: 1, pending: 1, inProgress: 1 },
          { week: 'Semaine actuelle', missions: 5, completed: 2, pending: 2, inProgress: 1 }
        ];
      }

      // Récupérer les missions des 7 dernières semaines
      const sevenWeeksAgo = new Date();
      sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);

      const { data: missions, error } = await supabase
        .from('missions')
        .select('created_at, status')
        .or(`created_by.eq.${user.id},donor_id.eq.${user.id},driver_id.eq.${user.id}`)
        .gte('created_at', sevenWeeksAgo.toISOString());

      if (error) throw error;

      // Grouper par semaine
      const weeklyData = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (i * 7 + today.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekMissions = missions?.filter(mission => {
          const missionDate = new Date(mission.created_at);
          return missionDate >= weekStart && missionDate <= weekEnd;
        }) || [];

        weeklyData.push({
          week: `S${i === 0 ? 'emaine actuelle' : `-${i}`}`,
          missions: weekMissions.length,
          completed: weekMissions.filter(m => m.status === 'completed').length,
          pending: weekMissions.filter(m => m.status === 'pending').length,
          inProgress: weekMissions.filter(m => m.status === 'in_progress').length
        });
      }

      return weeklyData;
    },
    enabled: true, // Always enabled to show demo data
  });
};

// Hook pour récupérer le top des convoyeurs
export const useTopDrivers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['top-drivers', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        // Return demo top drivers when not authenticated
        return [
          { name: 'Marc Conducteur', email: 'marc@driver.fr', totalMissions: 12, completedMissions: 11, successRate: 92 },
          { name: 'Sophie Transport', email: 'sophie@transport.fr', totalMissions: 8, completedMissions: 7, successRate: 88 },
          { name: 'Pierre Routier', email: 'pierre@routier.fr', totalMissions: 6, completedMissions: 5, successRate: 83 },
          { name: 'Julie Livraison', email: 'julie@livraison.fr', totalMissions: 4, completedMissions: 3, successRate: 75 },
          { name: 'Antoine Express', email: 'antoine@express.fr', totalMissions: 3, completedMissions: 2, successRate: 67 }
        ];
      }

      // Récupérer les missions où l'utilisateur est créateur ou donneur d'ordre
      const { data: missions, error } = await supabase
        .from('missions')
        .select('driver_id, status')
        .or(`created_by.eq.${user.id},donor_id.eq.${user.id}`)
        .not('driver_id', 'is', null);

      if (error) throw error;

      // Get unique driver IDs
      const driverIds = [...new Set(missions?.map(m => m.driver_id).filter(Boolean))];
      
      // Get driver profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', driverIds);

      if (profileError) throw profileError;

      // Create a map of profiles by user_id for quick lookup
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Grouper par convoyeur et calculer les stats
      const driverStats = new Map();

      missions?.forEach(mission => {
        if (!mission.driver_id) return;

        const driverId = mission.driver_id;
        const profile = profileMap.get(driverId);
        
        if (!driverStats.has(driverId)) {
          driverStats.set(driverId, {
            name: profile?.full_name || profile?.email?.split('@')[0] || 'Convoyeur',
            email: profile?.email || '',
            totalMissions: 0,
            completedMissions: 0,
            successRate: 0,
          });
        }

        const stats = driverStats.get(driverId);
        stats.totalMissions++;
        if (mission.status === 'completed') {
          stats.completedMissions++;
        }
        stats.successRate = Math.round((stats.completedMissions / stats.totalMissions) * 100);
      });

      // Convertir en array et trier par nombre de missions réussies
      return Array.from(driverStats.values())
        .sort((a, b) => b.completedMissions - a.completedMissions)
        .slice(0, 5); // Top 5 convoyeurs
    },
    enabled: true, // Always enabled to show demo data
  });
};