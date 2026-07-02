import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeatMap } from "@/components/seat-map";
import { ArrowLeft, Bus, Clock, Loader2, MapPin, Smartphone } from "lucide-react";
import { formatDateTime, formatKES, normalizeKenyanPhone } from "@/lib/format";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export const Route = createFileRoute("/trips/$tripId")({
  head: () => ({
    meta: [
      { title: "Choose your seats — SafariGo" },
      { name: "description", content: "Pick your seats and pay with M-Pesa." },
    ],
  }),
  component: TripPage,
});

const paymentSchema = z.object({
  phone: z.string().refine((val) => !!normalizeKenyanPhone(val), {
    message: "Enter a valid Kenyan phone number (e.g., 07xx xxx xxx)",
  }),
});

type PaymentValues = z.infer<typeof paymentSchema>;

type Trip = {
  id: string;
  departure_at: string;
  base_fare: number;
  status: string;
  route: { name: string; origin: string; destination: string; duration_min: number | null };
  vehicle: { plate_no: string; model: string; capacity: number };
};

function TripPage() {
  const { tripId } = useParams({ from: "/trips/$tripId" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { phone: "" },
  });

  const { data: trip } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select(
          "id, departure_at, base_fare, status, route:routes!inner(name,origin,destination,duration_min), vehicle:vehicles!inner(plate_no,model,capacity)",
        )
        .eq("id", tripId)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Trip | null;
    },
  });

  const { data: bookings } = useQuery({
    queryKey: ["trip-bookings", tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("seat_numbers, status, expires_at")
        .eq("trip_id", tripId);
      if (error) return [];
      return data ?? [];
    },
  });

  // Realtime subscription for seat updates
  useEffect(() => {
    const channel = supabase
      .channel(`trip-bookings-${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["trip-bookings", tripId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  const taken = useMemo(() => {
    const now = new Date();
    const set = new Set<number>();
    for (const b of bookings ?? []) {
      const active =
        b.status === "confirmed" || (b.status === "pending" && new Date(b.expires_at) > now);
      if (active) for (const s of b.seat_numbers ?? []) set.add(s);
    }
    return Array.from(set);
  }, [bookings]);

  // Prefill phone from profile
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: p } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", data.user.id)
        .maybeSingle();
      if (p?.phone) form.setValue("phone", p.phone);
    });
  }, [form]);

  const total = trip ? Number(trip.base_fare) * selected.length : 0;

  async function handleBook() {
    const { phone: phoneValue } = form.getValues();
    const isValid = await form.trigger("phone");
    if (!isValid) return;

    if (!trip) return;
    const { data: session } = await supabase.auth.getUser();
    if (!session.user) {
      toast.error("Please sign in first");
      navigate({ to: "/auth", search: { mode: "signin", redirect: `/trips/${tripId}` } });
      return;
    }
    if (selected.length === 0) return toast.error("Pick at least one seat");
    const normalized = normalizeKenyanPhone(phoneValue);
    if (!normalized) return toast.error("Enter a valid Kenyan phone number");

    setSubmitting(true);
    // 1. Create booking atomically
    const { data: booking, error } = await supabase.rpc("book_seats", {
      _trip_id: trip.id,
      _seats: selected,
      _phone: normalized,
    });
    if (error || !booking?.[0]) {
      setSubmitting(false);
      const msg = error?.message ?? "Booking failed";
      if (msg.includes("SEAT_TAKEN"))
        return toast.error("One of those seats was just taken. Please choose others.");
      if (msg.includes("TRIP_UNAVAILABLE")) return toast.error("This trip is no longer available.");
      return toast.error(msg);
    }

    const b = booking[0] as { booking_id: string; booking_code: string; total: number };

    // 2. Trigger M-Pesa STK Push via Edge Function
    try {
      const { processPayment } = await import("@/utils/integrations-api");
      const res = await processPayment({
        booking_id: b.booking_id,
        amount: Number(b.total),
        method: "mpesa",
      });

      if (res.error) throw new Error(res.error);
      toast.success("Payment initiated. Check your phone for the M-Pesa PIN prompt.");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Payment prompt failed: ${msg}`);
    }
    setSubmitting(false);
    // Go to ticket page which polls payment status
    navigate({ to: "/bookings/$code", params: { code: b.booking_code } });
  }

  if (!trip) return <div className="grid min-h-screen place-items-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2" aria-label="Go to home page">
            <div className="grid h-9 w-9 place-items-center rounded-lg gradient-hero text-primary-foreground">
              <Bus className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">SafariGo</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link
              to="/search"
              search={{
                from: trip.route.origin,
                to: trip.route.destination,
                date: trip.departure_at.slice(0, 10),
              }}
              aria-label="Back to search results"
            >
              <ArrowLeft className="h-4 w-4" /> Back to results
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {trip.route.name}
          </div>
          <h1 className="mt-1 text-3xl font-bold">
            {trip.route.origin} → {trip.route.destination}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {formatDateTime(trip.departure_at)}
            </span>
            <span>·</span>
            <span>
              {trip.vehicle.model} · <span className="text-mono">{trip.vehicle.plate_no}</span>
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="relative">
            <SeatMap
              capacity={trip.vehicle.capacity}
              taken={taken}
              selected={selected}
              onToggle={(s) =>
                setSelected((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]))
            }
            />
            <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground" aria-hidden="true">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-muted" /> Available
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-destructive" /> Taken
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-sm bg-primary" /> Selected
              </div>
            </div>
          </div>

          <Card className="h-fit p-6 shadow-card lg:sticky lg:top-6">
            <h2 className="font-semibold">Trip summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <Row label="Fare per seat" value={formatKES(trip.base_fare)} />
              <Row
                label="Selected seats"
                value={selected.length ? selected.sort((a, b) => a - b).join(", ") : "None"}
              />
              <div className="my-3 border-t border-border" />
              <Row
                label={<span className="font-semibold">Total</span>}
                value={<span className="text-lg font-bold text-primary">{formatKES(total)}</span>}
              />
            </div>

            <Form {...form}>
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="mt-5">
                    <FormLabel className="flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4" /> M-Pesa phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="07xx xxx xxx"
                        {...field}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>

            <Button
              onClick={handleBook}
              disabled={selected.length === 0 || submitting}
              className="mt-5 w-full gap-2"
              size="lg"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Pay {formatKES(total)} with M-Pesa
            </Button>

            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Seats are held for 10 minutes while you complete payment.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
