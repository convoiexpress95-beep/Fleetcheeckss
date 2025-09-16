// Augmentation locale des types Supabase pour tables crédits & demandes trajets
// À supprimer après régénération officielle via `supabase gen types`.
import type { Database as Generated } from './types';

// On n'augmente pas l'interface existante (c'est un type), on fournit un type dérivé.
// Utilisation: import { ExtendedDatabase } et passer à createClient<ExtendedDatabase>(...)

type ExtraTables = {
  credits_wallets: {
    Row: { user_id: string; balance: number; created_at: string | null; updated_at: string | null };
    Insert: { user_id: string; balance?: number; created_at?: string | null; updated_at?: string | null };
    Update: { user_id?: string; balance?: number; created_at?: string | null; updated_at?: string | null };
    Relationships: [];
  };
  credits_ledger: {
    Row: { id: string; user_id: string; amount: number; reason: string; ref_type: string | null; ref_id: string | null; created_at: string };
    Insert: { id?: string; user_id: string; amount: number; reason: string; ref_type?: string | null; ref_id?: string | null; created_at?: string };
    Update: { id?: string; user_id?: string; amount?: number; reason?: string; ref_type?: string | null; ref_id?: string | null; created_at?: string };
    Relationships: [];
  };
  trajet_join_requests: {
    Row: { id: string; trajet_id: string; passenger_id: string; convoyeur_id: string; status: 'pending'|'accepted'|'refused'|'expired'; created_at: string; decided_at: string | null; refund_done: boolean; meta: any };
    Insert: { id?: string; trajet_id: string; passenger_id: string; convoyeur_id: string; status?: 'pending'|'accepted'|'refused'|'expired'; created_at?: string; decided_at?: string | null; refund_done?: boolean; meta?: any };
    Update: { id?: string; trajet_id?: string; passenger_id?: string; convoyeur_id?: string; status?: 'pending'|'accepted'|'refused'|'expired'; created_at?: string; decided_at?: string | null; refund_done?: boolean; meta?: any };
    Relationships: [];
  };
};

export type ExtendedDatabase = Omit<Generated, 'public'> & {
  public: Omit<Generated['public'], 'Tables'> & {
    Tables: Generated['public']['Tables'] & ExtraTables;
  };
};

export type CreditsWalletRow = ExtraTables['credits_wallets']['Row'];
export type CreditsLedgerRow = ExtraTables['credits_ledger']['Row'];
export type TrajetJoinRequestRow = ExtraTables['trajet_join_requests']['Row'];