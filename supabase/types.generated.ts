export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: number
          maintenance_enabled: boolean | null
          maintenance_message: string | null
          max_login_attempts: number | null
          notifications_enabled: boolean | null
          sender_email: string | null
          session_duration: number | null
          sms_notifications: boolean | null
          smtp_port: number | null
          smtp_server: string | null
          two_factor_auth: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: number
          maintenance_enabled?: boolean | null
          maintenance_message?: string | null
          max_login_attempts?: number | null
          notifications_enabled?: boolean | null
          sender_email?: string | null
          session_duration?: number | null
          sms_notifications?: boolean | null
          smtp_port?: number | null
          smtp_server?: string | null
          two_factor_auth?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: number
          maintenance_enabled?: boolean | null
          maintenance_message?: string | null
          max_login_attempts?: number | null
          notifications_enabled?: boolean | null
          sender_email?: string | null
          session_duration?: number | null
          sms_notifications?: boolean | null
          smtp_port?: number | null
          smtp_server?: string | null
          two_factor_auth?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_data: {
        Row: {
          avg_mission_value: number
          created_at: string
          date: string
          fuel_costs: number
          id: string
          missions_count: number
          net_profit: number
          other_costs: number
          total_km: number
          total_revenue: number
          updated_at: string
          user_id: string
          vehicle_costs: number
        }
        Insert: {
          avg_mission_value?: number
          created_at?: string
          date: string
          fuel_costs?: number
          id?: string
          missions_count?: number
          net_profit?: number
          other_costs?: number
          total_km?: number
          total_revenue?: number
          updated_at?: string
          user_id: string
          vehicle_costs?: number
        }
        Update: {
          avg_mission_value?: number
          created_at?: string
          date?: string
          fuel_costs?: number
          id?: string
          missions_count?: number
          net_profit?: number
          other_costs?: number
          total_km?: number
          total_revenue?: number
          updated_at?: string
          user_id?: string
          vehicle_costs?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string
          city: string
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          is_company: boolean | null
          last_name: string | null
          notes: string | null
          phone: string | null
          postal_code: string
          siret: string | null
          updated_at: string | null
          user_id: string
          vat_number: string | null
        }
        Insert: {
          address: string
          city: string
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_company?: boolean | null
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          postal_code: string
          siret?: string | null
          updated_at?: string | null
          user_id: string
          vat_number?: string | null
        }
        Update: {
          address?: string
          city?: string
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          is_company?: boolean | null
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          postal_code?: string
          siret?: string | null
          updated_at?: string | null
          user_id?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      company_info: {
        Row: {
          address: string
          capital_amount: number | null
          city: string
          company_name: string
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          legal_form: string | null
          logo_url: string | null
          phone: string | null
          postal_code: string
          siret: string | null
          updated_at: string | null
          user_id: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address: string
          capital_amount?: number | null
          city: string
          company_name: string
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          legal_form?: string | null
          logo_url?: string | null
          phone?: string | null
          postal_code: string
          siret?: string | null
          updated_at?: string | null
          user_id: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          capital_amount?: number | null
          city?: string
          company_name?: string
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          legal_form?: string | null
          logo_url?: string | null
          phone?: string | null
          postal_code?: string
          siret?: string | null
          updated_at?: string | null
          user_id?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string | null
          id: string
          invited_email: string | null
          invited_user_id: string | null
          status: Database["public"]["Enums"]["contact_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_email?: string | null
          invited_user_id?: string | null
          status?: Database["public"]["Enums"]["contact_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_email?: string | null
          invited_user_id?: string | null
          status?: Database["public"]["Enums"]["contact_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversations: {
        Row: {
          convoyeur_id: string
          created_at: string
          id: string
          last_message: string | null
          mission_id: string | null
          owner_id: string
          updated_at: string
        }
        Insert: {
          convoyeur_id: string
          created_at?: string
          id?: string
          last_message?: string | null
          mission_id?: string | null
          owner_id: string
          updated_at?: string
        }
        Update: {
          convoyeur_id?: string
          created_at?: string
          id?: string
          last_message?: string | null
          mission_id?: string | null
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
        ]
      }
      convoyeur_applications: {
        Row: {
          admin_notes: string | null
          company_name: string | null
          created_at: string
          driving_experience: number | null
          driving_license: string | null
          garage_document_url: string | null
          id: string
          kbis_document_url: string | null
          license_document_url: string | null
          motivation: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          siret: string | null
          status: string | null
          submitted_at: string
          updated_at: string
          user_id: string
          vehicle_types: string | null
          vigilance_document_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          company_name?: string | null
          created_at?: string
          driving_experience?: number | null
          driving_license?: string | null
          garage_document_url?: string | null
          id?: string
          kbis_document_url?: string | null
          license_document_url?: string | null
          motivation?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          siret?: string | null
          status?: string | null
          submitted_at?: string
          updated_at?: string
          user_id: string
          vehicle_types?: string | null
          vigilance_document_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          company_name?: string | null
          created_at?: string
          driving_experience?: number | null
          driving_license?: string | null
          garage_document_url?: string | null
          id?: string
          kbis_document_url?: string | null
          license_document_url?: string | null
          motivation?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          siret?: string | null
          status?: string | null
          submitted_at?: string
          updated_at?: string
          user_id?: string
          vehicle_types?: string | null
          vigilance_document_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convoyeur_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "convoyeur_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      credits_ledger: {
        Row: {
          amount: number | null
          created_at: string
          delta: number
          id: string
          reason: string | null
          ref: string | null
          ref_id: string | null
          ref_type: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          delta: number
          id?: string
          reason?: string | null
          ref?: string | null
          ref_id?: string | null
          ref_type?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          delta?: number
          id?: string
          reason?: string | null
          ref?: string | null
          ref_id?: string | null
          ref_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      credits_wallets: {
        Row: {
          balance: number
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fleetmarket_missions: {
        Row: {
          contact_visible: boolean | null
          convoyeur_id: string | null
          created_at: string
          created_by: string
          date_depart: string
          description: string | null
          id: string
          prix_propose: number | null
          statut: string
          titre: string
          updated_at: string
          vehicule_requis: string | null
          ville_arrivee: string
          ville_depart: string
        }
        Insert: {
          contact_visible?: boolean | null
          convoyeur_id?: string | null
          created_at?: string
          created_by: string
          date_depart: string
          description?: string | null
          id?: string
          prix_propose?: number | null
          statut?: string
          titre: string
          updated_at?: string
          vehicule_requis?: string | null
          ville_arrivee: string
          ville_depart: string
        }
        Update: {
          contact_visible?: boolean | null
          convoyeur_id?: string | null
          created_at?: string
          created_by?: string
          date_depart?: string
          description?: string | null
          id?: string
          prix_propose?: number | null
          statut?: string
          titre?: string
          updated_at?: string
          vehicule_requis?: string | null
          ville_arrivee?: string
          ville_depart?: string
        }
        Relationships: []
      }
      inspection_arrivals: {
        Row: {
          client_notes: string | null
          client_signature_url: string | null
          created_at: string
          driver_id: string
          driver_notes: string | null
          final_fuel: string
          final_mileage: number
          id: string
          mission_id: string
          photos: Json
          updated_at: string
        }
        Insert: {
          client_notes?: string | null
          client_signature_url?: string | null
          created_at?: string
          driver_id: string
          driver_notes?: string | null
          final_fuel: string
          final_mileage: number
          id?: string
          mission_id: string
          photos?: Json
          updated_at?: string
        }
        Update: {
          client_notes?: string | null
          client_signature_url?: string | null
          created_at?: string
          driver_id?: string
          driver_notes?: string | null
          final_fuel?: string
          final_mileage?: number
          id?: string
          mission_id?: string
          photos?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_arrivals_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_arrivals_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_departures: {
        Row: {
          client_email: string | null
          client_signature_url: string | null
          created_at: string
          driver_id: string
          id: string
          initial_fuel: string
          initial_mileage: number
          internal_notes: string | null
          mission_id: string
          photos: Json
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_signature_url?: string | null
          created_at?: string
          driver_id: string
          id?: string
          initial_fuel: string
          initial_mileage: number
          internal_notes?: string | null
          mission_id: string
          photos?: Json
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_signature_url?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          initial_fuel?: string
          initial_mileage?: number
          internal_notes?: string | null
          mission_id?: string
          photos?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_departures_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_departures_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          total_ht: number
          unit_price: number
          vat_rate: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total_ht: number
          unit_price: number
          vat_rate?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total_ht?: number
          unit_price?: number
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_sequence: {
        Row: {
          current_number: number
          id: string
          prefix: string | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          current_number?: number
          id?: string
          prefix?: string | null
          updated_at?: string | null
          user_id: string
          year?: number
        }
        Update: {
          current_number?: number
          id?: string
          prefix?: string | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string | null
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          legal_mentions: string | null
          notes: string | null
          payment_method: string | null
          payment_terms: string | null
          status: string | null
          subtotal_ht: number
          total_ttc: number
          updated_at: string | null
          user_id: string
          vat_amount: number
          vat_rate: number | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          due_date: string
          id?: string
          invoice_date?: string
          invoice_number: string
          legal_mentions?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          status?: string | null
          subtotal_ht?: number
          total_ttc?: number
          updated_at?: string | null
          user_id: string
          vat_amount?: number
          vat_rate?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          legal_mentions?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          status?: string | null
          subtotal_ht?: number
          total_ttc?: number
          updated_at?: string | null
          user_id?: string
          vat_amount?: number
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_flags: {
        Row: {
          enabled: boolean
          id: number
          message: string | null
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          id?: number
          message?: string | null
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          id?: number
          message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_devis: {
        Row: {
          convoyeur_id: string
          created_at: string
          id: string
          message: string | null
          mission_id: string
          prix_propose: number
        }
        Insert: {
          convoyeur_id: string
          created_at?: string
          id?: string
          message?: string | null
          mission_id: string
          prix_propose?: number
        }
        Update: {
          convoyeur_id?: string
          created_at?: string
          id?: string
          message?: string | null
          mission_id?: string
          prix_propose?: number
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_devis_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "fleetmarket_missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_devis_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "marketplace_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          metadata: Json | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mission_applications: {
        Row: {
          applicant_id: string
          created_at: string | null
          id: string
          message: string | null
          mission_id: string
          proposed_price: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          mission_id: string
          proposed_price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          mission_id?: string
          proposed_price?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "mission_applications_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_applications_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_costs: {
        Row: {
          cost_notes: string | null
          created_at: string
          driver_id: string
          fuel_costs: number | null
          hotel_costs: number | null
          id: string
          meal_costs: number | null
          mission_id: string
          other_costs: number | null
          parking_costs: number | null
          receipts: Json
          toll_costs: number | null
          updated_at: string
        }
        Insert: {
          cost_notes?: string | null
          created_at?: string
          driver_id: string
          fuel_costs?: number | null
          hotel_costs?: number | null
          id?: string
          meal_costs?: number | null
          mission_id: string
          other_costs?: number | null
          parking_costs?: number | null
          receipts?: Json
          toll_costs?: number | null
          updated_at?: string
        }
        Update: {
          cost_notes?: string | null
          created_at?: string
          driver_id?: string
          fuel_costs?: number | null
          hotel_costs?: number | null
          id?: string
          meal_costs?: number | null
          mission_id?: string
          other_costs?: number | null
          parking_costs?: number | null
          receipts?: Json
          toll_costs?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_costs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_costs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          document_url: string
          driver_id: string
          id: string
          mission_id: string
          ocr_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          document_url: string
          driver_id: string
          id?: string
          mission_id: string
          ocr_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          document_url?: string
          driver_id?: string
          id?: string
          mission_id?: string
          ocr_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_documents_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_documents_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_reports: {
        Row: {
          costs_report_url: string | null
          created_at: string
          documents_report_url: string | null
          id: string
          main_report_url: string | null
          mission_id: string
          sent_at: string | null
          sent_to_client: boolean | null
          sent_to_donor: boolean | null
          updated_at: string
        }
        Insert: {
          costs_report_url?: string | null
          created_at?: string
          documents_report_url?: string | null
          id?: string
          main_report_url?: string | null
          mission_id: string
          sent_at?: string | null
          sent_to_client?: boolean | null
          sent_to_donor?: boolean | null
          updated_at?: string
        }
        Update: {
          costs_report_url?: string | null
          created_at?: string
          documents_report_url?: string | null
          id?: string
          main_report_url?: string | null
          mission_id?: string
          sent_at?: string | null
          sent_to_client?: boolean | null
          sent_to_donor?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_reports_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_tracking: {
        Row: {
          battery_level: number | null
          created_at: string
          driver_id: string | null
          heading: number | null
          id: string
          latitude: number
          longitude: number
          mission_id: string
          signal_strength: number | null
          speed: number | null
        }
        Insert: {
          battery_level?: number | null
          created_at?: string
          driver_id?: string | null
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          mission_id: string
          signal_strength?: number | null
          speed?: number | null
        }
        Update: {
          battery_level?: number | null
          created_at?: string
          driver_id?: string | null
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          mission_id?: string
          signal_strength?: number | null
          speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_tracking_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_tracking_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string | null
          created_by: string
          delivery_address: string
          delivery_contact_email: string | null
          delivery_contact_name: string | null
          delivery_contact_phone: string | null
          delivery_date: string | null
          description: string | null
          donor_earning: number | null
          donor_id: string | null
          driver_earning: number | null
          driver_id: string | null
          id: string
          license_plate: string
          pickup_address: string
          pickup_contact_email: string | null
          pickup_contact_name: string | null
          pickup_contact_phone: string | null
          pickup_date: string
          reference: string
          requirement_convoyeur: boolean | null
          requirement_transporteur_plateau: boolean | null
          status: Database["public"]["Enums"]["mission_status_extended"] | null
          status_original: string | null
          title: string
          updated_at: string | null
          vehicle_body_type: string | null
          vehicle_brand: string | null
          vehicle_image_path: string | null
          vehicle_model: string | null
          vehicle_model_id: string | null
          vehicle_model_name: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          delivery_address: string
          delivery_contact_email?: string | null
          delivery_contact_name?: string | null
          delivery_contact_phone?: string | null
          delivery_date?: string | null
          description?: string | null
          donor_earning?: number | null
          donor_id?: string | null
          driver_earning?: number | null
          driver_id?: string | null
          id?: string
          license_plate: string
          pickup_address: string
          pickup_contact_email?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_date: string
          reference: string
          requirement_convoyeur?: boolean | null
          requirement_transporteur_plateau?: boolean | null
          status?: Database["public"]["Enums"]["mission_status_extended"] | null
          status_original?: string | null
          title: string
          updated_at?: string | null
          vehicle_body_type?: string | null
          vehicle_brand?: string | null
          vehicle_image_path?: string | null
          vehicle_model?: string | null
          vehicle_model_id?: string | null
          vehicle_model_name?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          delivery_address?: string
          delivery_contact_email?: string | null
          delivery_contact_name?: string | null
          delivery_contact_phone?: string | null
          delivery_date?: string | null
          description?: string | null
          donor_earning?: number | null
          donor_id?: string | null
          driver_earning?: number | null
          driver_id?: string | null
          id?: string
          license_plate?: string
          pickup_address?: string
          pickup_contact_email?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_date?: string
          reference?: string
          requirement_convoyeur?: boolean | null
          requirement_transporteur_plateau?: boolean | null
          status?: Database["public"]["Enums"]["mission_status_extended"] | null
          status_original?: string | null
          title?: string
          updated_at?: string | null
          vehicle_body_type?: string | null
          vehicle_brand?: string | null
          vehicle_image_path?: string | null
          vehicle_model?: string | null
          vehicle_model_id?: string | null
          vehicle_model_name?: string | null
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "missions_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "missions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "missions_vehicle_model_id_fkey"
            columns: ["vehicle_model_id"]
            isOneToOne: false
            referencedRelation: "vehicle_models"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          app_role: Database["public"]["Enums"]["app_role"] | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          credits: number | null
          display_name: string | null
          email: string
          full_name: string
          id: string
          is_convoyeur_confirme: boolean | null
          is_premium: boolean | null
          is_verified: boolean | null
          location: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          app_role?: Database["public"]["Enums"]["app_role"] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credits?: number | null
          display_name?: string | null
          email: string
          full_name: string
          id?: string
          is_convoyeur_confirme?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          app_role?: Database["public"]["Enums"]["app_role"] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credits?: number | null
          display_name?: string | null
          email?: string
          full_name?: string
          id?: string
          is_convoyeur_confirme?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_notification_tokens: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_notification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string
          id: string
          quantity: number | null
          quote_id: string
          total_ht: number
          unit_price: number
          vat_rate: number | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          quantity?: number | null
          quote_id: string
          total_ht: number
          unit_price: number
          vat_rate?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          quantity?: number | null
          quote_id?: string
          total_ht?: number
          unit_price?: number
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_sequence: {
        Row: {
          created_at: string
          current_number: number
          id: string
          prefix: string | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          current_number?: number
          id?: string
          prefix?: string | null
          updated_at?: string | null
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          current_number?: number
          id?: string
          prefix?: string | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string | null
          description: string | null
          id: string
          legal_mentions: string | null
          mission_id: string
          notes: string | null
          payment_method: string | null
          payment_terms: string | null
          provider_id: string
          quote_date: string | null
          quote_number: string | null
          status: string | null
          subtotal_ht: number | null
          total_ttc: number | null
          updated_at: string | null
          user_id: string | null
          valid_until: string | null
          validity_date: string | null
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          amount: number
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          legal_mentions?: string | null
          mission_id: string
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          provider_id: string
          quote_date?: string | null
          quote_number?: string | null
          status?: string | null
          subtotal_ht?: number | null
          total_ttc?: number | null
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
          validity_date?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          legal_mentions?: string | null
          mission_id?: string
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          provider_id?: string
          quote_date?: string | null
          quote_number?: string | null
          status?: string | null
          subtotal_ht?: number | null
          total_ttc?: number | null
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
          validity_date?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          date_from: string
          date_to: string
          file_url: string | null
          fuel_costs: number | null
          id: string
          metadata: Json | null
          missions_count: number
          net_profit: number
          report_type: string
          status: string
          title: string
          total_km: number | null
          total_revenue: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_from: string
          date_to: string
          file_url?: string | null
          fuel_costs?: number | null
          id?: string
          metadata?: Json | null
          missions_count?: number
          net_profit?: number
          report_type: string
          status?: string
          title: string
          total_km?: number | null
          total_revenue?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_from?: string
          date_to?: string
          file_url?: string | null
          fuel_costs?: number | null
          id?: string
          metadata?: Json | null
          missions_count?: number
          net_profit?: number
          report_type?: string
          status?: string
          title?: string
          total_km?: number | null
          total_revenue?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ride_message_reads: {
        Row: {
          id: string
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "ride_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ride_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          ride_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          ride_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          ride_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_messages_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "shared_rides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ride_reservations: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          passenger_id: string
          ride_id: string
          seats_reserved: number
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          passenger_id: string
          ride_id: string
          seats_reserved: number
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          passenger_id?: string
          ride_id?: string
          seats_reserved?: number
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_reservations_passenger_id_fkey"
            columns: ["passenger_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ride_reservations_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "shared_rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          created_at: string
          departure: string
          departure_time: string
          description: string | null
          destination: string
          driver_id: string
          duration_minutes: number | null
          id: string
          options: string[] | null
          price: number
          route: string[] | null
          seats_available: number
          seats_total: number
          status: string
          updated_at: string
          vehicle_model: string | null
        }
        Insert: {
          created_at?: string
          departure: string
          departure_time: string
          description?: string | null
          destination: string
          driver_id: string
          duration_minutes?: number | null
          id?: string
          options?: string[] | null
          price: number
          route?: string[] | null
          seats_available?: number
          seats_total: number
          status?: string
          updated_at?: string
          vehicle_model?: string | null
        }
        Update: {
          created_at?: string
          departure?: string
          departure_time?: string
          description?: string | null
          destination?: string
          driver_id?: string
          duration_minutes?: number | null
          id?: string
          options?: string[] | null
          price?: number
          route?: string[] | null
          seats_available?: number
          seats_total?: number
          status?: string
          updated_at?: string
          vehicle_model?: string | null
        }
        Relationships: []
      }
      shared_rides: {
        Row: {
          arrival_city: string
          available_seats: number
          created_at: string | null
          departure_city: string
          departure_time: string
          description: string | null
          driver_id: string
          id: string
          price_per_seat: number
          status: string | null
          updated_at: string | null
          vehicle_info: string | null
        }
        Insert: {
          arrival_city: string
          available_seats: number
          created_at?: string | null
          departure_city: string
          departure_time: string
          description?: string | null
          driver_id: string
          id?: string
          price_per_seat: number
          status?: string | null
          updated_at?: string | null
          vehicle_info?: string | null
        }
        Update: {
          arrival_city?: string
          available_seats?: number
          created_at?: string | null
          departure_city?: string
          departure_time?: string
          description?: string | null
          driver_id?: string
          id?: string
          price_per_seat?: number
          status?: string | null
          updated_at?: string | null
          vehicle_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_rides_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          credits_remaining: number
          credits_total: number
          id: string
          plan_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_remaining?: number
          credits_total?: number
          id?: string
          plan_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_remaining?: number
          credits_total?: number
          id?: string
          plan_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracking_links: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean
          mission_id: string
          tracking_token: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          is_active?: boolean
          mission_id: string
          tracking_token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          mission_id?: string
          tracking_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_links_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_links_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
        ]
      }
      trajets_partages: {
        Row: {
          conducteur_id: string | null
          convoyeur_id: string | null
          created_at: string
          date_heure: string
          departure: string | null
          description: string | null
          destination: string | null
          end_lat: number | null
          end_lng: number | null
          id: string
          nb_places: number | null
          participants: string[]
          price: number | null
          prix_par_place: number | null
          seats_total: number | null
          start_lat: number | null
          start_lng: number | null
          status: string | null
          statut: string | null
          updated_at: string
          ville_arrivee: string | null
          ville_depart: string | null
        }
        Insert: {
          conducteur_id?: string | null
          convoyeur_id?: string | null
          created_at?: string
          date_heure: string
          departure?: string | null
          description?: string | null
          destination?: string | null
          end_lat?: number | null
          end_lng?: number | null
          id?: string
          nb_places?: number | null
          participants?: string[]
          price?: number | null
          prix_par_place?: number | null
          seats_total?: number | null
          start_lat?: number | null
          start_lng?: number | null
          status?: string | null
          statut?: string | null
          updated_at?: string
          ville_arrivee?: string | null
          ville_depart?: string | null
        }
        Update: {
          conducteur_id?: string | null
          convoyeur_id?: string | null
          created_at?: string
          date_heure?: string
          departure?: string | null
          description?: string | null
          destination?: string | null
          end_lat?: number | null
          end_lng?: number | null
          id?: string
          nb_places?: number | null
          participants?: string[]
          price?: number | null
          prix_par_place?: number | null
          seats_total?: number | null
          start_lat?: number | null
          start_lng?: number | null
          status?: string | null
          statut?: string | null
          updated_at?: string
          ville_arrivee?: string | null
          ville_depart?: string | null
        }
        Relationships: []
      }
      user_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          mission_id: string | null
          rating: number
          reviewed_id: string
          reviewer_id: string
          ride_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          mission_id?: string | null
          rating: number
          reviewed_id: string
          reviewer_id: string
          ride_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          mission_id?: string | null
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
          ride_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reviews_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions_simplified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_reviews_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "shared_rides"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          role: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          role: string
          user_id: string
        }
        Update: {
          granted_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicle_models: {
        Row: {
          body_type: string
          created_at: string | null
          generation: string | null
          id: string
          image_path: string | null
          make: string
          model: string
        }
        Insert: {
          body_type: string
          created_at?: string | null
          generation?: string | null
          id?: string
          image_path?: string | null
          make: string
          model: string
        }
        Update: {
          body_type?: string
          created_at?: string | null
          generation?: string | null
          id?: string
          image_path?: string | null
          make?: string
          model?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          document_name: string
          document_type: string
          document_url: string
          id: string
          status: string
          upload_date: string
          user_id: string
        }
        Insert: {
          document_name: string
          document_type: string
          document_url: string
          id?: string
          status?: string
          upload_date?: string
          user_id: string
        }
        Update: {
          document_name?: string
          document_type?: string
          document_url?: string
          id?: string
          status?: string
          upload_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          total_earned: number | null
          total_spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          total_earned?: number | null
          total_spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      contacts_with_stats: {
        Row: {
          created_at: string | null
          id: string | null
          invited_email: string | null
          invited_user_id: string | null
          missions_count: number | null
          status: Database["public"]["Enums"]["contact_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          invited_email?: string | null
          invited_user_id?: string | null
          missions_count?: never
          status?: Database["public"]["Enums"]["contact_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          invited_email?: string | null
          invited_user_id?: string | null
          missions_count?: never
          status?: Database["public"]["Enums"]["contact_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      marketplace_missions: {
        Row: {
          contact_visible: boolean | null
          convoyeur_id: string | null
          created_at: string | null
          created_by: string | null
          date_depart: string | null
          description: string | null
          id: string | null
          prix_propose: number | null
          statut: string | null
          titre: string | null
          updated_at: string | null
          vehicule_requis: string | null
          ville_arrivee: string | null
          ville_depart: string | null
        }
        Insert: {
          contact_visible?: boolean | null
          convoyeur_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_depart?: string | null
          description?: string | null
          id?: string | null
          prix_propose?: number | null
          statut?: string | null
          titre?: string | null
          updated_at?: string | null
          vehicule_requis?: string | null
          ville_arrivee?: string | null
          ville_depart?: string | null
        }
        Update: {
          contact_visible?: boolean | null
          convoyeur_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date_depart?: string | null
          description?: string | null
          id?: string | null
          prix_propose?: number | null
          statut?: string | null
          titre?: string | null
          updated_at?: string | null
          vehicule_requis?: string | null
          ville_arrivee?: string | null
          ville_depart?: string | null
        }
        Relationships: []
      }
      missions_simplified: {
        Row: {
          created_at: string | null
          created_by: string | null
          delivery_address: string | null
          delivery_date: string | null
          description: string | null
          donor_id: string | null
          driver_id: string | null
          id: string | null
          pickup_address: string | null
          pickup_date: string | null
          raw_status:
            | Database["public"]["Enums"]["mission_status_extended"]
            | null
          reference: string | null
          title: string | null
          ui_status: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          description?: string | null
          donor_id?: string | null
          driver_id?: string | null
          id?: string | null
          pickup_address?: string | null
          pickup_date?: string | null
          raw_status?:
            | Database["public"]["Enums"]["mission_status_extended"]
            | null
          reference?: string | null
          title?: string | null
          ui_status?: never
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          description?: string | null
          donor_id?: string | null
          driver_id?: string | null
          id?: string | null
          pickup_address?: string | null
          pickup_date?: string | null
          raw_status?:
            | Database["public"]["Enums"]["mission_status_extended"]
            | null
          reference?: string | null
          title?: string | null
          ui_status?: never
        }
        Relationships: [
          {
            foreignKeyName: "missions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "missions_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "missions_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      admin_mark_convoyeur_confirme: {
        Args: { p_confirmed: boolean; p_user: string }
        Returns: undefined
      }
      admin_review_convoyeur_application: {
        Args: { _application_id: string; _approve: boolean; _notes?: string }
        Returns: undefined
      }
      admin_set_membership: {
        Args: { p_expires_at?: string; p_plan: string; p_user: string }
        Returns: undefined
      }
      admin_set_role: {
        Args: { p_grant: boolean; p_role: string; p_user: string }
        Returns: undefined
      }
      admin_topup_credits: {
        Args: { p_amount: number; p_reason: string; p_user: string }
        Returns: undefined
      }
      calculate_daily_analytics: {
        Args: { _date: string; _user_id: string }
        Returns: undefined
      }
      consume_credit: {
        Args: {
          _credits: number
          _description: string
          _mission_id: string
          _type: string
          _user_id: string
        }
        Returns: boolean
      }
      ensure_wallet: {
        Args: { p_user: string }
        Returns: undefined
      }
      generate_invoice_number: {
        Args: { _user_id: string }
        Returns: string
      }
      generate_quote_number: {
        Args: { _user_id: string }
        Returns: string
      }
      generate_report_data: {
        Args: {
          _date_from: string
          _date_to: string
          _report_type: string
          _user_id: string
        }
        Returns: Json
      }
      get_contacts_with_stats: {
        Args: Record<PropertyKey, never> | { _user_id: string }
        Returns: {
          contact_email: string
          contact_id: string
          contact_name: string
          contact_phone: string
          last_mission_date: string
          missions_count: number
          status: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      recompute_seats_available: {
        Args: { p_ride: string }
        Returns: undefined
      }
      search_profiles_by_email: {
        Args: { query: string }
        Returns: {
          email: string
          full_name: string
          id: string
        }[]
      }
      set_maintenance: {
        Args: { p_enabled: boolean; p_message: string }
        Returns: undefined
      }
      submit_convoyeur_application: {
        Args: {
          _company_name?: string
          _driving_experience: number
          _driving_license: string
          _garage_url?: string
          _kbis_url?: string
          _license_url?: string
          _motivation?: string
          _siret?: string
          _vehicle_types: string
          _vigilance_url?: string
        }
        Returns: string
      }
      upsert_profile: {
        Args: {
          _avatar_url?: string
          _bio?: string
          _display_name?: string
          _email: string
          _full_name: string
          _location?: string
          _phone?: string
          _user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "donneur_d_ordre" | "convoyeur"
      contact_status: "pending" | "accepted" | "rejected"
      mission_status:
        | "draft"
        | "published"
        | "assigned"
        | "picked_up"
        | "in_transit"
        | "delivered"
        | "completed"
        | "cancelled"
      mission_status_extended:
        | "draft"
        | "published"
        | "assigned"
        | "picked_up"
        | "in_transit"
        | "delivered"
        | "completed"
        | "cancelled"
        | "pending"
        | "in_progress"
      notification_type: "mission" | "message" | "system" | "payment"
      user_status: "active" | "inactive" | "banned"
      wallet_transaction_type:
        | "credit"
        | "debit"
        | "transfer"
        | "payment"
        | "refund"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "donneur_d_ordre", "convoyeur"],
      contact_status: ["pending", "accepted", "rejected"],
      mission_status: [
        "draft",
        "published",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
        "completed",
        "cancelled",
      ],
      mission_status_extended: [
        "draft",
        "published",
        "assigned",
        "picked_up",
        "in_transit",
        "delivered",
        "completed",
        "cancelled",
        "pending",
        "in_progress",
      ],
      notification_type: ["mission", "message", "system", "payment"],
      user_status: ["active", "inactive", "banned"],
      wallet_transaction_type: [
        "credit",
        "debit",
        "transfer",
        "payment",
        "refund",
      ],
    },
  },
} as const
