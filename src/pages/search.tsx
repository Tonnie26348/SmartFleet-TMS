import { Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bus, Clock, MapPin } from "lucide-react";
import { formatDateTime, formatKES } from "@/lib/format";

type TripRow = {
  id: string;
  departure_at: string;
  base_fare: number;
  status: string;
  route: { name: string; origin: string; destination: string; duration_min: number | null } | null;
  vehicle: { plate_no: string; model: string; capacity: number } | null;
};

export function SearchPage() {
  const { from, to, date } = useSearch({ from: "/search" });

  const { data, isLoading } = useQuery({
    queryKey: ["trips", "search", from, to, date],
    queryFn: async () => {
      const dayStart = date ? new Date(date) : new Date();
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 30); // show next 30 days
      let q = supabase
        .from("trips")
        .select(
          "id, departure_at, base_fare, status, route:routes!inner(name,origin,destination,duration_min), vehicle:vehicles!inner(plate_no,model,capacity)",
        )
        .eq("status", "scheduled")
        .gte("departure_at", dayStart.toISOString())
        .lte("departure_at", dayEnd.toISOString())
        .order("departure_at");
      if (from) q = q.eq("route.origin", from);
      if (to) q = q.eq("route.destination", to);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as TripRow[];
    },
  });

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg gradient-hero text-primary-foreground">
              <Bus className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">SafariGo</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">New search</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">
            {from || "Anywhere"} <ArrowRight className="inline h-6 w-6 text-muted-foreground" />{" "}
            {to || "Anywhere"}
          </h1>
          <p className="text-sm text-muted-foreground">Available departures</p>
        </div>

        {isLoading && <div className="py-12 text-center text-muted-foreground">Loading trips…</div>}

        {!isLoading && (data?.length ?? 0) === 0 && (
          <Card className="p-12 text-center">
            <p className="text-lg font-medium">No trips found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different route or date.</p>
            <Button asChild className="mt-4">
              <Link to="/">Back to search</Link>
            </Button>
          </Card>
        )}

        <div className="space-y-3">
          {data?.map((t) => (
            <Card key={t.id} className="p-5 transition hover:shadow-elegant">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {t.route?.name}
                  </div>
                  <div className="mt-1.5 flex items-baseline gap-3">
                    <span className="text-2xl font-bold">{t.route?.origin}</span>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">{t.route?.destination}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {formatDateTime(t.departure_at)}
                    </span>
                    <span>·</span>
                    <span>
                      {t.vehicle?.model} · {t.vehicle?.capacity} seats
                    </span>
                    <span>·</span>
                    <span className="text-mono">{t.vehicle?.plate_no}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div>
                    <div className="text-2xl font-bold text-primary">{formatKES(t.base_fare)}</div>
                    <div className="text-xs text-muted-foreground">per seat</div>
                  </div>
                  <Button asChild>
                    <Link to="/trips/$tripId" params={{ tripId: t.id }}>
                      Select seats <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
