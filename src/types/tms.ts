// Driver Management
export type DriverStatus = 'available' | 'on_trip' | 'maintenance' | 'grounded' | 'inactive';

export interface Driver {
  id: string;
  license_number: string;
  license_expiry: string;
  status: DriverStatus;
  created_at: string;
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
export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';

export interface Trip {
  id: string;
  route_id: string;
  driver_id: string;
  vehicle_id: string;
  departure_time: string;
  status: TripStatus;
  created_at: string;
}
