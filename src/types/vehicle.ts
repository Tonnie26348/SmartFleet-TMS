export type VehicleStatus = "available" | "on_trip" | "maintenance" | "grounded";

export interface Vehicle {
  id: string;
  plate_number: string;
  model: string;
  capacity: number;
  status: VehicleStatus;
  created_at: string;
}
