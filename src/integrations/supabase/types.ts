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
        }
        Relationships: []
      }
      BookMST: {
        Row: {
          Address: string | null
          ArtistId: number | null
          AssignedBY: string | null
          Assignedto: string | null
          AssingnedON: string | null
          Booking_date: string
          Booking_NO: string | null
          booking_time: string
          created_at: string | null
          email: string | null
          id: number
          jobno: number | null
          name: string | null
          Phone_no: number
          Pincode: number | null
          price: number | null
          Product: number | null
          ProductName: string | null
          Purpose: string
          Qty: number | null
          Scheme: string | null
          ServiceName: string | null
          Status: string | null
          StatusUpdated: string | null
          SubService: string | null
        }
        Insert: {
          Address?: string | null
          ArtistId?: number | null
          AssignedBY?: string | null
          Assignedto?: string | null
          AssingnedON?: string | null
          Booking_date: string
          Booking_NO?: string | null
          booking_time: string
          created_at?: string | null
          email?: string | null
          id?: number
          jobno?: number | null
          name?: string | null
          Phone_no: number
          Pincode?: number | null
          price?: number | null
          Product?: number | null
          ProductName?: string | null
          Purpose: string
          Qty?: number | null
          Scheme?: string | null
          ServiceName?: string | null
          Status?: string | null
          StatusUpdated?: string | null
          SubService?: string | null
        }
        Update: {
          Address?: string | null
          ArtistId?: number | null
          AssignedBY?: string | null
          Assignedto?: string | null
          AssingnedON?: string | null
          Booking_date?: string
          Booking_NO?: string | null
          booking_time?: string
          created_at?: string | null
          email?: string | null
          id?: number
          jobno?: number | null
          name?: string | null
          Phone_no?: number
          Pincode?: number | null
          price?: number | null
          Product?: number | null
          ProductName?: string | null
          Purpose?: string
          Qty?: number | null
          Scheme?: string | null
          ServiceName?: string | null
          Status?: string | null
          StatusUpdated?: string | null
          SubService?: string | null
        }
        Relationships: []
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
          password: string | null
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
          password?: string | null
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
          password?: string | null
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
