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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      alert_thresholds: {
        Row: {
          capacity_critical_percentage: number
          capacity_warning_percentage: number
          created_at: string
          disease_outbreak_threshold: number
          document_expiry_critical_days: number
          document_expiry_warning_days: number
          id: string
          unvaccinated_children_threshold: number
          updated_at: string
        }
        Insert: {
          capacity_critical_percentage?: number
          capacity_warning_percentage?: number
          created_at?: string
          disease_outbreak_threshold?: number
          document_expiry_critical_days?: number
          document_expiry_warning_days?: number
          id?: string
          unvaccinated_children_threshold?: number
          updated_at?: string
        }
        Update: {
          capacity_critical_percentage?: number
          capacity_warning_percentage?: number
          created_at?: string
          disease_outbreak_threshold?: number
          document_expiry_critical_days?: number
          document_expiry_warning_days?: number
          id?: string
          unvaccinated_children_threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      child_diseases: {
        Row: {
          child_id: string
          created_at: string
          diagnosed_date: string
          disease_id: string
          health_record_id: string
          id: string
          notes: string | null
          severity: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          diagnosed_date?: string
          disease_id: string
          health_record_id: string
          id?: string
          notes?: string | null
          severity?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          diagnosed_date?: string
          disease_id?: string
          health_record_id?: string
          id?: string
          notes?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_diseases_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_diseases_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "diseases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_diseases_health_record_id_fkey"
            columns: ["health_record_id"]
            isOneToOne: false
            referencedRelation: "health_records"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birth_date: string | null
          created_at: string | null
          dhis2_tracked_entity_id: string | null
          entry_date: string | null
          estimated_age: number | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id: string
          internal_code: string | null
          orphanage_id: string | null
          parent_status: Database["public"]["Enums"]["parent_status"]
          photo_url: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          dhis2_tracked_entity_id?: string | null
          entry_date?: string | null
          estimated_age?: number | null
          full_name: string
          gender: Database["public"]["Enums"]["gender"]
          id?: string
          internal_code?: string | null
          orphanage_id?: string | null
          parent_status: Database["public"]["Enums"]["parent_status"]
          photo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          dhis2_tracked_entity_id?: string | null
          entry_date?: string | null
          estimated_age?: number | null
          full_name?: string
          gender?: Database["public"]["Enums"]["gender"]
          id?: string
          internal_code?: string | null
          orphanage_id?: string | null
          parent_status?: Database["public"]["Enums"]["parent_status"]
          photo_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_orphanage_id_fkey"
            columns: ["orphanage_id"]
            isOneToOne: false
            referencedRelation: "orphanages"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string | null
          id: string
          is_capital: boolean | null
          name: string
          population: number | null
          province_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_capital?: boolean | null
          name: string
          population?: number | null
          province_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_capital?: boolean | null
          name?: string
          population?: number | null
          province_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      dhis2_sync_logs: {
        Row: {
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          payload: Json | null
          response: Json | null
          status: Database["public"]["Enums"]["sync_status"] | null
          synced_at: string | null
        }
        Insert: {
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          payload?: Json | null
          response?: Json | null
          status?: Database["public"]["Enums"]["sync_status"] | null
          synced_at?: string | null
        }
        Update: {
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          payload?: Json | null
          response?: Json | null
          status?: Database["public"]["Enums"]["sync_status"] | null
          synced_at?: string | null
        }
        Relationships: []
      }
      diseases: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      health_records: {
        Row: {
          child_id: string | null
          chronic_conditions: string | null
          created_at: string | null
          date: string | null
          dhis2_event_id: string | null
          id: string
          medications: string | null
          remarks: string | null
          synced: boolean | null
          updated_at: string | null
          vaccination_status: string | null
          vaccination_status_structured: Json | null
        }
        Insert: {
          child_id?: string | null
          chronic_conditions?: string | null
          created_at?: string | null
          date?: string | null
          dhis2_event_id?: string | null
          id?: string
          medications?: string | null
          remarks?: string | null
          synced?: boolean | null
          updated_at?: string | null
          vaccination_status?: string | null
          vaccination_status_structured?: Json | null
        }
        Update: {
          child_id?: string | null
          chronic_conditions?: string | null
          created_at?: string | null
          date?: string | null
          dhis2_event_id?: string | null
          id?: string
          medications?: string | null
          remarks?: string | null
          synced?: boolean | null
          updated_at?: string | null
          vaccination_status?: string | null
          vaccination_status_structured?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      health_zones: {
        Row: {
          city_id: string | null
          code: string
          created_at: string | null
          dhis2_id: string | null
          id: string
          name: string
        }
        Insert: {
          city_id?: string | null
          code: string
          created_at?: string | null
          dhis2_id?: string | null
          id?: string
          name: string
        }
        Update: {
          city_id?: string | null
          code?: string
          created_at?: string | null
          dhis2_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_zones_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          capacity_alerts_enabled: boolean
          created_at: string
          document_expiry_enabled: boolean
          email_notifications_enabled: boolean
          id: string
          malnutrition_alerts_enabled: boolean
          orphanage_pending_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          capacity_alerts_enabled?: boolean
          created_at?: string
          document_expiry_enabled?: boolean
          email_notifications_enabled?: boolean
          id?: string
          malnutrition_alerts_enabled?: boolean
          orphanage_pending_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          capacity_alerts_enabled?: boolean
          created_at?: string
          document_expiry_enabled?: boolean
          email_notifications_enabled?: boolean
          id?: string
          malnutrition_alerts_enabled?: boolean
          orphanage_pending_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean
          message: string
          priority: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          message: string
          priority?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean
          message?: string
          priority?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nutrition_records: {
        Row: {
          bmi: number | null
          child_id: string | null
          created_at: string | null
          date: string | null
          dhis2_event_id: string | null
          height_cm: number | null
          id: string
          nutrition_status:
            | Database["public"]["Enums"]["nutrition_status"]
            | null
          synced: boolean | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          bmi?: number | null
          child_id?: string | null
          created_at?: string | null
          date?: string | null
          dhis2_event_id?: string | null
          height_cm?: number | null
          id?: string
          nutrition_status?:
            | Database["public"]["Enums"]["nutrition_status"]
            | null
          synced?: boolean | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          bmi?: number | null
          child_id?: string | null
          created_at?: string | null
          date?: string | null
          dhis2_event_id?: string | null
          height_cm?: number | null
          id?: string
          nutrition_status?:
            | Database["public"]["Enums"]["nutrition_status"]
            | null
          synced?: boolean | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      orphanage_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          expiry_date: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          orphanage_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type: string
          expiry_date?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          orphanage_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          expiry_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          orphanage_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orphanage_documents_orphanage_id_fkey"
            columns: ["orphanage_id"]
            isOneToOne: false
            referencedRelation: "orphanages"
            referencedColumns: ["id"]
          },
        ]
      }
      orphanages: {
        Row: {
          address: string | null
          annual_disease_rate: number | null
          boys_count: number | null
          child_capacity: number | null
          children_total: number | null
          city: string
          city_id: string | null
          contact_person: string
          created_at: string | null
          created_by: string | null
          description: string | null
          dhis2_orgunit_id: string | null
          documents: Json | null
          email: string | null
          girls_count: number | null
          id: string
          legal_status: Database["public"]["Enums"]["legal_status"] | null
          location_gps: unknown | null
          meals_per_day: number | null
          name: string
          phone: string | null
          photo_url: string | null
          province: string
          province_id: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          schooling_rate: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          annual_disease_rate?: number | null
          boys_count?: number | null
          child_capacity?: number | null
          children_total?: number | null
          city: string
          city_id?: string | null
          contact_person: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dhis2_orgunit_id?: string | null
          documents?: Json | null
          email?: string | null
          girls_count?: number | null
          id?: string
          legal_status?: Database["public"]["Enums"]["legal_status"] | null
          location_gps?: unknown | null
          meals_per_day?: number | null
          name: string
          phone?: string | null
          photo_url?: string | null
          province: string
          province_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          schooling_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          annual_disease_rate?: number | null
          boys_count?: number | null
          child_capacity?: number | null
          children_total?: number | null
          city?: string
          city_id?: string | null
          contact_person?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          dhis2_orgunit_id?: string | null
          documents?: Json | null
          email?: string | null
          girls_count?: number | null
          id?: string
          legal_status?: Database["public"]["Enums"]["legal_status"] | null
          location_gps?: unknown | null
          meals_per_day?: number | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          province?: string
          province_id?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          schooling_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orphanages_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orphanages_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orphanages_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orphanages_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_access_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          resource: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          resource?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_access_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_requests: {
        Row: {
          contact_person: string
          created_at: string
          description: string | null
          email: string
          id: string
          organization_name: string
          organization_type: string
          phone: string | null
          purpose: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contact_person: string
          created_at?: string
          description?: string | null
          email: string
          id?: string
          organization_name: string
          organization_type: string
          phone?: string | null
          purpose: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contact_person?: string
          created_at?: string
          description?: string | null
          email?: string
          id?: string
          organization_name?: string
          organization_type?: string
          phone?: string | null
          purpose?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          area_km2: number | null
          capital: string
          code: string
          created_at: string | null
          id: string
          name: string
          population: number | null
        }
        Insert: {
          area_km2?: number | null
          capital: string
          code: string
          created_at?: string | null
          id?: string
          name: string
          population?: number | null
        }
        Update: {
          area_km2?: number | null
          capital?: string
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          population?: number | null
        }
        Relationships: []
      }
      user_orphanage_links: {
        Row: {
          created_at: string
          id: string
          orphanage_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          orphanage_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          orphanage_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_orphanage_links_orphanage_id_fkey"
            columns: ["orphanage_id"]
            isOneToOne: false
            referencedRelation: "orphanages"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      city_stats: {
        Row: {
          children_count: number | null
          city: string | null
          city_type: string | null
          orphanages_count: number | null
          province: string | null
        }
        Relationships: []
      }
      province_stats: {
        Row: {
          children_count: number | null
          malnourished: number | null
          orphanages_count: number | null
          province: string | null
          province_code: string | null
          well_nourished: number | null
        }
        Relationships: []
      }
      public_stats: {
        Row: {
          malnourished_children: number | null
          total_children: number | null
          total_orphanages: number | null
          total_provinces: number | null
          verified_orphanages: number | null
          well_nourished_children: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_notification: {
        Args: {
          notification_entity_id?: string
          notification_entity_type?: string
          notification_message: string
          notification_priority?: string
          notification_title: string
          notification_type: string
          target_user_id: string
        }
        Returns: string
      }
      create_user_account: {
        Args: {
          orphanage_id_param?: string
          user_email: string
          user_password: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Returns: Json
      }
      execute_sql: {
        Args: { query: string }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_partner_access: {
        Args: {
          action_type: string
          resource_accessed?: string
          user_agent_string?: string
          user_ip?: unknown
        }
        Returns: string
      }
      update_partner_request_status: {
        Args: {
          new_status: string
          request_id: string
          reviewed_by_user: string
        }
        Returns: boolean
      }
      user_orphanage_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      gender: "M" | "F"
      legal_status: "pending" | "verified" | "rejected"
      nutrition_status: "normal" | "malnourished" | "severely_malnourished"
      parent_status: "total_orphan" | "partial_orphan" | "abandoned"
      sync_status: "pending" | "success" | "failed"
      user_role: "admin" | "orphelinat" | "partner"
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
      gender: ["M", "F"],
      legal_status: ["pending", "verified", "rejected"],
      nutrition_status: ["normal", "malnourished", "severely_malnourished"],
      parent_status: ["total_orphan", "partial_orphan", "abandoned"],
      sync_status: ["pending", "success", "failed"],
      user_role: ["admin", "orphelinat", "partner"],
    },
  },
} as const
