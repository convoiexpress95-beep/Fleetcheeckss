import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';

export interface Report {
  id: string;
  user_id: string;
  title: string;
  report_type: 'complete' | 'financial' | 'mileage' | 'inspection';
  date_from: string;
  date_to: string;
  status: 'generated' | 'available' | 'processing';
  file_url?: string | null;
  missions_count: number;
  total_revenue: number;
  total_km?: number;
  fuel_costs?: number;
  net_profit: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useReports = (dateFrom?: string, dateTo?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['reports', user?.id, dateFrom, dateTo],
    queryFn: async () => {
      if (!user?.id) return [] as Report[];
      let query = supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (dateFrom) query = query.gte('date_from', dateFrom);
      if (dateTo) query = query.lte('date_to', dateTo);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Report[];
    },
    enabled: !!user?.id,
  });
};

export const useGenerateReport = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      report_type: 'complete' | 'financial' | 'mileage' | 'inspection';
      date_from: string;
      date_to: string;
      title?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: reportData, error: reportError } = await supabase.rpc('generate_report_data', {
        _user_id: user.id,
        _report_type: params.report_type,
        _date_from: params.date_from,
        _date_to: params.date_to,
      });
      if (reportError) throw reportError;

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
          metadata: reportData,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Report;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      Toast.show({ type: 'success', text1: 'Rapport généré', text2: `"${data.title}" a été créé.` });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Erreur', text2: error?.message || 'Génération impossible.' });
    },
  });
};

export const useDeleteReport = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (reportId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { error } = await supabase.from('reports').delete().eq('id', reportId).eq('user_id', user.id);
      if (error) throw error;
      return reportId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
      Toast.show({ type: 'success', text1: 'Rapport supprimé' });
    },
    onError: (error: any) => {
      Toast.show({ type: 'error', text1: 'Erreur', text2: error?.message || 'Suppression impossible.' });
    },
  });
};
