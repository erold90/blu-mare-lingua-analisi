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
      admin_users: {
        Row: {
          created_at: string | null
          id: string
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
