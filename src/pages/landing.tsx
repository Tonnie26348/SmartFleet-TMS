import { Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ArrowRight, Bus, CreditCard, MapPin, Shield, Ticket, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const routesQO = queryOptions({
  queryKey: ["routes", "all"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("routes")
      .select("id, name, origin, destination")
      .order("name");
    if (error) throw error;
    return data ?? [];
  },
});

export function LandingPage() {
  const { data: routes } = useSuspenseQuery(routesQO);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const origins = Array.from(new Set(routes.map((r) => r.origin)));
  const destinations = Array.from(new Set(routes.map((r) => r.destination)));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg gradient-hero text-primary-foreground">
              <Bus className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">SafariGo</span>
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm">
                <Link to="/app">
                  Open dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Get started
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.97]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,_oklch(1_0_0_/_0.15),_transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="max-w-2xl text-primary-foreground">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Built for Kenya · Powered by M-Pesa
            </div>
            <h1 className="text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              The operating system for <span className="text-accent">Kenyan transport.</span>
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/85 sm:text-xl">
              Book seats, pay via M-Pesa, track buses live. Digitize your bus, matatu, or sacco
              business from scheduling to settlement.
            </p>
          </div>

          {/* Search card */}
          <Card className="mt-10 max-w-3xl border-white/10 bg-background/95 p-4 shadow-elegant sm:p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/search", search: { from: origin, to: destination, date } });
              }}
              className="grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
            >
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  From
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Any origin</option>
                  {origins.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">To</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Any destination</option>
                  {destinations.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11"
                />
              </div>
              <Button type="submit" size="lg" className="h-11 gap-2">
                Search <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything an operator needs, nothing they don't.
          </h2>
          <p className="mt-3 text-muted-foreground">
            One platform for bookings, fleet, drivers, payments, and live tracking.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Ticket,
              title: "Passenger booking portal",
              body: "Interactive seat maps, real-time availability, QR-code tickets, and instant confirmations.",
            },
            {
              icon: Shield,
              title: "Secure fleet management",
              body: "Track every vehicle, monitor driver performance, and manage maintenance schedules.",
            },
            {
              icon: CreditCard,
              title: "Instant payment settlement",
              body: "Integrated M-Pesa payments with automatic revenue splitting and digital accounting.",
            },
          ].map((feature, i) => (
            <Card key={i} className="p-6 transition hover:shadow-elegant">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.body}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
