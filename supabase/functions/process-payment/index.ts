import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { booking_id, amount, method } = await req.json();

  // Initialize Supabase Admin Client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Log payment in database
  const { data, error } = await supabase
    .from("payments")
    .insert([{ booking_id, amount, method, status: "pending" }])
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Payment initiated", payment: data }), {
    headers: { "Content-Type": "application/json" },
  });
});
