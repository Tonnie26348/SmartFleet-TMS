export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity: string;
          entity_id: string | null;
          id: number;
          meta: Json | null;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity: string;
          entity_id?: string | null;
          id?: number;
          meta?: Json | null;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity?: string;
          entity_id?: string | null;
          id?: number;
          meta?: Json | null;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          booking_code: string;
          created_at: string;
          expires_at: string;
          id: string;
          passenger_id: string;
          passenger_phone: string;
          seat_numbers: number[];
          status: Database["public"]["Enums"]["booking_status"];
          total_amount: number;
          trip_id: string;
          updated_at: string;
        };
        Insert: {
          booking_code: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          passenger_id: string;
          passenger_phone: string;
          seat_numbers: number[];
          status?: Database["public"]["Enums"]["booking_status"];
          total_amount: number;
          trip_id: string;
          updated_at?: string;
        };
        Update: {
          booking_code?: string;
          created_at?: string;
          expires_at?: string;
          id?: string;
          passenger_id?: string;
          passenger_phone?: string;
          seat_numbers?: number[];
          status?: Database["public"]["Enums"]["booking_status"];
          total_amount?: number;
          trip_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      drivers: {
        Row: {
          created_at: string;
          full_name: string;
          id: string;
          license_expiry: string;
          license_no: string;
          phone: string;
          rating: number | null;
          status: Database["public"]["Enums"]["driver_status"];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          full_name: string;
          id?: string;
          license_expiry: string;
          license_no: string;
          phone: string;
          rating?: number | null;
          status?: Database["public"]["Enums"]["driver_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          full_name?: string;
          id?: string;
          license_expiry?: string;
          license_no?: string;
          phone?: string;
          rating?: number | null;
          status?: Database["public"]["Enums"]["driver_status"];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      gps_pings: {
        Row: {
          driver_id: string | null;
          heading: number | null;
          id: number;
          lat: number;
          lng: number;
          recorded_at: string;
          speed: number | null;
          trip_id: string;
        };
        Insert: {
          driver_id?: string | null;
          heading?: number | null;
          id?: number;
          lat: number;
          lng: number;
          recorded_at?: string;
          speed?: number | null;
          trip_id: string;
        };
        Update: {
          driver_id?: string | null;
          heading?: number | null;
          id?: number;
          lat?: number;
          lng?: number;
          recorded_at?: string;
          speed?: number | null;
          trip_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gps_pings_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gps_pings_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          booking_id: string;
          created_at: string;
          id: string;
          mpesa_checkout_id: string | null;
          mpesa_receipt: string | null;
          phone: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          raw_response: Json | null;
          status: Database["public"]["Enums"]["payment_status"];
          updated_at: string;
        };
        Insert: {
          amount: number;
          booking_id: string;
          created_at?: string;
          id?: string;
          mpesa_checkout_id?: string | null;
          mpesa_receipt?: string | null;
          phone?: string | null;
          provider: Database["public"]["Enums"]["payment_provider"];
          raw_response?: Json | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Update: {
          amount?: number;
          booking_id?: string;
          created_at?: string;
          id?: string;
          mpesa_checkout_id?: string | null;
          mpesa_receipt?: string | null;
          phone?: string | null;
          provider?: Database["public"]["Enums"]["payment_provider"];
          raw_response?: Json | null;
          status?: Database["public"]["Enums"]["payment_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      route_stops: {
        Row: {
          id: string;
          lat: number | null;
          lng: number | null;
          name: string;
          route_id: string;
          sequence: number;
        };
        Insert: {
          id?: string;
          lat?: number | null;
          lng?: number | null;
          name: string;
          route_id: string;
          sequence: number;
        };
        Update: {
          id?: string;
          lat?: number | null;
          lng?: number | null;
          name?: string;
          route_id?: string;
          sequence?: number;
        };
        Relationships: [
          {
            foreignKeyName: "route_stops_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
        ];
      };
      routes: {
        Row: {
          active: boolean;
          created_at: string;
          destination: string;
          distance_km: number | null;
          duration_min: number | null;
          id: string;
          name: string;
          origin: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          destination: string;
          distance_km?: number | null;
          duration_min?: number | null;
          id?: string;
          name: string;
          origin: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          destination?: string;
          distance_km?: number | null;
          duration_min?: number | null;
          id?: string;
          name?: string;
          origin?: string;
        };
        Relationships: [];
      };
      tickets: {
        Row: {
          booking_id: string;
          checked_in_at: string | null;
          created_at: string;
          id: string;
          qr_payload: string;
        };
        Insert: {
          booking_id: string;
          checked_in_at?: string | null;
          created_at?: string;
          id?: string;
          qr_payload: string;
        };
        Update: {
          booking_id?: string;
          checked_in_at?: string | null;
          created_at?: string;
          id?: string;
          qr_payload?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tickets_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      trips: {
        Row: {
          arrival_at: string | null;
          base_fare: number;
          created_at: string;
          departure_at: string;
          driver_id: string | null;
          id: string;
          route_id: string;
          status: Database["public"]["Enums"]["trip_status"];
          updated_at: string;
          vehicle_id: string;
        };
        Insert: {
          arrival_at?: string | null;
          base_fare: number;
          created_at?: string;
          departure_at: string;
          driver_id?: string | null;
          id?: string;
          route_id: string;
          status?: Database["public"]["Enums"]["trip_status"];
          updated_at?: string;
          vehicle_id: string;
        };
        Update: {
          arrival_at?: string | null;
          base_fare?: number;
          created_at?: string;
          departure_at?: string;
          driver_id?: string | null;
          id?: string;
          route_id?: string;
          status?: Database["public"]["Enums"]["trip_status"];
          updated_at?: string;
          vehicle_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trips_driver_id_fkey";
            columns: ["driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trips_route_id_fkey";
            columns: ["route_id"];
            isOneToOne: false;
            referencedRelation: "routes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trips_vehicle_id_fkey";
            columns: ["vehicle_id"];
            isOneToOne: false;
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          capacity: number;
          created_at: string;
          current_driver_id: string | null;
          id: string;
          inspection_expiry: string | null;
          insurance_expiry: string | null;
          model: string;
          plate_no: string;
          status: Database["public"]["Enums"]["vehicle_status"];
          updated_at: string;
        };
        Insert: {
          capacity: number;
          created_at?: string;
          current_driver_id?: string | null;
          id?: string;
          inspection_expiry?: string | null;
          insurance_expiry?: string | null;
          model: string;
          plate_no: string;
          status?: Database["public"]["Enums"]["vehicle_status"];
          updated_at?: string;
        };
        Update: {
          capacity?: number;
          created_at?: string;
          current_driver_id?: string | null;
          id?: string;
          inspection_expiry?: string | null;
          insurance_expiry?: string | null;
          model?: string;
          plate_no?: string;
          status?: Database["public"]["Enums"]["vehicle_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vehicles_current_driver_id_fkey";
            columns: ["current_driver_id"];
            isOneToOne: false;
            referencedRelation: "drivers";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      book_seats: {
        Args: { _phone: string; _seats: number[]; _trip_id: string };
        Returns: {
          booking_code: string;
          booking_id: string;
          total: number;
        }[];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "super_admin" | "ops_manager" | "accountant" | "driver" | "passenger";
      booking_status: "pending" | "confirmed" | "cancelled" | "expired";
      driver_status: "active" | "off_duty" | "suspended";
      payment_provider: "mpesa" | "card" | "cash";
      payment_status: "pending" | "processing" | "success" | "failed" | "cancelled";
      trip_status: "scheduled" | "boarding" | "in_transit" | "completed" | "cancelled";
      vehicle_status: "available" | "on_trip" | "maintenance" | "grounded";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "ops_manager", "accountant", "driver", "passenger"],
      booking_status: ["pending", "confirmed", "cancelled", "expired"],
      driver_status: ["active", "off_duty", "suspended"],
      payment_provider: ["mpesa", "card", "cash"],
      payment_status: ["pending", "processing", "success", "failed", "cancelled"],
      trip_status: ["scheduled", "boarding", "in_transit", "completed", "cancelled"],
      vehicle_status: ["available", "on_trip", "maintenance", "grounded"],
    },
  },
} as const;
