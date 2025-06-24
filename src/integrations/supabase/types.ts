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
      apartments: {
        Row: {
          bedrooms: number | null
          beds: number | null
          capacity: number
          cin: string | null
          cleaning_fee: number | null
          created_at: string | null
          description: string | null
          floor: string | null
          has_air_conditioning: boolean | null
          has_terrace: boolean | null
          has_veranda: boolean | null
          id: string
          images: Json | null
          long_description: string | null
          name: string
          price: number | null
          services: Json | null
          size: number | null
          updated_at: string | null
          view: string | null
        }
        Insert: {
          bedrooms?: number | null
          beds?: number | null
          capacity: number
          cin?: string | null
          cleaning_fee?: number | null
          created_at?: string | null
          description?: string | null
          floor?: string | null
          has_air_conditioning?: boolean | null
          has_terrace?: boolean | null
          has_veranda?: boolean | null
          id: string
          images?: Json | null
          long_description?: string | null
          name: string
          price?: number | null
          services?: Json | null
          size?: number | null
          updated_at?: string | null
          view?: string | null
        }
        Update: {
          bedrooms?: number | null
          beds?: number | null
          capacity?: number
          cin?: string | null
          cleaning_fee?: number | null
          created_at?: string | null
          description?: string | null
          floor?: string | null
          has_air_conditioning?: boolean | null
          has_terrace?: boolean | null
          has_veranda?: boolean | null
          id?: string
          images?: Json | null
          long_description?: string | null
          name?: string
          price?: number | null
          services?: Json | null
          size?: number | null
          updated_at?: string | null
          view?: string | null
        }
        Relationships: []
      }
      cleaning_tasks: {
        Row: {
          actual_duration: number | null
          apartment_id: string
          assignee: string | null
          created_at: string | null
          device_id: string | null
          estimated_duration: number | null
          id: string
          notes: string | null
          priority: string
          status: string
          task_date: string
          task_type: string
          updated_at: string | null
        }
        Insert: {
          actual_duration?: number | null
          apartment_id: string
          assignee?: string | null
          created_at?: string | null
          device_id?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          task_date: string
          task_type?: string
          updated_at?: string | null
        }
        Update: {
          actual_duration?: number | null
          apartment_id?: string
          assignee?: string | null
          created_at?: string | null
          device_id?: string | null
          estimated_duration?: number | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          task_date?: string
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cleaning_tasks_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_cleaning_tasks_apartment"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_analytics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          country_breakdown: Json | null
          created_at: string
          date: string
          device_breakdown: Json | null
          id: string
          top_pages: Json | null
          top_referrers: Json | null
          total_page_views: number | null
          unique_visitors: number | null
          updated_at: string
        }
        Insert: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          country_breakdown?: Json | null
          created_at?: string
          date: string
          device_breakdown?: Json | null
          id?: string
          top_pages?: Json | null
          top_referrers?: Json | null
          total_page_views?: number | null
          unique_visitors?: number | null
          updated_at?: string
        }
        Update: {
          avg_session_duration?: number | null
          bounce_rate?: number | null
          country_breakdown?: Json | null
          created_at?: string
          date?: string
          device_breakdown?: Json | null
          id?: string
          top_pages?: Json | null
          top_referrers?: Json | null
          total_page_views?: number | null
          unique_visitors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      images: {
        Row: {
          alt_text: string | null
          apartment_id: string | null
          category: string
          created_at: string
          display_order: number | null
          file_name: string
          file_path: string
          id: string
          is_cover: boolean | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          apartment_id?: string | null
          category: string
          created_at?: string
          display_order?: number | null
          file_name: string
          file_path: string
          id?: string
          is_cover?: boolean | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          apartment_id?: string | null
          category?: string
          created_at?: string
          display_order?: number | null
          file_name?: string
          file_path?: string
          id?: string
          is_cover?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          exit_page: boolean | null
          id: string
          page_title: string | null
          page_url: string
          scroll_depth: number | null
          session_id: string
          time_on_page: number | null
          timestamp: string
        }
        Insert: {
          exit_page?: boolean | null
          id?: string
          page_title?: string | null
          page_url: string
          scroll_depth?: number | null
          session_id: string
          time_on_page?: number | null
          timestamp?: string
        }
        Update: {
          exit_page?: boolean | null
          id?: string
          page_title?: string | null
          page_url?: string
          scroll_depth?: number | null
          session_id?: string
          time_on_page?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_views_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "visitor_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      prices: {
        Row: {
          apartment_id: string
          created_at: string | null
          id: number
          price: number
          updated_at: string | null
          week_start: string
          year: number
        }
        Insert: {
          apartment_id: string
          created_at?: string | null
          id?: number
          price: number
          updated_at?: string | null
          week_start: string
          year: number
        }
        Update: {
          apartment_id?: string
          created_at?: string | null
          id?: number
          price?: number
          updated_at?: string | null
          week_start?: string
          year?: number
        }
        Relationships: []
      }
      quote_logs: {
        Row: {
          completed: boolean
          created_at: string
          form_values: Json
          id: string
          step: number
          timestamp: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          form_values: Json
          id: string
          step: number
          timestamp?: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          form_values?: Json
          id?: string
          step?: number
          timestamp?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          adults: number
          apartment_ids: Json
          children: number | null
          created_at: string | null
          cribs: number | null
          deposit_amount: number | null
          device_id: string | null
          end_date: string
          final_price: number | null
          guest_name: string
          has_pets: boolean | null
          id: string
          linen_option: string | null
          notes: string | null
          payment_method: string | null
          payment_status: string | null
          start_date: string
          updated_at: string | null
        }
        Insert: {
          adults?: number
          apartment_ids: Json
          children?: number | null
          created_at?: string | null
          cribs?: number | null
          deposit_amount?: number | null
          device_id?: string | null
          end_date: string
          final_price?: number | null
          guest_name: string
          has_pets?: boolean | null
          id: string
          linen_option?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          start_date: string
          updated_at?: string | null
        }
        Update: {
          adults?: number
          apartment_ids?: Json
          children?: number | null
          created_at?: string | null
          cribs?: number | null
          deposit_amount?: number | null
          device_id?: string | null
          end_date?: string
          final_price?: number | null
          guest_name?: string
          has_pets?: boolean | null
          id?: string
          linen_option?: string | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string | null
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          created_at: string
          id: string
          page: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id: string
          page: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          page?: string
          timestamp?: string
        }
        Relationships: []
      }
      visitor_interactions: {
        Row: {
          additional_data: Json | null
          element_class: string | null
          element_id: string | null
          element_text: string | null
          id: string
          interaction_type: string
          page_url: string
          session_id: string
          timestamp: string
        }
        Insert: {
          additional_data?: Json | null
          element_class?: string | null
          element_id?: string | null
          element_text?: string | null
          id?: string
          interaction_type: string
          page_url: string
          session_id: string
          timestamp?: string
        }
        Update: {
          additional_data?: Json | null
          element_class?: string | null
          element_id?: string | null
          element_text?: string | null
          id?: string
          interaction_type?: string
          page_url?: string
          session_id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitor_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "visitor_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      visitor_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          first_visit: string
          id: string
          is_bounce: boolean | null
          language: string | null
          last_activity: string
          operating_system: string | null
          page_views_count: number | null
          referrer: string | null
          screen_resolution: string | null
          session_duration: number | null
          session_id: string
          timezone: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_ip: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          first_visit?: string
          id?: string
          is_bounce?: boolean | null
          language?: string | null
          last_activity?: string
          operating_system?: string | null
          page_views_count?: number | null
          referrer?: string | null
          screen_resolution?: string | null
          session_duration?: number | null
          session_id: string
          timezone?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_ip?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          first_visit?: string
          id?: string
          is_bounce?: boolean | null
          language?: string | null
          last_activity?: string
          operating_system?: string | null
          page_views_count?: number | null
          referrer?: string | null
          screen_resolution?: string | null
          session_duration?: number | null
          session_id?: string
          timezone?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_ip?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aggregate_daily_analytics: {
        Args: { target_date?: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
