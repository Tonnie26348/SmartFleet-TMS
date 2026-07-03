// Driver Management
export type DriverStatus = "available" | "on_trip" | "maintenance" | "grounded" | "inactive";

export interface Driver {
  id: string;
  license_no: string;
  license_expiry: string;
  status: DriverStatus;
  created_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  };
}

// Route Management
export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance_km: number;
  created_at: string;
}

// Trip Scheduling
export type TripStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "delayed";

export interface Trip {
  id: string;
  route_id: string;
  driver_id: string | null;
  vehicle_id: string;
  departure_at: string;
  status: TripStatus;
  created_at: string;
  route?: { name: string };
  vehicle?: { plate_no: string };
  driver?: { full_name: string };
}
