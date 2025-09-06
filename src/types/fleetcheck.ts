// Obsolète côté web: types FleetCheck déplacés vers l'app mobile.
export {};

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

export interface MissionReport {
  id: string;
  mission_id: string;
  main_report_url?: string;
  documents_report_url?: string;
  costs_report_url?: string;
  sent_to_client: boolean;
  sent_to_donor: boolean;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export type FuelLevel = 'full' | 'three_quarters' | 'half' | 'quarter' | 'empty';

export interface PhotoCapture {
  uri: string;
  type: 'front' | 'rear' | 'left' | 'right';
  timestamp: string;
}

export interface CostItem {
  type: 'fuel' | 'toll' | 'parking' | 'hotel' | 'meal' | 'other';
  amount: number;
  description?: string;
  receipt_url?: string;
}