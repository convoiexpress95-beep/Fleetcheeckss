import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useVehicleModels = () => {
  return useQuery({
    queryKey: ['vehicle_models'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_models')
        .select('*')
        .order('make', { ascending: true })
        .order('model', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
};
