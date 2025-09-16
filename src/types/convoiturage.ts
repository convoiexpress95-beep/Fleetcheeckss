// Types de base pour la messagerie / trajets (convoiturage)
export interface Ride {
  id: string;
  driver_id?: string;
  departure: string;
  destination: string;
  departure_time: string; // ISO
  duration_minutes?: number | null;
  seats_total?: number | null;
  seats_available?: number | null;
  price?: number | null;
  description?: string | null;
  vehicle_model?: string | null;
  options?: string[] | null;
  status?: 'active' | 'cancelled' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface ConversationTripSummary {
  id: string;
  departure: string;
  destination: string;
  date: string; // locale string
  time: string; // locale string
}

export interface ConversationParticipant {
  name: string;
  avatar: string;
  online: boolean;
}

export interface ConversationLastMessageInfo {
  text: string;
  time: string;
  unread: boolean;
  sender: 'me' | 'them';
}

export interface ConversationItem {
  id: string;
  participant: ConversationParticipant;
  lastMessage: ConversationLastMessageInfo;
  trip: ConversationTripSummary;
}

export interface RideMessageRow {
  id: string;
  ride_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface UIMessageItem {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string; // HH:mm locale
  avatar: string;
}

// Export explicite (parfois nécessaire si TS rencontre un cache incohérent)
// Ré-export explicite supprimé pour éviter les conflits d’export
