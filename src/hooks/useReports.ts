import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks';

export interface Report {
  id: string;
  user_id: string;
  title: string;
  report_type: 'complete' | 'financial' | 'mileage' | 'inspection';
  date_from: string;
  date_to: string;
  status: 'generated' | 'available' | 'processing';
  file_url?: string;
  missions_count: number;
  total_revenue: number;
  total_km?: number;
  fuel_costs?: number;
  net_profit: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  id: string;
  user_id: string;
  date: string;
  missions_count: number;
  total_revenue: number;
  total_km: number;
  fuel_costs: number;
  vehicle_costs: number;
  other_costs: number;
  net_profit: number;
  avg_mission_value: number;
  created_at: string;
  updated_at: string;
}

export const useReports = (dateFrom?: string, dateTo?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['reports', user?.id, dateFrom, dateTo],
    queryFn: async () => {
      if (!user?.id) {
        // Return demo reports when not authenticated
        return [
          {
            id: 'demo-report-1',
            user_id: 'demo-user',
            title: 'Rapport mensuel - Janvier 2025',
            report_type: 'complete' as const,
            date_from: '2025-01-01',
            date_to: '2025-01-31',
            status: 'available' as const,
            missions_count: 8,
            total_revenue: 3400,
            total_km: 2150,
            fuel_costs: 365,
            net_profit: 2435,
            file_url: null,
            metadata: {
              completedMissions: 3,
              pendingMissions: 2,
              inProgressMissions: 3,
              avgMissionValue: 425
            },
            created_at: '2025-01-31T10:00:00Z',
            updated_at: '2025-01-31T10:00:00Z'
          },
          {
            id: 'demo-report-2',
            user_id: 'demo-user',
            title: 'Rapport financier - Q4 2024',
            report_type: 'financial' as const,
            date_from: '2024-10-01',
            date_to: '2024-12-31',
            status: 'available' as const,
            missions_count: 22,
            total_revenue: 8900,
            total_km: 5800,
            fuel_costs: 890,
            net_profit: 6510,
            file_url: null,
            metadata: {
              quarterlyGrowth: 15.2,
              profitMargin: 73.1
            },
            created_at: '2025-01-02T10:00:00Z',
            updated_at: '2025-01-02T10:00:00Z'
          }
        ] as Report[];
      }

      let query = supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dateFrom) {
        query = query.gte('date_from', dateFrom);
      }
      if (dateTo) {
        query = query.lte('date_to', dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Report[];
    },
    enabled: true, // Always enabled to show demo data
  });
};

export const useAnalytics = (dateFrom?: string, dateTo?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['analytics', user?.id, dateFrom, dateTo],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      let query = supabase
        .from('analytics_data')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (dateFrom) {
        query = query.gte('date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('date', dateTo);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AnalyticsData[];
    },
    enabled: !!user?.id,
  });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      report_type: 'complete' | 'financial' | 'mileage' | 'inspection';
      date_from: string;
      date_to: string;
      title?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Generate report data using the database function
      const { data: reportData, error: reportError } = await supabase
        .rpc('generate_report_data', {
          _user_id: user.id,
          _report_type: params.report_type,
          _date_from: params.date_from,
          _date_to: params.date_to
        });

      if (reportError) throw reportError;

      // Create report record
      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          title: params.title || `Rapport ${params.report_type} ${new Date().toLocaleDateString('fr-FR')}`,
          report_type: params.report_type,
          date_from: params.date_from,
          date_to: params.date_to,
          status: 'generated',
          missions_count: (reportData as any)?.summary?.missions_count || 0,
          total_revenue: (reportData as any)?.summary?.total_revenue || 0,
          total_km: (reportData as any)?.summary?.total_km || 0,
          fuel_costs: (reportData as any)?.summary?.fuel_costs || 0,
          net_profit: (reportData as any)?.summary?.net_profit || 0,
          metadata: reportData
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Rapport généré",
        description: `Le rapport "${data.title}" a été créé avec succès.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le rapport.",
        variant: "destructive"
      });
    },
  });
};

export const useCalculateAnalytics = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (date: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .rpc('calculate_daily_analytics', {
          _user_id: user.id,
          _date: date
        });

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      toast({
        title: "Analytics calculées",
        description: "Les données analytiques ont été mises à jour.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de calculer les analytics.",
        variant: "destructive"
      });
    },
  });
};

export const useMonthlyStats = () => {
  const { user } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const firstDay = `${currentMonth}-01`;
  const nextMonth = (() => {
    const d = new Date(firstDay);
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  })();

  return useQuery({
    queryKey: ['monthly-stats', user?.id, currentMonth],
    queryFn: async () => {
      if (!user?.id) {
        // Return demo monthly stats when not authenticated
        return {
          totalMissions: 8,
          totalRevenue: '3400€',
          avgMissionValue: '425€',
          totalKm: '2150 km',
          fuelCosts: '365€',
          netProfit: '2435€'
        };
      }

      // Get current month's analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from('analytics_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDay)
        .lt('date', nextMonth);

      if (analyticsError) throw analyticsError;

      // Calculate totals
      const totalMissions = analytics?.reduce((sum, day) => sum + day.missions_count, 0) || 0;
      const totalRevenue = analytics?.reduce((sum, day) => sum + day.total_revenue, 0) || 0;
      const totalKm = analytics?.reduce((sum, day) => sum + day.total_km, 0) || 0;
      const fuelCosts = analytics?.reduce((sum, day) => sum + day.fuel_costs, 0) || 0;
      const netProfit = analytics?.reduce((sum, day) => sum + day.net_profit, 0) || 0;
      const avgMissionValue = totalMissions > 0 ? totalRevenue / totalMissions : 0;

      return {
        totalMissions,
        totalRevenue: totalRevenue.toFixed(0) + '€',
        avgMissionValue: avgMissionValue.toFixed(0) + '€',
        totalKm: totalKm.toFixed(0) + ' km',
        fuelCosts: fuelCosts.toFixed(0) + '€',
        netProfit: netProfit.toFixed(0) + '€'
      };
    },
    enabled: true, // Always enabled to show demo data
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reportId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id);

      if (error) throw error;
      return reportId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Rapport supprimé",
        description: "Le rapport a été supprimé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le rapport.",
        variant: "destructive"
      });
    },
  });
};