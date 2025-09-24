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
  created_at?: string;
  updated_at?: string;
}

// Nouveaux types pour les fonctionnalités ajoutées

// Types Covoiturage
export interface CovoiturageTrip {
  id: string;
  departure: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  driver_name: string;
  driver_rating: number;
  vehicle_info: string;
  status: 'available' | 'booked' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CovoiturageBooking {
  id: string;
  trip_id: string;
  passenger_id: string;
  passenger_name: string;
  seats_booked: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

// Types Marketplace
export interface MarketplaceMission {
  id: string;
  title: string;
  description: string;
  pickup_location: string;
  delivery_location: string;
  vehicle_type: string;
  urgency: 'low' | 'medium' | 'high';
  budget_min: number;
  budget_max: number;
  deadline: string;
  company_name: string;
  company_rating: number;
  proposals_count: number;
  status: 'open' | 'in_progress' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface MarketplaceProposal {
  id: string;
  mission_id: string;
  contractor_id: string;
  contractor_name: string;
  contractor_rating: number;
  proposed_price: number;
  estimated_duration: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

// Types Facturation
export interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  mission_title: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  due_date: string;
  paid_at?: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  client_name: string;
  client_email: string;
  description: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  valid_until: string;
}

export interface PaymentStats {
  total_revenue: number;
  pending_amount: number;
  overdue_amount: number;
  this_month_revenue: number;
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