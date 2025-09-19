import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

export type InspectionMission = {
  id: string;
  title: string;
  reference: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  description: string;
  donor_id: string | null;
  driver_id: string | null;
  vehicle: { brand: string; model: string; plate: string };
  departure: { address: string; city: string };
  arrival: { address: string; city: string };
  inspections: { departure: boolean; arrival: boolean; gpsTracking: boolean };
};

function mapStatus(status: string | null | undefined): InspectionMission['status'] {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'inspection_start':
    case 'in_progress':
    case 'inspection_end':
    case 'cost_validation':
      return 'in_progress';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

function extractCity(address?: string | null) {
  if (!address) return '';
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || address;
}

export function useInspectionMissions() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['inspection_missions', user?.id],
    queryFn: async (): Promise<InspectionMission[]> => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('driver_id', user.id)
        .eq('kind', 'inspection')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((m: any) => ({
        id: m.id,
        title: m.title || 'Inspection véhicule',
        reference: m.reference || '—',
        status: mapStatus(m.status),
        created_at: m.created_at,
        description: m.description || '',
        donor_id: m.donor_id || null,
        driver_id: m.driver_id || null,
        vehicle: {
          brand: m.vehicle_brand || '—',
          model: m.vehicle_model || '',
          plate: m.vehicle_plate || '',
        },
        departure: {
          address: m.pickup_address || '',
          city: m.pickup_city || extractCity(m.pickup_address),
        },
        arrival: {
          address: m.delivery_address || '',
          city: m.delivery_city || extractCity(m.delivery_address),
        },
        inspections: {
          departure: ['inspection_start', 'in_progress', 'inspection_end', 'completed'].includes(m.status),
          arrival: ['inspection_end', 'completed'].includes(m.status),
          gpsTracking: !!m.gps_tracking,
        },
      }));
    },
    enabled: !!user?.id,
  });

  return {
    missions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as any,
    refetch: query.refetch,
  };
}
