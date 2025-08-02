export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          content: string
          created_at: string | null
          id: number
          quote_id: number | null
          read_at: string | null
          sent_at: string | null
          type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          quote_id?: number | null
          read_at?: string | null
          sent_at?: string | null
          type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          quote_id?: number | null
          read_at?: string | null
          sent_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_notifications_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      apartments: {
        Row: {
          base_price: number | null
          beds: number
          cleaning_fee: number | null
          created_at: string | null
          description: string | null
          features: string[] | null
          id: number
          name: string
        }
        Insert: {
          base_price?: number | null
          beds: number
          cleaning_fee?: number | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id: number
          name: string
        }
        Update: {
          base_price?: number | null
          beds?: number
          cleaning_fee?: number | null
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          apartment_id: number | null
          checkin_date: string
          checkout_date: string
          created_at: string | null
          deposit_paid: number | null
          guest_name: string
          guests_total: number
          id: number
          notes: string | null
          payment_method: string | null
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          apartment_id?: number | null
          checkin_date: string
          checkout_date: string
          created_at?: string | null
          deposit_paid?: number | null
          guest_name: string
          guests_total: number
          id?: number
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          apartment_id?: number | null
          checkin_date?: string
          checkout_date?: string
          created_at?: string | null
          deposit_paid?: number | null
          guest_name?: string
          guests_total?: number
          id?: number
          notes?: string | null
          payment_method?: string | null
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      date_blocks: {
        Row: {
          apartment_id: string | null
          block_reason: string | null
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          updated_at: string
        }
        Insert: {
          apartment_id?: string | null
          block_reason?: string | null
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          start_date: string
          updated_at?: string
        }
        Update: {
          apartment_id?: string | null
          block_reason?: string | null
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
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
      pricing_periods: {
        Row: {
          apartment_id: number | null
          created_at: string | null
          end_date: string
          id: number
          is_active: boolean | null
          season_name: string | null
          start_date: string
          updated_at: string | null
          weekly_price: number
        }
        Insert: {
          apartment_id?: number | null
          created_at?: string | null
          end_date: string
          id?: number
          is_active?: boolean | null
          season_name?: string | null
          start_date: string
          updated_at?: string | null
          weekly_price: number
        }
        Update: {
          apartment_id?: number | null
          created_at?: string | null
          end_date?: string
          id?: number
          is_active?: boolean | null
          season_name?: string | null
          start_date?: string
          updated_at?: string | null
          weekly_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_periods_apartment_id_fkey"
            columns: ["apartment_id"]
            isOneToOne: false
            referencedRelation: "apartments"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          adults: number
          base_total: number | null
          checkin_date: string
          checkout_date: string
          children: number
          children_no_bed: number
          created_at: string | null
          discount_total: number | null
          extras_total: number | null
          final_total: number | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          has_pet: boolean | null
          id: number
          linen_requested: boolean | null
          pet_apartment: number | null
          selected_apartments: number[] | null
          whatsapp_sent: boolean | null
        }
        Insert: {
          adults: number
          base_total?: number | null
          checkin_date: string
          checkout_date: string
          children: number
          children_no_bed: number
          created_at?: string | null
          discount_total?: number | null
          extras_total?: number | null
          final_total?: number | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          has_pet?: boolean | null
          id?: number
          linen_requested?: boolean | null
          pet_apartment?: number | null
          selected_apartments?: number[] | null
          whatsapp_sent?: boolean | null
        }
        Update: {
          adults?: number
          base_total?: number | null
          checkin_date?: string
          checkout_date?: string
          children?: number
          children_no_bed?: number
          created_at?: string | null
          discount_total?: number | null
          extras_total?: number | null
          final_total?: number | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          has_pet?: boolean | null
          id?: number
          linen_requested?: boolean | null
          pet_apartment?: number | null
          selected_apartments?: number[] | null
          whatsapp_sent?: boolean | null
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
          guest_phone: string | null
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
          guest_phone?: string | null
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
          guest_phone?: string | null
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
      season_config: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          season_end_day: number
          season_end_month: number
          season_start_day: number
          season_start_month: number
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          season_end_day?: number
          season_end_month?: number
          season_start_day?: number
          season_start_month?: number
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          season_end_day?: number
          season_end_month?: number
          season_start_day?: number
          season_start_month?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      website_visits: {
        Row: {
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          id: string
          ip_address: string | null
          latitude: number | null
          longitude: number | null
          page: string
          referrer: string | null
          region: string | null
          user_agent: string | null
          visit_date: string
          visit_time: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          latitude?: number | null
          longitude?: number | null
          page: string
          referrer?: string | null
          region?: string | null
          user_agent?: string | null
          visit_date?: string
          visit_time?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          latitude?: number | null
          longitude?: number | null
          page?: string
          referrer?: string | null
          region?: string | null
          user_agent?: string | null
          visit_date?: string
          visit_time?: string
        }
        Relationships: []
      }
      weekly_prices: {
        Row: {
          apartment_id: string
          created_at: string
          id: string
          price: number
          updated_at: string
          week_end: string
          week_number: number
          week_start: string
          year: number
        }
        Insert: {
          apartment_id: string
          created_at?: string
          id?: string
          price: number
          updated_at?: string
          week_end: string
          week_number: number
          week_start: string
          year: number
        }
        Update: {
          apartment_id?: string
          created_at?: string
          id?: string
          price?: number
          updated_at?: string
          week_end?: string
          week_number?: number
          week_start?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_apartment_specific_weeks: {
        Args: { target_year: number; copy_from_year?: number }
        Returns: number
      }
      generate_saturday_weeks_for_year: {
        Args: { target_year: number; copy_from_year?: number }
        Returns: number
      }
      generate_weekly_prices_by_date_mapping: {
        Args: { target_year: number; copy_from_year?: number }
        Returns: number
      }
      generate_weekly_prices_for_year: {
        Args: { target_year: number; copy_from_year?: number }
        Returns: number
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
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
    Enums: {},
  },
} as const
