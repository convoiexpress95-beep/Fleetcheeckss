export interface Mission {
  id: string;
  title: string;
  reference: string;
  description?: string;
  status: 'pending' | 'inspection_start' | 'in_progress' | 'inspection_end' | 'cost_validation' | 'completed' | 'cancelled';
  pickup_date?: string;
  delivery_date?: string;
  pickup_address?: string;
  delivery_address?: string;
  pickup_contact_name?: string;
  pickup_contact_phone?: string;
  pickup_contact_email?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  delivery_contact_email?: string;
  vehicle_type?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  license_plate?: string;
  driver_earning?: number;
  donor_earning?: number;
  created_by: string;
  driver_id?: string;
  donor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionDeparture {
  id: string;
  mission_id: string;
  driver_id: string;
  initial_mileage: number;
  initial_fuel: 'full' | 'three_quarters' | 'half' | 'quarter' | 'empty';
  photos: string[];
  internal_notes?: string;
  client_signature_url?: string;
  client_email?: string;
  created_at: string;
  updated_at: string;
}

export interface InspectionArrival {
  id: string;
  mission_id: string;
  driver_id: string;
  final_mileage: number;
  final_fuel: 'full' | 'three_quarters' | 'half' | 'quarter' | 'empty';
  photos: string[];
  client_notes?: string;
  driver_notes?: string;
  client_signature_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionCosts {
  id: string;
  mission_id: string;
  driver_id: string;
  fuel_costs: number;
  toll_costs: number;
  parking_costs: number;
  hotel_costs: number;
  meal_costs: number;
  other_costs: number;
  receipts: string[];
  cost_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionDocument {
  id: string;
  mission_id: string;
  driver_id: string;
  document_type: 'PV' | 'delivery_note' | 'other';
  document_name: string;
  document_url: string;
  ocr_text?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  status: 'active' | 'inactive';
  preferences: any;
  created_at: string;
  updated_at: string;
}

export interface TrackingData {
  id: string;
  mission_id: string;
  driver_id?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  battery_level?: number;
  signal_strength?: number;
  created_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name?: string;
  email: string;
  status: 'pending' | 'active' | 'declined';
  invited_user_id?: string;
  invited_at?: string;
  accepted_at?: string;
  declined_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  updated_at: string;
}