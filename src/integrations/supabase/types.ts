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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      analytics_data: {
        Row: {
          avg_mission_value: number | null
          created_at: string
          date: string
          fuel_costs: number | null
          id: string
          missions_count: number | null
          net_profit: number | null
          other_costs: number | null
          total_km: number | null
          total_revenue: number | null
          updated_at: string
          user_id: string
          vehicle_costs: number | null
        }
        Insert: {
          avg_mission_value?: number | null
          created_at?: string
          date: string
          fuel_costs?: number | null
          id?: string
          missions_count?: number | null
          net_profit?: number | null
          other_costs?: number | null
          total_km?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id: string
          vehicle_costs?: number | null
        }
        Update: {
          avg_mission_value?: number | null
          created_at?: string
          date?: string
          fuel_costs?: number | null
          id?: string
          missions_count?: number | null
          net_profit?: number | null
          other_costs?: number | null
          total_km?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
          vehicle_costs?: number | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          mission_id: string
          owner_id: string
          convoyeur_id: string
          created_at: string
        }
        Insert: {
          id?: string
          mission_id: string
          owner_id: string
          convoyeur_id: string
          created_at?: string
        }
        Update: {
          id?: string
          mission_id?: string
          owner_id?: string
          convoyeur_id?: string
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          target_user_id: string
          author_user_id: string
          mission_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          target_user_id: string
          author_user_id: string
          mission_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          target_user_id?: string
          author_user_id?: string
          mission_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          id: string
          user_id: string
          doc_type: string
          file_url: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          doc_type: string
          file_url: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          doc_type?: string
          file_url?: string
          created_at?: string
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
          accepted_at: string | null
          created_at: string
          declined_at: string | null
          email: string
          id: string
          invited_at: string | null
          invited_user_id: string | null
          name: string | null
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          declined_at?: string | null
          email: string
          id?: string
          invited_at?: string | null
          invited_user_id?: string | null
          name?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          declined_at?: string | null
          email?: string
          id?: string
          invited_at?: string | null
          invited_user_id?: string | null
          name?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          created_at: string
          credits_used: number
          description: string | null
          id: string
          mission_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_used: number
          description?: string | null
          id?: string
          mission_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          description?: string | null
          id?: string
          mission_id?: string | null
          transaction_type?: string
          user_id?: string
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
            referencedRelation: "public_mission_tracking"
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
            referencedRelation: "public_mission_tracking"
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
              start_lat?: number | null
              start_lng?: number | null
              end_lat?: number | null
              end_lng?: number | null
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
              start_lat?: number | null
              start_lng?: number | null
              end_lat?: number | null
              end_lng?: number | null
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
            referencedRelation: "public_mission_tracking"
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
            referencedRelation: "public_mission_tracking"
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
            referencedRelation: "public_mission_tracking"
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
        Relationships: []
      }
      missions: {
        Row: {
          created_at: string
          created_by: string
          delivery_address: string | null
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
          license_plate: string | null
          pickup_address: string | null
          pickup_contact_email: string | null
          pickup_contact_name: string | null
          pickup_contact_phone: string | null
          pickup_date: string | null
          reference: string
          status: Database["public"]["Enums"]["mission_status_extended"]
          title: string
          updated_at: string
          vehicle_brand: string | null
          vehicle_model: string | null
          vehicle_type: string | null
          vehicle_year: number | null
        }
        Insert: {
          created_at?: string
          created_by: string
          delivery_address?: string | null
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
          license_plate?: string | null
          pickup_address?: string | null
          pickup_contact_email?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_date?: string | null
          reference: string
          status?: Database["public"]["Enums"]["mission_status_extended"]
          title: string
          updated_at?: string
          vehicle_brand?: string | null
          vehicle_model?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string
          delivery_address?: string | null
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
          license_plate?: string | null
          pickup_address?: string | null
          pickup_contact_email?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_date?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["mission_status_extended"]
          title?: string
          updated_at?: string
          vehicle_brand?: string | null
          vehicle_model?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Relationships: []
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
          created_at: string
          email: string
          full_name: string
          id: string
          is_verified: boolean | null
          preferences: Json | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_verified?: boolean | null
          preferences?: Json | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_verified?: boolean | null
          preferences?: Json | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_notification_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          device_type: string
          id: string
          is_active: boolean
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          device_type?: string
          id?: string
          is_active?: boolean
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          device_type?: string
          id?: string
          is_active?: boolean
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          missions_count: number | null
          net_profit: number | null
          report_type: string
          status: string
          title: string
          total_km: number | null
          total_revenue: number | null
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
          missions_count?: number | null
          net_profit?: number | null
          report_type: string
          status?: string
          title: string
          total_km?: number | null
          total_revenue?: number | null
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
          missions_count?: number | null
          net_profit?: number | null
          report_type?: string
          status?: string
          title?: string
          total_km?: number | null
          total_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      marketplace_missions: {
        Row: {
          id: string
          created_by: string
          convoyeur_id: string | null
          titre: string
          description: string | null
          ville_depart: string
          ville_arrivee: string
          date_depart: string
          prix_propose: number | null
          statut: string | null
          vehicule_requis: string | null
          contact_visible: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_by: string
          convoyeur_id?: string | null
          titre: string
          description?: string | null
          ville_depart: string
          ville_arrivee: string
          date_depart: string
          prix_propose?: number | null
          statut?: string | null
          vehicule_requis?: string | null
          contact_visible?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_by?: string
          convoyeur_id?: string | null
          titre?: string
          description?: string | null
          ville_depart?: string
          ville_arrivee?: string
          date_depart?: string
          prix_propose?: number | null
          statut?: string | null
          vehicule_requis?: string | null
          contact_visible?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_devis: {
        Row: {
          id: string
          mission_id: string
          convoyeur_id: string
          prix_propose: number
          message: string | null
          statut: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          mission_id: string
          convoyeur_id: string
          prix_propose: number
          message?: string | null
          statut?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          mission_id?: string
          convoyeur_id?: string
          prix_propose?: number
          message?: string | null
          statut?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    trajets_partages: {
        Row: {
          id: string
          convoyeur_id: string
          ville_depart: string
          ville_arrivee: string
          date_heure: string
          nb_places: number
          prix_par_place: number | null
      description: string | null
          participants: string[] | null
      statut: string | null
          created_at: string | null
      updated_at: string | null
        }
        Insert: {
          id?: string
          convoyeur_id: string
          ville_depart: string
          ville_arrivee: string
          date_heure: string
          nb_places: number
          prix_par_place?: number | null
      description?: string | null
          participants?: string[] | null
      statut?: string | null
      created_at?: string | null
      updated_at?: string | null
        }
        Update: {
          id?: string
          convoyeur_id?: string
          ville_depart?: string
          ville_arrivee?: string
          date_heure?: string
          nb_places?: number
          prix_par_place?: number | null
      description?: string | null
          participants?: string[] | null
      statut?: string | null
      created_at?: string | null
      updated_at?: string | null
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
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      contacts_with_stats: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          declined_at: string | null
          email: string | null
          id: string | null
          invited_at: string | null
          invited_user_id: string | null
          missions_count: number | null
          name: string | null
          status: Database["public"]["Enums"]["contact_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      public_mission_tracking: {
        Row: {
          created_at: string | null
          delivery_address: string | null
          delivery_date: string | null
          id: string | null
          pickup_address: string | null
          pickup_date: string | null
          reference: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          vehicle_brand: string | null
          vehicle_model: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          id?: string | null
          pickup_address?: string | null
          pickup_date?: string | null
          reference?: string | null
          status?: never
          title?: string | null
          updated_at?: string | null
          vehicle_brand?: string | null
          vehicle_model?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          id?: string | null
          pickup_address?: string | null
          pickup_date?: string | null
          reference?: string | null
          status?: never
          title?: string | null
          updated_at?: string | null
          vehicle_brand?: string | null
          vehicle_model?: string | null
        }
        Relationships: []
      }
      
    }
    Functions: {
      add_contact: {
        Args: { _contact_email: string; _contact_name?: string }
        Returns: Json
      }
      calculate_daily_analytics: {
        Args: { _date: string; _user_id: string }
        Returns: undefined
      }
      can_access_contact_stats: {
        Args: { contact_user_id: string }
        Returns: boolean
      }
      complete_mission_with_credit: {
        Args: { _mission_id: string; _user_id: string }
        Returns: boolean
      }
      consume_credit: {
        Args: {
          _credits: number
          _description?: string
          _mission_id: string
          _type: string
          _user_id: string
        }
        Returns: boolean
      }
      create_notification: {
        Args: {
          _message: string
          _title: string
          _type?: string
          _user_id: string
        }
        Returns: string
      }
      generate_invoice_number: {
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
      get_mission_by_tracking_token: {
        Args: { tracking_token: string }
        Returns: {
          delivery_city: string
          delivery_date: string
          id: string
          pickup_city: string
          pickup_date: string
          reference: string
          status: string
          title: string
          vehicle_brand: string
          vehicle_model: string
        }[]
      }
      has_pickup_report: {
        Args: { _mission_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      process_paypal_payment: {
        Args: {
          _amount: number
          _paypal_transaction_id: string
          _plan_type: string
          _user_id: string
        }
        Returns: Json
      }
      search_profiles_by_email: {
        Args: { query: string }
        Returns: {
          email: string
          full_name: string
          id: string
        }[]
      }
      send_push_notification: {
        Args: {
          _data?: Json
          _message: string
          _title: string
          _user_id: string
        }
        Returns: Json
      }
      transfer_credits: {
        Args: { _credits: number; _message?: string; _to_email: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "donneur_d_ordre" | "convoyeur"
      contact_status: "pending" | "accepted" | "declined" | "active"
      mission_status: "pending" | "in_progress" | "completed" | "cancelled"
      mission_status_extended:
        | "pending"
        | "inspection_start"
        | "in_progress"
        | "inspection_end"
        | "cost_validation"
        | "completed"
        | "cancelled"
      mission_workflow_status:
        | "pending"
        | "pickup_ready"
        | "pickup_in_progress"
        | "pickup_completed"
        | "delivery_in_progress"
        | "delivery_completed"
        | "completed"
      report_type: "pickup" | "delivery"
      user_role: "user" | "admin" | "moderator"
      user_status: "active" | "inactive" | "banned"
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
  public: {
    Enums: {
      app_role: ["admin", "donneur_d_ordre", "convoyeur"],
      contact_status: ["pending", "accepted", "declined", "active"],
      mission_status: ["pending", "in_progress", "completed", "cancelled"],
      mission_status_extended: [
        "pending",
        "inspection_start",
        "in_progress",
        "inspection_end",
        "cost_validation",
        "completed",
        "cancelled",
      ],
      mission_workflow_status: [
        "pending",
        "pickup_ready",
        "pickup_in_progress",
        "pickup_completed",
        "delivery_in_progress",
        "delivery_completed",
        "completed",
      ],
      report_type: ["pickup", "delivery"],
      user_role: ["user", "admin", "moderator"],
      user_status: ["active", "inactive", "banned"],
    },
  },
} as const
