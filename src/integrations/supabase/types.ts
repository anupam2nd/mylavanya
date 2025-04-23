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
      ArtistMST: {
        Row: {
          Active: boolean | null
          ArtistEmpCode: string | null
          ArtistFirstName: string | null
          Artistgrp: string | null
          ArtistId: number
          ArtistLastName: string | null
          ArtistPhno: number | null
          ArtistRating: number | null
          created_at: string
          emailid: string | null
          password: string | null
          Source: string | null
          userid: string | null
          uuid: string
        }
        Insert: {
          Active?: boolean | null
          ArtistEmpCode?: string | null
          ArtistFirstName?: string | null
          Artistgrp?: string | null
          ArtistId?: number
          ArtistLastName?: string | null
          ArtistPhno?: number | null
          ArtistRating?: number | null
          created_at?: string
          emailid?: string | null
          password?: string | null
          Source?: string | null
          userid?: string | null
          uuid?: string
        }
        Update: {
          Active?: boolean | null
          ArtistEmpCode?: string | null
          ArtistFirstName?: string | null
          Artistgrp?: string | null
          ArtistId?: number
          ArtistLastName?: string | null
          ArtistPhno?: number | null
          ArtistRating?: number | null
          created_at?: string
          emailid?: string | null
          password?: string | null
          Source?: string | null
          userid?: string | null
          uuid?: string
        }
        Relationships: []
      }
      BookMST: {
        Row: {
          Address: string | null
          ArtistId: number | null
          AssignedBY: string | null
          Assignedto: string | null
          AssignedToEmpCode: string | null
          AssingnedON: string | null
          Booking_date: string | null
          Booking_NO: number | null
          booking_time: string | null
          created_at: string | null
          email: string | null
          id: number
          jobno: number | null
          name: string | null
          Phone_no: number | null
          Pincode: number | null
          price: number | null
          Product: number | null
          ProductName: string | null
          Purpose: string | null
          Qty: number | null
          Scheme: string | null
          ServiceName: string | null
          Status: string | null
          StatusUpdated: string | null
          SubService: string | null
          uuid: string | null
        }
        Insert: {
          Address?: string | null
          ArtistId?: number | null
          AssignedBY?: string | null
          Assignedto?: string | null
          AssignedToEmpCode?: string | null
          AssingnedON?: string | null
          Booking_date?: string | null
          Booking_NO?: number | null
          booking_time?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          jobno?: number | null
          name?: string | null
          Phone_no?: number | null
          Pincode?: number | null
          price?: number | null
          Product?: number | null
          ProductName?: string | null
          Purpose?: string | null
          Qty?: number | null
          Scheme?: string | null
          ServiceName?: string | null
          Status?: string | null
          StatusUpdated?: string | null
          SubService?: string | null
          uuid?: string | null
        }
        Update: {
          Address?: string | null
          ArtistId?: number | null
          AssignedBY?: string | null
          Assignedto?: string | null
          AssignedToEmpCode?: string | null
          AssingnedON?: string | null
          Booking_date?: string | null
          Booking_NO?: number | null
          booking_time?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          jobno?: number | null
          name?: string | null
          Phone_no?: number | null
          Pincode?: number | null
          price?: number | null
          Product?: number | null
          ProductName?: string | null
          Purpose?: string | null
          Qty?: number | null
          Scheme?: string | null
          ServiceName?: string | null
          Status?: string | null
          StatusUpdated?: string | null
          SubService?: string | null
          uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "BookMST_AssignedToEmpCode_fkey"
            columns: ["AssignedToEmpCode"]
            isOneToOne: false
            referencedRelation: "ArtistMST"
            referencedColumns: ["ArtistEmpCode"]
          },
        ]
      }
      MemberMST: {
        Row: {
          id: number
          MemberAdress: string | null
          MemberDOB: string | null
          MemberEmailId: string | null
          MemberFirstName: string | null
          MemberLastName: string | null
          MemberPhNo: string | null
          MemberPincode: string | null
          MemberSex: string | null
          MemberStatus: boolean | null
          password: string | null
          uuid: string
        }
        Insert: {
          id?: number
          MemberAdress?: string | null
          MemberDOB?: string | null
          MemberEmailId?: string | null
          MemberFirstName?: string | null
          MemberLastName?: string | null
          MemberPhNo?: string | null
          MemberPincode?: string | null
          MemberSex?: string | null
          MemberStatus?: boolean | null
          password?: string | null
          uuid?: string
        }
        Update: {
          id?: number
          MemberAdress?: string | null
          MemberDOB?: string | null
          MemberEmailId?: string | null
          MemberFirstName?: string | null
          MemberLastName?: string | null
          MemberPhNo?: string | null
          MemberPincode?: string | null
          MemberSex?: string | null
          MemberStatus?: boolean | null
          password?: string | null
          uuid?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          booking_id: number
          booking_no: string
          change_type: string
          created_at: string
          id: number
          is_read: boolean
          message: string
          recipient_email: string
        }
        Insert: {
          booking_id: number
          booking_no: string
          change_type: string
          created_at?: string
          id?: number
          is_read?: boolean
          message: string
          recipient_email: string
        }
        Update: {
          booking_id?: number
          booking_no?: string
          change_type?: string
          created_at?: string
          id?: number
          is_read?: boolean
          message?: string
          recipient_email?: string
        }
        Relationships: []
      }
      PriceMST: {
        Row: {
          active: boolean | null
          Category: string | null
          created_at: string | null
          Description: string | null
          Discount: number | null
          NetPayable: number | null
          Price: number | null
          prod_id: number
          ProductName: string | null
          Scheme: string | null
          Services: string | null
          Subservice: string | null
          uuid: string
        }
        Insert: {
          active?: boolean | null
          Category?: string | null
          created_at?: string | null
          Description?: string | null
          Discount?: number | null
          NetPayable?: number | null
          Price?: number | null
          prod_id?: number
          ProductName?: string | null
          Scheme?: string | null
          Services?: string | null
          Subservice?: string | null
          uuid?: string
        }
        Update: {
          active?: boolean | null
          Category?: string | null
          created_at?: string | null
          Description?: string | null
          Discount?: number | null
          NetPayable?: number | null
          Price?: number | null
          prod_id?: number
          ProductName?: string | null
          Scheme?: string | null
          Services?: string | null
          Subservice?: string | null
          uuid?: string
        }
        Relationships: []
      }
      statusmst: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: number
          status_code: string
          status_name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: number
          status_code: string
          status_name: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: number
          status_code?: string
          status_name?: string
        }
        Relationships: []
      }
      UserMST: {
        Row: {
          active: boolean
          FirstName: string | null
          id: number
          LastName: string | null
          password: string | null
          PhoneNo: number | null
          role: string | null
          Username: string | null
          uuid: string
        }
        Insert: {
          active?: boolean
          FirstName?: string | null
          id?: number
          LastName?: string | null
          password?: string | null
          PhoneNo?: number | null
          role?: string | null
          Username?: string | null
          uuid?: string
        }
        Update: {
          active?: boolean
          FirstName?: string | null
          id?: number
          LastName?: string | null
          password?: string | null
          PhoneNo?: number | null
          role?: string | null
          Username?: string | null
          uuid?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: number
          service_id: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          service_id: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          service_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "PriceMST"
            referencedColumns: ["prod_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_to_wishlist: {
        Args: { service_id_param: number; user_id_param: string }
        Returns: undefined
      }
      get_booking_counts_by_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          status: string
          count: number
        }[]
      }
      get_revenue_by_service: {
        Args: Record<PropertyKey, never>
        Returns: {
          service_name: string
          total_revenue: number
        }[]
      }
      get_user_wishlist: {
        Args: { user_uuid: string }
        Returns: {
          id: number
          user_id: string
          service_id: number
          created_at: string
          service_name: string
          service_price: number
          service_category: string
          service_description: string
        }[]
      }
      remove_from_wishlist: {
        Args: { wishlist_id_param: number; user_id_param: string }
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
