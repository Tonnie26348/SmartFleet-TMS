// Payment Integration Types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: 'mpesa' | 'card';
  status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
}

// GPS Tracking Types
export interface GPSLocation {
  id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}
