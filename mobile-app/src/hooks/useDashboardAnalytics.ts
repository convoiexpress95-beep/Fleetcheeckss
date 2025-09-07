import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export const useWeeklyMissions = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['weekly-missions', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [
          { week: 'S-6', missions: 2, completed: 1, pending: 1, inProgress: 0 },
          { week: 'S-5', missions: 3, completed: 2, pending: 0, inProgress: 1 },
          { week: 'S-4', missions: 1, completed: 1, pending: 0, inProgress: 0 },
          { week: 'S-3', missions: 4, completed: 2, pending: 1, inProgress: 1 },
          { week: 'S-2', missions: 2, completed: 1, pending: 0, inProgress: 1 },
          { week: 'S-1', missions: 3, completed: 1, pending: 1, inProgress: 1 },
          { week: 'Semaine actuelle', missions: 5, completed: 2, pending: 2, inProgress: 1 },
        ];
      }

      const sevenWeeksAgo = new Date();
      sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49);
      const { data: missions, error } = await supabase
        .from('missions')
        .select('created_at, status')
        .or(`created_by.eq.${user.id},donor_id.eq.${user.id},driver_id.eq.${user.id}`)
        .gte('created_at', sevenWeeksAgo.toISOString());
      if (error) throw error;

      const weeklyData: any[] = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (i * 7 + today.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const weekMissions = (missions || []).filter((m: any) => {
          const dt = new Date(m.created_at);
          return dt >= weekStart && dt <= weekEnd;
        });
        weeklyData.push({
          week: `S${i === 0 ? 'emaine actuelle' : `-${i}`}`,
          missions: weekMissions.length,
          completed: weekMissions.filter((m: any) => m.status === 'completed').length,
          pending: weekMissions.filter((m: any) => m.status === 'pending').length,
          inProgress: weekMissions.filter((m: any) => m.status === 'in_progress').length,
        });
      }
      return weeklyData;
    },
    enabled: true,
  });
};

export const useTopDrivers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['top-drivers', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [
          { name: 'Marc Conducteur', email: 'marc@driver.fr', totalMissions: 12, completedMissions: 11, successRate: 92 },
          { name: 'Sophie Transport', email: 'sophie@transport.fr', totalMissions: 8, completedMissions: 7, successRate: 88 },
          { name: 'Pierre Routier', email: 'pierre@routier.fr', totalMissions: 6, completedMissions: 5, successRate: 83 },
        ];
      }
      const { data: missions, error } = await supabase
        .from('missions')
        .select('driver_id, status')
        .or(`created_by.eq.${user.id},donor_id.eq.${user.id}`)
        .not('driver_id', 'is', null);
      if (error) throw error;
      const driverIds = Array.from(new Set((missions || []).map((m: any) => m.driver_id).filter(Boolean)));
      if (driverIds.length === 0) return [];
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', driverIds);
      if (pErr) throw pErr;
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
      const statsMap = new Map<string, any>();
      (missions || []).forEach((m: any) => {
        if (!m.driver_id) return;
        const driverId = m.driver_id as string;
        if (!statsMap.has(driverId)) {
          const prof = profileMap.get(driverId);
          statsMap.set(driverId, {
            name: prof?.full_name || prof?.email?.split('@')[0] || 'Convoyeur',
            email: prof?.email || '',
            totalMissions: 0,
            completedMissions: 0,
            successRate: 0,
          });
        }
        const s = statsMap.get(driverId);
        s.totalMissions++;
        if (m.status === 'completed') s.completedMissions++;
        s.successRate = Math.round((s.completedMissions / s.totalMissions) * 100);
      });
      return Array.from(statsMap.values()).sort((a, b) => b.completedMissions - a.completedMissions).slice(0, 5);
    },
    enabled: true,
  });
};
