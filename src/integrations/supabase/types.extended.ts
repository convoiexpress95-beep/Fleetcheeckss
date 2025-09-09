import type { Database as BaseDatabase } from './types';

type Merge<A, B> = Omit<A, keyof B> & B;

type PublicWithQuotes<P extends BaseDatabase['public']> = Merge<P, {
  Tables: Merge<P['Tables'], {
    missions: Merge<P['Tables']['missions'], {
      Row: Merge<P['Tables']['missions']['Row'], {
        vehicle_body_type?: string | null;
        vehicle_image_path?: string | null;
        requirement_assurance_tous_risques?: boolean;
        requirement_w_garage?: boolean;
        requirement_transporteur_plateau?: boolean;
        requirement_porte_10?: boolean;
        requirement_convoyeur?: boolean;
      }>;
      Insert: Merge<P['Tables']['missions']['Insert'], {
        vehicle_body_type?: string | null;
        vehicle_image_path?: string | null;
        requirement_assurance_tous_risques?: boolean;
        requirement_w_garage?: boolean;
        requirement_transporteur_plateau?: boolean;
        requirement_porte_10?: boolean;
        requirement_convoyeur?: boolean;
      }>;
      Update: Merge<P['Tables']['missions']['Update'], {
        vehicle_body_type?: string | null;
        vehicle_image_path?: string | null;
        requirement_assurance_tous_risques?: boolean;
        requirement_w_garage?: boolean;
        requirement_transporteur_plateau?: boolean;
        requirement_porte_10?: boolean;
        requirement_convoyeur?: boolean;
      }>;
      Relationships: P['Tables']['missions']['Relationships'];
    }>;
    mission_applications: {
      Row: {
        id: string;
        mission_id: string;
        applicant_user_id: string;
        message: string | null;
        price_offer: number | null;
        status: 'pending' | 'accepted' | 'rejected';
        created_at: string;
      };
      Insert: {
        id?: string;
        mission_id: string;
        applicant_user_id: string;
        message?: string | null;
        price_offer?: number | null;
        status?: 'pending' | 'accepted' | 'rejected';
        created_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['mission_applications']['Insert']>;
      Relationships: [];
    };
    vehicle_models: {
      Row: {
        id: string;
        make: string;
        model: string;
        body_type: string;
        generation: string | null;
        image_path: string | null;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        make: string;
        model: string;
        body_type: string;
        generation?: string | null;
        image_path?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: {
        id?: string;
        make?: string;
        model?: string;
        body_type?: string;
        generation?: string | null;
        image_path?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Relationships: [];
    };
    quotes: {
      Row: {
        id: string;
        user_id: string;
        client_id: string;
        quote_number: string;
        quote_date: string; // date
        validity_date: string; // date
        status: string;
        subtotal_ht: number;
        vat_rate: number | null;
        vat_amount: number;
        total_ttc: number;
        payment_terms: string | null;
        payment_method: string | null;
        notes: string | null;
        legal_mentions: string | null;
        created_at: string;
        updated_at: string | null;
      };
      Insert: {
        id?: string;
        user_id: string;
        client_id: string;
        quote_number: string;
        quote_date?: string; // date
        validity_date: string; // date
        status?: string;
        subtotal_ht?: number;
        vat_rate?: number | null;
        vat_amount?: number;
        total_ttc?: number;
        payment_terms?: string | null;
        payment_method?: string | null;
        notes?: string | null;
        legal_mentions?: string | null;
        created_at?: string;
        updated_at?: string | null;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['quotes']['Insert']>;
      Relationships: [];
    };
    quote_items: {
      Row: {
        id: string;
        quote_id: string;
        description: string;
        quantity: number | null;
        unit_price: number;
        total_ht: number;
        vat_rate: number | null;
        created_at: string;
      };
      Insert: {
        id?: string;
        quote_id: string;
        description: string;
        quantity?: number | null;
        unit_price: number;
        total_ht: number;
        vat_rate?: number | null;
        created_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['quote_items']['Insert']>;
      Relationships: [];
    };
    rides: {
      Row: {
        id: string;
        driver_id: string;
        departure: string;
        destination: string;
        departure_time: string; // timestamptz
        duration_minutes: number | null;
        price: number;
        seats_total: number;
        seats_available: number;
        route: string[];
        description: string | null;
        vehicle_model: string | null;
        options: string[];
        status: 'active' | 'cancelled' | 'completed';
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        driver_id: string;
        departure: string;
        destination: string;
        departure_time: string; // timestamptz
        duration_minutes?: number | null;
        price: number;
        seats_total: number;
        route?: string[];
        description?: string | null;
        vehicle_model?: string | null;
        options?: string[];
        status?: 'active' | 'cancelled' | 'completed';
        created_at?: string;
        updated_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['rides']['Insert']>;
      Relationships: [];
    };
    ride_reservations: {
      Row: {
        id: string;
        ride_id: string;
        passenger_id: string;
        seats: number;
        status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
        price_at_booking: number;
        message: string | null;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        ride_id: string;
        passenger_id: string;
        seats?: number;
        status?: 'pending' | 'accepted' | 'rejected' | 'cancelled';
        price_at_booking: number;
        message?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['ride_reservations']['Insert']>;
      Relationships: [];
    };
    ride_messages: {
      Row: {
        id: string;
        ride_id: string;
        sender_id: string;
        content: string;
        created_at: string;
      };
      Insert: {
        id?: string;
        ride_id: string;
        sender_id: string;
        content: string;
        created_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['ride_messages']['Insert']>;
      Relationships: [];
    };
    ride_message_reads: {
      Row: {
        message_id: string;
        user_id: string;
        read_at: string;
      };
      Insert: {
        message_id: string;
        user_id: string;
        read_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['ride_message_reads']['Insert']>;
      Relationships: [];
    };
    // Ajout FleetMarket
    fleetmarket_missions: {
      Row: {
        id: string;
        created_by: string;
        titre: string;
        description: string | null;
        ville_depart: string;
        ville_arrivee: string;
        date_depart: string; // timestamptz
        prix_propose: number | null;
        statut: 'ouverte' | 'en_negociation' | 'attribuee' | 'terminee' | 'annulee';
        vehicule_requis: string | null;
        contact_visible: boolean;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        created_by: string;
        titre: string;
        description?: string | null;
        ville_depart: string;
        ville_arrivee: string;
        date_depart: string; // timestamptz
        prix_propose?: number | null;
        statut?: 'ouverte' | 'en_negociation' | 'attribuee' | 'terminee' | 'annulee';
        vehicule_requis?: string | null;
        contact_visible?: boolean;
        created_at?: string;
        updated_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['fleetmarket_missions']['Insert']>;
      Relationships: [];
    };
  }>;
  Functions: Merge<P['Functions'], {
    generate_quote_number: {
      Args: { _user_id: string };
      Returns: string;
    };
  }>;
}>;

export type Database = Merge<BaseDatabase, {
  public: PublicWithQuotes<BaseDatabase['public']>
}>;
