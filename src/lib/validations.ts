import * as z from "zod";

// Helper for Kenyan Phone Number validation
const kenyanPhoneSchema = z.string().regex(/^(\+254|0)?(7|1)\d{8}$/, {
  message: "Invalid Kenyan phone number. Please use format 07XXXXXXXX or +254...",
});

export const driverSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  phone: kenyanPhoneSchema,
  license_no: z.string().min(3, "License number is required"),
  license_expiry: z.string().min(1, "Expiry date is required"),
});

export const vehicleSchema = z.object({
  plate_no: z.string().min(3, "Invalid plate number"),
  model: z.string().min(2, "Model is required"),
  capacity: z.coerce
    .number()
    .min(1, "Capacity must be at least 1")
    .max(100, "Capacity cannot exceed 100"),
  status: z.enum(["available", "on_trip", "maintenance", "grounded"]),
});

export const routeSchema = z.object({
  name: z.string().min(3, "Route name is required"),
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  distance_km: z.coerce.number().positive("Distance must be a positive number"),
});

export const tripSchema = z.object({
  route_id: z.string().min(1, "Please select a route"),
  vehicle_id: z.string().min(1, "Please assign a vehicle"),
  driver_id: z.string().optional(),
  departure_at: z.string().min(1, "Departure time is required"),
  base_fare: z.coerce.number().min(100, "Fare must be at least 100 KES"),
});

export type DriverFormValues = z.infer<typeof driverSchema>;
export type VehicleFormValues = z.infer<typeof vehicleSchema>;
export type RouteFormValues = z.infer<typeof routeSchema>;
export type TripFormValues = z.infer<typeof tripSchema>;
