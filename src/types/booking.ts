export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  seat_number: string;
  status: 'booked' | 'paid' | 'cancelled' | 'refunded';
  created_at: string;
}
