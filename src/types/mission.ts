// Types centralisés pour les missions (web)

// Statuts connus (liste extensible). On laisse string pour compat élargie tout en proposant union partielle.
export type MissionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'archived'
  | 'draft'
  | string; // fallback vers valeurs supplémentaires existantes (ex: inspection_start, cost_validation, etc.)

export interface ProfileLite {
  id?: string;
  full_name?: string | null;
  email?: string | null;
}

export interface VehicleModelLite {
  id: string;
  make: string | null;
  model: string | null;
  body_type: string | null;
  generation: string | null;
  image_path: string | null;
}

export interface MissionBase {
  id: string;
  title: string;
  reference: string;
  description: string | null;
  pickup_address: string | null;
  delivery_address: string | null;
  pickup_date: string | null; // ISO
  delivery_date: string | null; // ISO
  pickup_contact_name: string | null;
  pickup_contact_phone: string | null;
  pickup_contact_email: string | null;
  delivery_contact_name: string | null;
  delivery_contact_phone: string | null;
  delivery_contact_email: string | null;
  vehicle_type: string | null;
  vehicle_brand: string | null;
  vehicle_model_name?: string | null;
  vehicle_body_type: string | null;
  vehicle_image_path: string | null;
  license_plate: string | null;
  donor_earning: number | null;
  driver_earning: number | null;
  status: MissionStatus;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  donor_id: string | null;
  driver_id: string | null;
  requirement_convoyeur?: boolean | null;
  requirement_transporteur_plateau?: boolean | null;
  kind?: string | null; // Ancien champ potentiellement encore présent
  vehicle_model?: VehicleModelLite | null; // jointure optionnelle
  [key: string]: unknown; // tolérance pour champs additionnels non typés encore
}

export interface MissionWithProfiles extends MissionBase {
  donor_profile?: ProfileLite | null;
  driver_profile?: ProfileLite | null;
  creator_profile?: ProfileLite | null;
}

export interface MissionFilters {
  status?: string; // 'all' ou MissionStatus
  search?: string;
  kind?: string;
  vehicleGroup?: 'leger' | 'utilitaire' | 'poids_lourd' | 'all';
  departCity?: string;
  arrivalCity?: string;
  pickupDate?: string; // YYYY-MM-DD
  serviceType?: 'convoyage' | 'transport';
  [key: string]: unknown; // pour compat ascendante (clé future)
}

export interface MissionsQueryResult {
  data: MissionWithProfiles[];
  count: number;
}
