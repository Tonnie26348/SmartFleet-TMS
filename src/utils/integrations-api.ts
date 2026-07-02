import { supabase } from "@/integrations/supabase/client";

// Payment Utility
export const processPayment = async (paymentDetails: {
  booking_id: string;
  amount: number;
  method: "mpesa" | "card";
}) => {
  // Now calls the Supabase Edge Function
  const { data, error } = await supabase.functions.invoke("process-payment", {
    body: paymentDetails,
  });
  if (error) throw error;
  return data;
};

// GPS Tracking Utility (Simulating WebSocket subscription)
export const subscribeToTripLocation = (tripId: string, callback: (location: any) => void) => {
  return supabase
    .channel(`trip:${tripId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "gps_locations", filter: `trip_id=eq.${tripId}` },
      (payload) => {
        callback(payload.new);
      },
    )
    .subscribe();
};
