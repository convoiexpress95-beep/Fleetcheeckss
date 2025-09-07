// Minimal Supabase Database types for the mobile app with quotes support.
// This file augments only the parts we need now (quotes, quote_items, and RPC generate_quote_number)
// and keeps index signatures so other tables/functions remain usable without strict typing.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type AnyTable = {
  Row: any;
  Insert: any;
  Update: any;
  Relationships: any;
};

export interface Database {
  public: {
    Tables: {
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
        Update: Partial<Database['public']['Tables']['quotes']['Insert']>;
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
        Update: Partial<Database['public']['Tables']['quote_items']['Insert']>;
        Relationships: [];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number | null;
          unit_price: number;
          total_ht: number;
          vat_rate: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity?: number | null;
          unit_price: number;
          total_ht: number;
          vat_rate?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['invoice_items']['Insert']>;
        Relationships: [];
      };
      // Keep other tables accessible with broad types
      [key: string]: AnyTable;
    };
    Views: {
      [key: string]: any;
    };
    Functions: {
      // Explicitly type generate_quote_number for better DX
      generate_quote_number: {
        Args: { _user_id: string };
        Returns: string;
      };
      [key: string]: any;
    };
    Enums: {
      [key: string]: any;
    };
    CompositeTypes: {
      [key: string]: any;
    };
  };
}
