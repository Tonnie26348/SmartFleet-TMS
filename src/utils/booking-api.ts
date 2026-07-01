import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/types/booking";

export const createBooking = async (booking: Omit<Booking, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('bookings').insert([booking]).select().single();
  if (error) throw error;
  return data as Booking;
};
