// Types Supabase générés manuellement (provisoire) pour intégrer nouvelles tables crédits + demandes trajets.
// Remplacer ce fichier en exécutant ensuite :
//   supabase gen types typescript --project-id <your-project-id> --schema public > supabase/types.generated.ts
// puis ajuster les imports dans le code.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
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
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
}

export type PublicTableName = keyof Database['public']['Tables'];
export type TableRow<T extends PublicTableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends PublicTableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends PublicTableName> = Database['public']['Tables'][T]['Update'];
