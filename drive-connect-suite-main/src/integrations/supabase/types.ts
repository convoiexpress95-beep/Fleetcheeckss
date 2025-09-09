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
      admin_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: number
          maintenance_enabled: boolean
          maintenance_message: string | null
          max_login_attempts: number
          notifications_enabled: boolean
          sender_email: string | null
          session_duration: number
          sms_notifications: boolean
          smtp_port: number
          smtp_server: string | null
          two_factor_auth: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id: number
          maintenance_enabled?: boolean
          maintenance_message?: string | null
          max_login_attempts?: number
          notifications_enabled?: boolean
          sender_email?: string | null
          session_duration?: number
          sms_notifications?: boolean
          smtp_port?: number
          smtp_server?: string | null
          two_factor_auth?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: number
          maintenance_enabled?: boolean
          maintenance_message?: string | null
          max_login_attempts?: number
          notifications_enabled?: boolean
          sender_email?: string | null
          session_duration?: number
          sms_notifications?: boolean
          smtp_port?: number
          smtp_server?: string | null
          two_factor_auth?: boolean
          updated_at?: string
        }
        Relationships: []
      }
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
            referencedRelation: "marketplace_missions"
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
      marketplace_devis: {
        Row: {
          contest_reason: string | null
          contested_at: string | null
          convoyeur_id: string
          counter_offer: number | null
          created_at: string | null
          id: string
          message: string | null
          mission_id: string
          original_price: number | null
          prix_propose: number
          response_deadline: string | null
          statut: string | null
          updated_at: string | null
        }
        Insert: {
          contest_reason?: string | null
          contested_at?: string | null
          convoyeur_id: string
          counter_offer?: number | null
          created_at?: string | null
          id?: string
          message?: string | null
          mission_id: string
          original_price?: number | null
          prix_propose: number
          response_deadline?: string | null
          statut?: string | null
          updated_at?: string | null
        }
        Update: {
          contest_reason?: string | null
          contested_at?: string | null
          convoyeur_id?: string
          counter_offer?: number | null
          created_at?: string | null
          id?: string
          message?: string | null
          mission_id?: string
          original_price?: number | null
          prix_propose?: number
          response_deadline?: string | null
          statut?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_devis_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "marketplace_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_missions: {
        Row: {
          contact_visible: boolean | null
          convoyeur_id: string | null
          created_at: string | null
          created_by: string
          date_depart: string
          description: string | null
          id: string
          prix_propose: number | null
          statut: string | null
          titre: string
          updated_at: string | null
          vehicule_requis: string | null
          ville_arrivee: string
          ville_depart: string
        }
        Insert: {
          contact_visible?: boolean | null
          convoyeur_id?: string | null
          created_at?: string | null
          created_by: string
          date_depart: string
          description?: string | null
          id?: string
          prix_propose?: number | null
          statut?: string | null
          titre: string
          updated_at?: string | null
          vehicule_requis?: string | null
          ville_arrivee: string
          ville_depart: string
        }
        Update: {
          contact_visible?: boolean | null
          convoyeur_id?: string | null
          created_at?: string | null
          created_by?: string
          date_depart?: string
          description?: string | null
          id?: string
          prix_propose?: number | null
          statut?: string | null
          titre?: string
          updated_at?: string | null
          vehicule_requis?: string | null
          ville_arrivee?: string
          ville_depart?: string
        }
        Relationships: []
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
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
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
          applicant_user_id: string
          created_at: string
          id: string
          message: string | null
          mission_id: string
          price_offer: number | null
          status: string
        }
        Insert: {
          applicant_user_id: string
          created_at?: string
          id?: string
          message?: string | null
          mission_id: string
          price_offer?: number | null
          status?: string
        }
        Update: {
          applicant_user_id?: string
          created_at?: string
          id?: string
          message?: string | null
          mission_id?: string
          price_offer?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_applications_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
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
          kind: Database["public"]["Enums"]["mission_kind"] | null
          license_plate: string | null
          pickup_address: string | null
          pickup_contact_email: string | null
          pickup_contact_name: string | null
          pickup_contact_phone: string | null
          pickup_date: string | null
          reference: string
          requirement_assurance_tous_risques: boolean
          requirement_convoyeur: boolean
          requirement_porte_10: boolean
          requirement_transporteur_plateau: boolean
          requirement_w_garage: boolean
          status: Database["public"]["Enums"]["mission_status_extended"]
          title: string
          updated_at: string
          vehicle_body_type: string | null
          vehicle_brand: string | null
          vehicle_image_path: string | null
          vehicle_model: string | null
          vehicle_model_id: string | null
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
          kind?: Database["public"]["Enums"]["mission_kind"] | null
          license_plate?: string | null
          pickup_address?: string | null
          pickup_contact_email?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_date?: string | null
          reference: string
          requirement_assurance_tous_risques?: boolean
          requirement_convoyeur?: boolean
          requirement_porte_10?: boolean
          requirement_transporteur_plateau?: boolean
          requirement_w_garage?: boolean
          status?: Database["public"]["Enums"]["mission_status_extended"]
          title: string
          updated_at?: string
          vehicle_body_type?: string | null
          vehicle_brand?: string | null
          vehicle_image_path?: string | null
          vehicle_model?: string | null
          vehicle_model_id?: string | null
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
          kind?: Database["public"]["Enums"]["mission_kind"] | null
          license_plate?: string | null
          pickup_address?: string | null
          pickup_contact_email?: string | null
          pickup_contact_name?: string | null
          pickup_contact_phone?: string | null
          pickup_date?: string | null
          reference?: string
          requirement_assurance_tous_risques?: boolean
          requirement_convoyeur?: boolean
          requirement_porte_10?: boolean
          requirement_transporteur_plateau?: boolean
          requirement_w_garage?: boolean
          status?: Database["public"]["Enums"]["mission_status_extended"]
          title?: string
          updated_at?: string
          vehicle_body_type?: string | null
          vehicle_brand?: string | null
          vehicle_image_path?: string | null
          vehicle_model?: string | null
          vehicle_model_id?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Relationships: [
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
          avatar_url: string | null
          company_name: string | null
          convoyeur_status: string | null
          created_at: string
          driving_experience: number | null
          driving_license: string | null
          email: string
          full_name: string
          garage_document_url: string | null
          id: string
          is_verified: boolean | null
          kbis_document_url: string | null
          license_document_url: string | null
          motivation: string | null
          phone: string | null
          preferences: Json | null
          siret: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
          user_type: string | null
          vehicle_types: string | null
          verification_notes: string | null
          verification_status: string | null
          vigilance_document_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          convoyeur_status?: string | null
          created_at?: string
          driving_experience?: number | null
          driving_license?: string | null
          email: string
          full_name: string
          garage_document_url?: string | null
          id?: string
          is_verified?: boolean | null
          kbis_document_url?: string | null
          license_document_url?: string | null
          motivation?: string | null
          phone?: string | null
          preferences?: Json | null
          siret?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
          user_type?: string | null
          vehicle_types?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          vigilance_document_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          convoyeur_status?: string | null
          created_at?: string
          driving_experience?: number | null
          driving_license?: string | null
          email?: string
          full_name?: string
          garage_document_url?: string | null
          id?: string
          is_verified?: boolean | null
          kbis_document_url?: string | null
          license_document_url?: string | null
          motivation?: string | null
          phone?: string | null
          preferences?: Json | null
          siret?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
          user_type?: string | null
          vehicle_types?: string | null
          verification_notes?: string | null
          verification_status?: string | null
          vigilance_document_url?: string | null
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
          client_id: string
          created_at: string
          id: string
          legal_mentions: string | null
          notes: string | null
          payment_method: string | null
          payment_terms: string | null
          quote_date: string
          quote_number: string
          status: string
          subtotal_ht: number
          total_ttc: number
          updated_at: string | null
          user_id: string
          validity_date: string
          vat_amount: number
          vat_rate: number | null
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          legal_mentions?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          quote_date?: string
          quote_number: string
          status?: string
          subtotal_ht?: number
          total_ttc?: number
          updated_at?: string | null
          user_id: string
          validity_date: string
          vat_amount?: number
          vat_rate?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          legal_mentions?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_terms?: string | null
          quote_date?: string
          quote_number?: string
          status?: string
          subtotal_ht?: number
          total_ttc?: number
          updated_at?: string | null
          user_id?: string
          validity_date?: string
          vat_amount?: number
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
      ride_favorites: {
        Row: {
          created_at: string
          ride_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ride_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          ride_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_favorites_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_message_reads: {
        Row: {
          created_at: string
          last_read_at: string
          peer_user_id: string
          read_at: string | null
          ride_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          last_read_at?: string
          peer_user_id: string
          read_at?: string | null
          ride_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          last_read_at?: string
          peer_user_id?: string
          read_at?: string | null
          ride_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_message_reads_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_messages: {
        Row: {
          body: string
          content: string | null
          created_at: string
          id: string
          recipient_id: string | null
          ride_id: string
          sender_id: string
        }
        Insert: {
          body: string
          content?: string | null
          created_at?: string
          id?: string
          recipient_id?: string | null
          ride_id: string
          sender_id: string
        }
        Update: {
          body?: string
          content?: string | null
          created_at?: string
          id?: string
          recipient_id?: string | null
          ride_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_messages_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          passenger_id: string
          ride_id: string
          seats_requested: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          passenger_id: string
          ride_id: string
          seats_requested: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          passenger_id?: string
          ride_id?: string
          seats_requested?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_requests_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_reservations: {
        Row: {
          created_at: string
          id: string
          message: string | null
          passenger_id: string
          price_at_booking: number
          ride_id: string
          seats: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          passenger_id: string
          price_at_booking: number
          ride_id: string
          seats?: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          passenger_id?: string
          price_at_booking?: number
          ride_id?: string
          seats?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_reservations_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          arrival_time: string | null
          comfort: string | null
          created_at: string
          date: string
          departure: string | null
          departure_time: string
          description: string | null
          destination: string | null
          driver_id: string | null
          duration_min: number | null
          duration_minutes: number | null
          from_city: string
          from_lat: number | null
          from_lng: number | null
          id: string
          instant: boolean
          options: string[] | null
          price: number | null
          price_per_seat: number
          route: string[] | null
          seats: number
          seats_available: number
          seats_total: number | null
          status: string | null
          to_city: string
          to_lat: number | null
          to_lng: number | null
          updated_at: string
          user_id: string
          vehicle_model: string | null
        }
        Insert: {
          arrival_time?: string | null
          comfort?: string | null
          created_at?: string
          date: string
          departure?: string | null
          departure_time: string
          description?: string | null
          destination?: string | null
          driver_id?: string | null
          duration_min?: number | null
          duration_minutes?: number | null
          from_city: string
          from_lat?: number | null
          from_lng?: number | null
          id?: string
          instant?: boolean
          options?: string[] | null
          price?: number | null
          price_per_seat: number
          route?: string[] | null
          seats: number
          seats_available: number
          seats_total?: number | null
          status?: string | null
          to_city: string
          to_lat?: number | null
          to_lng?: number | null
          updated_at?: string
          user_id: string
          vehicle_model?: string | null
        }
        Update: {
          arrival_time?: string | null
          comfort?: string | null
          created_at?: string
          date?: string
          departure?: string | null
          departure_time?: string
          description?: string | null
          destination?: string | null
          driver_id?: string | null
          duration_min?: number | null
          duration_minutes?: number | null
          from_city?: string
          from_lat?: number | null
          from_lng?: number | null
          id?: string
          instant?: boolean
          options?: string[] | null
          price?: number | null
          price_per_seat?: number
          route?: string[] | null
          seats?: number
          seats_available?: number
          seats_total?: number | null
          status?: string | null
          to_city?: string
          to_lat?: number | null
          to_lng?: number | null
          updated_at?: string
          user_id?: string
          vehicle_model?: string | null
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
      trajets_partages: {
        Row: {
          convoyeur_id: string
          created_at: string | null
          date_heure: string
          description: string | null
          end_lat: number | null
          end_lng: number | null
          id: string
          nb_places: number
          participants: string[] | null
          prix_par_place: number | null
          start_lat: number | null
          start_lng: number | null
          statut: string | null
          updated_at: string | null
          ville_arrivee: string
          ville_depart: string
        }
        Insert: {
          convoyeur_id: string
          created_at?: string | null
          date_heure: string
          description?: string | null
          end_lat?: number | null
          end_lng?: number | null
          id?: string
          nb_places?: number
          participants?: string[] | null
          prix_par_place?: number | null
          start_lat?: number | null
          start_lng?: number | null
          statut?: string | null
          updated_at?: string | null
          ville_arrivee: string
          ville_depart: string
        }
        Update: {
          convoyeur_id?: string
          created_at?: string | null
          date_heure?: string
          description?: string | null
          end_lat?: number | null
          end_lng?: number | null
          id?: string
          nb_places?: number
          participants?: string[] | null
          prix_par_place?: number | null
          start_lat?: number | null
          start_lng?: number | null
          statut?: string | null
          updated_at?: string | null
          ville_arrivee?: string
          ville_depart?: string
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
      vehicle_models: {
        Row: {
          body_type: string
          created_at: string
          generation: string | null
          id: string
          image_path: string | null
          make: string
          model: string
          updated_at: string
        }
        Insert: {
          body_type: string
          created_at?: string
          generation?: string | null
          id?: string
          image_path?: string | null
          make: string
          model: string
          updated_at?: string
        }
        Update: {
          body_type?: string
          created_at?: string
          generation?: string | null
          id?: string
          image_path?: string | null
          make?: string
          model?: string
          updated_at?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          document_name: string
          document_type: string
          document_url: string
          id: string
          status: string | null
          updated_at: string | null
          upload_date: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          document_name: string
          document_type: string
          document_url: string
          id?: string
          status?: string | null
          updated_at?: string | null
          upload_date?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          document_name?: string
          document_type?: string
          document_url?: string
          id?: string
          status?: string | null
          updated_at?: string | null
          upload_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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
      get_contact_mission_count: {
        Args: { contact_user_id: string }
        Returns: number
      }
      get_contacts_with_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          accepted_at: string
          created_at: string
          declined_at: string
          email: string
          id: string
          invited_at: string
          invited_user_id: string
          missions_count: number
          name: string
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
          user_id: string
        }[]
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
      get_trackable_missions: {
        Args: { tracking_token?: string }
        Returns: {
          created_at: string
          delivery_address: string
          delivery_date: string
          id: string
          pickup_address: string
          pickup_date: string
          reference: string
          status: string
          title: string
          updated_at: string
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
      mark_ride_thread_read: {
        Args: { _peer_user_id: string; _ride_id: string }
        Returns: undefined
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
      search_rides: {
        Args: {
          _date: string
          _from_text: string
          _instant_only: boolean
          _max_price: number
          _seats_min: number
          _to_text: string
        }
        Returns: {
          arrival_time: string | null
          comfort: string | null
          created_at: string
          date: string
          departure: string | null
          departure_time: string
          description: string | null
          destination: string | null
          driver_id: string | null
          duration_min: number | null
          duration_minutes: number | null
          from_city: string
          from_lat: number | null
          from_lng: number | null
          id: string
          instant: boolean
          options: string[] | null
          price: number | null
          price_per_seat: number
          route: string[] | null
          seats: number
          seats_available: number
          seats_total: number | null
          status: string | null
          to_city: string
          to_lat: number | null
          to_lng: number | null
          updated_at: string
          user_id: string
          vehicle_model: string | null
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
      transfer_credits: {
        Args: { _credits: number; _message?: string; _to_email: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "donneur_d_ordre" | "convoyeur"
      contact_status: "pending" | "accepted" | "declined" | "active"
      mission_kind: "marketplace" | "inspection"
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
      mission_kind: ["marketplace", "inspection"],
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
