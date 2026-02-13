export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'commercial'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'admin' | 'commercial'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'admin' | 'commercial'
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          name: string
          business_type: string
          address: string | null
          city: string
          postal_code: string | null
          phone: string | null
          email: string | null
          website: string | null
          google_maps_url: string | null
          rating: number | null
          review_count: number
          source_api: 'serper' | 'serpapi' | 'manual' | null
          scraped_at: string | null
          website_status: Database['public']['Enums']['website_status']
          website_quality: Database['public']['Enums']['website_quality'] | null
          is_mobile_friendly: boolean | null
          website_notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
          siret: string | null
          siren: string | null
          legal_name: string | null
          legal_form: string | null
          naf_code: string | null
          naf_label: string | null
          vat_number: string | null
          capital: string | null
          rcs_city: string | null
          headquarters_address: string | null
        }
        Insert: {
          id?: string
          name: string
          business_type: string
          address?: string | null
          city: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          google_maps_url?: string | null
          rating?: number | null
          review_count?: number
          source_api?: 'serper' | 'serpapi' | 'manual' | null
          scraped_at?: string | null
          website_status?: Database['public']['Enums']['website_status']
          website_quality?: Database['public']['Enums']['website_quality'] | null
          is_mobile_friendly?: boolean | null
          website_notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          siret?: string | null
          siren?: string | null
          legal_name?: string | null
          legal_form?: string | null
          naf_code?: string | null
          naf_label?: string | null
          vat_number?: string | null
          capital?: string | null
          rcs_city?: string | null
          headquarters_address?: string | null
        }
        Update: {
          name?: string
          business_type?: string
          address?: string | null
          city?: string
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          google_maps_url?: string | null
          rating?: number | null
          review_count?: number
          source_api?: 'serper' | 'serpapi' | 'manual' | null
          scraped_at?: string | null
          website_status?: Database['public']['Enums']['website_status']
          website_quality?: Database['public']['Enums']['website_quality'] | null
          is_mobile_friendly?: boolean | null
          website_notes?: string | null
          updated_at?: string
          siret?: string | null
          siren?: string | null
          legal_name?: string | null
          legal_form?: string | null
          naf_code?: string | null
          naf_label?: string | null
          vat_number?: string | null
          capital?: string | null
          rcs_city?: string | null
          headquarters_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'companies_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      contacts: {
        Row: {
          id: string
          company_id: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          email: string | null
          position: string | null
          status: Database['public']['Enums']['contact_status']
          assigned_to: string | null
          priority: Database['public']['Enums']['contact_priority']
          source: string | null
          notes: string | null
          deal_amount: number | null
          next_followup_at: string | null
          lost_reason: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          company_id?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          email?: string | null
          position?: string | null
          status?: Database['public']['Enums']['contact_status']
          assigned_to?: string | null
          priority?: Database['public']['Enums']['contact_priority']
          source?: string | null
          notes?: string | null
          deal_amount?: number | null
          next_followup_at?: string | null
          lost_reason?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          company_id?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          email?: string | null
          position?: string | null
          status?: Database['public']['Enums']['contact_status']
          assigned_to?: string | null
          priority?: Database['public']['Enums']['contact_priority']
          source?: string | null
          notes?: string | null
          deal_amount?: number | null
          next_followup_at?: string | null
          lost_reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'contacts_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contacts_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contacts_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      activities: {
        Row: {
          id: string
          contact_id: string
          user_id: string | null
          type: Database['public']['Enums']['activity_type']
          subject: string
          description: string | null
          scheduled_at: string | null
          completed_at: string | null
          duration_minutes: number | null
          location: string | null
          attendees: string[]
          meeting_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          user_id?: string | null
          type: Database['public']['Enums']['activity_type']
          subject: string
          description?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          location?: string | null
          attendees?: string[]
          meeting_notes?: string | null
          created_at?: string
        }
        Update: {
          contact_id?: string
          user_id?: string | null
          type?: Database['public']['Enums']['activity_type']
          subject?: string
          description?: string | null
          scheduled_at?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          location?: string | null
          attendees?: string[]
          meeting_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'activities_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'activities_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      status_changes: {
        Row: {
          id: string
          contact_id: string
          user_id: string | null
          old_status: Database['public']['Enums']['contact_status'] | null
          new_status: Database['public']['Enums']['contact_status']
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          user_id?: string | null
          old_status?: Database['public']['Enums']['contact_status'] | null
          new_status: Database['public']['Enums']['contact_status']
          note?: string | null
          created_at?: string
        }
        Update: {
          contact_id?: string
          user_id?: string | null
          old_status?: Database['public']['Enums']['contact_status'] | null
          new_status?: Database['public']['Enums']['contact_status']
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'status_changes_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'status_changes_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      scrape_jobs: {
        Row: {
          id: string
          query: string
          city: string
          status: Database['public']['Enums']['scrape_status']
          results_count: number
          api_used: 'serper' | 'serpapi' | null
          error_message: string | null
          created_by: string | null
          created_at: string
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          query: string
          city: string
          status?: Database['public']['Enums']['scrape_status']
          results_count?: number
          api_used?: 'serper' | 'serpapi' | null
          error_message?: string | null
          created_by?: string | null
          created_at?: string
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          query?: string
          city?: string
          status?: Database['public']['Enums']['scrape_status']
          results_count?: number
          api_used?: 'serper' | 'serpapi' | null
          error_message?: string | null
          started_at?: string | null
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'scrape_jobs_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      quotes: {
        Row: {
          id: string
          reference: string
          company_id: string | null
          contact_id: string | null
          status: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire'
          issued_at: string | null
          valid_until: string | null
          accepted_at: string | null
          total_ht: number
          discount_percent: number
          discount_amount: number
          total_after_discount: number
          tva_rate: number
          total_tva: number
          total_ttc: number
          client_name: string | null
          client_address: string | null
          client_siret: string | null
          client_vat_number: string | null
          notes: string | null
          conditions: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reference: string
          company_id?: string | null
          contact_id?: string | null
          status?: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire'
          issued_at?: string | null
          valid_until?: string | null
          accepted_at?: string | null
          total_ht?: number
          discount_percent?: number
          discount_amount?: number
          total_after_discount?: number
          tva_rate?: number
          total_tva?: number
          total_ttc?: number
          client_name?: string | null
          client_address?: string | null
          client_siret?: string | null
          client_vat_number?: string | null
          notes?: string | null
          conditions?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          reference?: string
          company_id?: string | null
          contact_id?: string | null
          status?: 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'expire'
          issued_at?: string | null
          valid_until?: string | null
          accepted_at?: string | null
          total_ht?: number
          discount_percent?: number
          discount_amount?: number
          total_after_discount?: number
          tva_rate?: number
          total_tva?: number
          total_ttc?: number
          client_name?: string | null
          client_address?: string | null
          client_siret?: string | null
          client_vat_number?: string | null
          notes?: string | null
          conditions?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'quotes_company_id_fkey'
            columns: ['company_id']
            isOneToOne: false
            referencedRelation: 'companies'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'quotes_contact_id_fkey'
            columns: ['contact_id']
            isOneToOne: false
            referencedRelation: 'contacts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'quotes_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      quote_lines: {
        Row: {
          id: string
          quote_id: string
          sort_order: number
          catalog_item_id: string | null
          label: string
          description: string | null
          quantity: number
          unit_price_ht: number
          discount_percent: number
          total_ht: number
          unit_label: string
          section: string | null
          created_at: string
        }
        Insert: {
          id?: string
          quote_id: string
          sort_order?: number
          catalog_item_id?: string | null
          label: string
          description?: string | null
          quantity?: number
          unit_price_ht?: number
          discount_percent?: number
          total_ht?: number
          unit_label?: string
          section?: string | null
          created_at?: string
        }
        Update: {
          quote_id?: string
          sort_order?: number
          catalog_item_id?: string | null
          label?: string
          description?: string | null
          quantity?: number
          unit_price_ht?: number
          discount_percent?: number
          total_ht?: number
          unit_label?: string
          section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'quote_lines_quote_id_fkey'
            columns: ['quote_id']
            isOneToOne: false
            referencedRelation: 'quotes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Enums: {
      contact_status:
        | 'a_contacter'
        | 'contacte'
        | 'rdv_planifie'
        | 'devis_envoye'
        | 'gagne'
        | 'perdu'
      contact_priority: 'basse' | 'moyenne' | 'haute'
      activity_type: 'appel' | 'email' | 'rdv' | 'note'
      scrape_status: 'pending' | 'running' | 'completed' | 'failed'
      website_status: 'pas_de_site' | 'site_existant' | 'inconnu'
      website_quality: 'bonne' | 'correcte' | 'mauvaise' | 'obsolete'
    }
  }
}
