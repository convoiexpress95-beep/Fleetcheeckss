// Extension locale des types Supabase pour tables non générées (messages, reviews)
// Si vous régénérez les types, gardez ce fichier séparé pour éviter l'écrasement.
import type { Database as BaseDatabase } from './types';
// NOTE: La première section a été simplifiée: nous utilisons plus bas une fusion (Merge) qui ajoute déjà
// les nouvelles tables. Les définitions messages / reviews seront intégrées via PublicWithQuotes si besoin.

type Merge<A, B> = Omit<A, keyof B> & B;

type PublicWithQuotes<P extends BaseDatabase['public']> = Merge<P, {
  // Enums et types locaux complémentaires
  Enums: Merge<P['Enums'], {
    membership_plan: 'debutant' | 'pro' | 'expert' | 'entreprise';
    user_role: 'user' | 'admin' | 'moderator' | 'debutant' | 'pro' | 'expert' | 'entreprise' | 'convoyeur_confirme';
  }>;
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
    admin_settings: {
      Row: {
        key: string;
        value: any; // jsonb
        updated_at: string;
      };
      Insert: {
        key: string;
        value: any;
        updated_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['admin_settings']['Insert']>;
      Relationships: [];
    };
    maintenance_flags: {
      Row: {
        id: boolean;
        enabled: boolean;
        message: string | null;
        updated_at: string;
      };
      Insert: {
        id?: boolean;
        enabled?: boolean;
        message?: string | null;
        updated_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['maintenance_flags']['Insert']>;
      Relationships: [];
    };
    conversations: {
      Row: {
        id: string;
        mission_id: string | null;
        owner_id: string;
        convoyeur_id: string;
        last_message: string | null;
        created_at: string;
        updated_at: string;
      };
      Insert: {
        id?: string;
        mission_id?: string | null;
        owner_id: string;
        convoyeur_id: string;
        last_message?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['conversations']['Insert']>;
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
    // --- Début ajout crédits & demandes trajets ---
    credits_wallets: {
      Row: { user_id: string; balance: number; updated_at: string };
      Insert: { user_id: string; balance?: number; updated_at?: string };
      Update: { user_id?: string; balance?: number; updated_at?: string };
      Relationships: [];
    };
    credits_ledger: {
      Row: { id: string; user_id: string; amount: number; reason: string | null; created_at: string };
      Insert: { id?: string; user_id: string; amount: number; reason?: string | null; created_at?: string };
      Update: { id?: string; user_id?: string; amount?: number; reason?: string | null; created_at?: string };
      Relationships: [];
    };
    trajet_join_requests: {
      Row: { id: string; trajet_id: string; passenger_id: string; convoyeur_id: string; status: 'pending'|'accepted'|'refused'|'expired'; created_at: string; decided_at: string | null; refund_done: boolean | null; meta: any | null };
      Insert: { id?: string; trajet_id: string; passenger_id: string; convoyeur_id: string; status?: 'pending'|'accepted'|'refused'|'expired'; created_at?: string; decided_at?: string | null; refund_done?: boolean | null; meta?: any | null };
      Update: { id?: string; trajet_id?: string; passenger_id?: string; convoyeur_id?: string; status?: 'pending'|'accepted'|'refused'|'expired'; created_at?: string; decided_at?: string | null; refund_done?: boolean | null; meta?: any | null };
      Relationships: [];
    };
    // --- Fin ajout crédits & demandes trajets ---
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
        convoyeur_id: string | null;
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
        convoyeur_id?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['fleetmarket_missions']['Insert']>;
      Relationships: [];
    };
    // Compatibilité avec drive-connect-suite: ancienne table marketplace_missions
    marketplace_missions: {
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
        convoyeur_id: string | null;
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
        convoyeur_id?: string | null;
        created_at?: string;
        updated_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['marketplace_missions']['Insert']>;
      Relationships: [];
    };
    // Convoiturage - trajets partagés (ajout pour compatibilit types)
    trajets_partages: {
      Row: {
        id: string;
        conducteur_id: string;
  departure: string;
  destination: string;
  // alias tolerés pour compat avec code legacy
  ville_depart?: string;
  ville_arrivee?: string;
        date_heure: string; // timestamptz
        price: number | null;
  nb_places?: number | null;
        seats_total: number | null;
        seats_available: number | null;
        participants: string[] | null;
        description: string | null;
        convoyeur_id: string | null;
        created_at: string;
        updated_at: string | null;
      };
      Insert: {
        id?: string;
        conducteur_id: string;
  departure: string;
  destination: string;
  ville_depart?: string;
  ville_arrivee?: string;
        date_heure: string; // timestamptz
        price?: number | null;
  nb_places?: number | null;
        seats_total?: number | null;
        seats_available?: number | null;
        participants?: string[] | null;
        description?: string | null;
        convoyeur_id?: string | null;
        created_at?: string;
        updated_at?: string | null;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['trajets_partages']['Insert']>;
      Relationships: [];
    };
    // Ajout tables messages & reviews manquantes pour chat générique
    messages: {
      Row: {
        id: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        message_type: string | null;
        created_at: string;
        read_at: string | null;
  metadata: any | null; // JSON arbitraire (attachment, prix, etc.)
      };
      Insert: {
        id?: string;
        conversation_id: string;
        sender_id: string;
        content: string;
        message_type?: string | null;
        created_at?: string;
        read_at?: string | null;
  metadata?: any | null;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['messages']['Insert']>;
      Relationships: [];
    };
    reviews: {
      Row: {
        id: string;
        target_user_id: string;
        author_user_id: string;
        rating: number | null;
        content: string | null;
        created_at: string;
      };
      Insert: {
        id?: string;
        target_user_id: string;
        author_user_id: string;
        rating?: number | null;
        content?: string | null;
        created_at?: string;
      };
      Update: Partial<PublicWithQuotes<P>['Tables']['reviews']['Insert']>;
      Relationships: [];
    };
  }>;
  Functions: Merge<P['Functions'], {
    generate_quote_number: {
      Args: { _user_id: string };
      Returns: string;
    };
    admin_topup_credits: {
      Args: { p_user: string; p_amount: number; p_reason?: string | null };
      Returns: void;
    };
    set_maintenance: {
      Args: { p_enabled: boolean; p_message?: string | null };
      Returns: void;
    };
    admin_set_membership: {
      Args: { p_user: string; p_plan: 'debutant' | 'pro' | 'expert' | 'entreprise'; p_expires_at?: string | null };
      Returns: void;
    };
    admin_set_role: {
      Args: { p_user: string; p_role: 'user' | 'admin' | 'moderator' | 'debutant' | 'pro' | 'expert' | 'entreprise' | 'convoyeur_confirme'; p_grant: boolean };
      Returns: void;
    };
    admin_mark_convoyeur_confirme: {
      Args: { p_user: string; p_confirmed: boolean };
      Returns: void;
    };
    get_contacts_with_stats: {
      Args: { _user_id: string; _search?: string | null; _limit?: number | null; _offset?: number | null };
      Returns: Array<{
        id: string;
        user_id: string;
        email: string;
        name: string | null;
        status: string;
        invited_at: string | null;
        missions_count: number | null;
      }>;
    };
  }>;
}>;

export type Database = Merge<BaseDatabase, {
  public: PublicWithQuotes<BaseDatabase['public']>
}>;
