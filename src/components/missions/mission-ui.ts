import { getMissionStatusMeta } from './status-utils';

// UI mission type centrale (normalisée pour table/kanban/kpi)
export type MissionUIStatus = 'pending' | 'in-progress' | 'delivered' | 'cancelled';

export interface MissionUI {
  id: string;
  client: { name: string; contact?: { name?: string; email?: string; phone?: string }; address?: string };
  vehicle: { brand: string; model: string; registration: string };
  itinerary: { departure: { address: string }; arrival: { address: string }; distance: number; duration: number };
  schedule: { date: Date; timeSlot: string; flexibility?: string; urgent: boolean; roundTrip: boolean };
  assignedTo?: { id: string; name: string; role: string; avatar?: string };
  status: MissionUIStatus;
  cost: { tolls: number; fuel: number; miscellaneous: number; total: number; estimated: boolean; credits: number };
  createdAt: Date;
  updatedAt: Date;
  notes?: string | null;
}

// Convertit un statut DB en statut UI simplifié
export function dbStatusToUI(db: string | null | undefined): MissionUIStatus {
  if (!db) return 'pending';
  if (['in_progress','inspection_start','inspection_end'].includes(db)) return 'in-progress';
  if (['completed','delivered'].includes(db)) return 'delivered';
  if (['cancelled','archived'].includes(db)) return 'cancelled';
  return 'pending';
}

export function uiStatusToDb(ui: MissionUIStatus): string {
  if (ui === 'in-progress') return 'in_progress';
  if (ui === 'delivered') return 'completed';
  if (ui === 'cancelled') return 'cancelled';
  return 'pending';
}

// Mapping Supabase -> MissionUI
export function mapSupabaseMission(m: any): MissionUI {
  return {
    id: m.id,
    client: { name: m.donor_profile?.full_name || 'Client', contact: { name: m.pickup_contact_name, email: m.pickup_contact_email, phone: m.pickup_contact_phone }, address: m.pickup_address || '' },
    vehicle: { brand: m.vehicle_brand || m.vehicle_model?.make || 'N/A', model: m.vehicle_model_name || m.vehicle_model?.model || '', registration: m.license_plate || '—' },
    itinerary: { departure: { address: m.pickup_address || '—' }, arrival: { address: m.delivery_address || '—' }, distance: 0, duration: 0 },
    schedule: { date: m.pickup_date ? new Date(m.pickup_date) : new Date(), timeSlot: m.pickup_date ? new Date(m.pickup_date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '', flexibility: '', urgent: false, roundTrip: false },
    assignedTo: m.driver_profile ? { id: m.driver_id, name: m.driver_profile.full_name, role: 'Convoyeur', avatar: (m.driver_profile.full_name||'??').split(' ').map((p:any)=>p[0]).join('').slice(0,2).toUpperCase() } : undefined,
    status: dbStatusToUI(m.status),
    cost: { tolls: 0, fuel: 0, miscellaneous: 0, total: m.donor_earning || 0, estimated: true, credits: 1 },
    createdAt: m.created_at ? new Date(m.created_at) : new Date(),
    updatedAt: m.updated_at ? new Date(m.updated_at) : new Date(),
    notes: m.description || null,
  };
}

export function mapSupabaseMissions(arr: any[] = []): MissionUI[] { return arr.map(mapSupabaseMission); }

// Petite aide pour composants (ex: table) si besoin de méta statut directement
export function getStatusBadgeClasses(status: MissionUIStatus) {
  return getMissionStatusMeta(status).badgeClass;
}
