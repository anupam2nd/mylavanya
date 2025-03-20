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
      BookMST: {
        Row: {
          Address: string | null
          Booking_date: string
          Booking_NO: string | null
          booking_time: string
          created_at: string | null
          email: string | null
          id: number
          name: string | null
          Phone_no: number
          Pincode: number | null
          price: number | null
          Product: number | null
          Purpose: string
          Qty: number | null
          Status: string | null
        }
        Insert: {
          Address?: string | null
          Booking_date: string
          Booking_NO?: string | null
          booking_time: string
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string | null
          Phone_no: number
          Pincode?: number | null
          price?: number | null
          Product?: number | null
          Purpose: string
          Qty?: number | null
          Status?: string | null
        }
        Update: {
          Address?: string | null
          Booking_date?: string
          Booking_NO?: string | null
          booking_time?: string
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string | null
          Phone_no?: number
          Pincode?: number | null
          price?: number | null
          Product?: number | null
          Purpose?: string
          Qty?: number | null
          Status?: string | null
        }
        Relationships: []
      }
      PriceMST: {
        Row: {
          created_at: string
          Description: string | null
          Price: number
          prod_id: number
          ProductName: string | null
          Services: string
        }
        Insert: {
          created_at?: string
          Description?: string | null
          Price: number
          prod_id?: number
          ProductName?: string | null
          Services?: string
        }
        Update: {
          created_at?: string
          Description?: string | null
          Price?: number
          prod_id?: number
          ProductName?: string | null
          Services?: string
        }
        Relationships: []
      }
      statusmst: {
        Row: {
          created_at: string
          description: string | null
          id: number
          status_code: string
          status_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          status_code: string
          status_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          status_code?: string
          status_name?: string
        }
        Relationships: []
      }
      usermst: {
        Row: {
          id: number
          password: string | null
          role: string
          username: string | null
        }
        Insert: {
          id?: number
          password?: string | null
          role?: string
          username?: string | null
        }
        Update: {
          id?: number
          password?: string | null
          role?: string
          username?: string | null
        }
        Relationships: []
      }
      UserMST: {
        Row: {
          id: number
          password: string | null
          role: string | null
          Username: string | null
        }
        Insert: {
          id?: number
          password?: string | null
          role?: string | null
          Username?: string | null
        }
        Update: {
          id?: number
          password?: string | null
          role?: string | null
          Username?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
