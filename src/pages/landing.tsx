import { Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ArrowRight, Bus, CreditCard, MapPin, Shield, Ticket, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion, AnimatePresence } from "framer-motion";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2 transition-all hover:opacity-90">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-hero text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
              <Bus className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">SafariGo</span>
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <Button asChild size="sm" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                <Link to="/app">
                  Open dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full hover:bg-primary/10">
                  <Link to="/auth">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Get started
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-20">
        {/* Immersive Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            src="/bg-landing.jpg" 
            alt="Modern Luxury Bus" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-32">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-3xl text-primary-foreground"
          >
            <motion.div 
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-md"
            >
              <Zap className="h-3.5 w-3.5 text-accent" />
              Built for Kenya · Powered by M-Pesa
            </motion.div>
            <motion.h1 
              variants={itemVariants}
              className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
            >
              The operating system for <br />
              <span className="bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">Kenyan transport.</span>
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="mt-8 text-lg text-primary-foreground/80 sm:text-xl lg:text-2xl leading-relaxed max-w-2xl"
            >
              Book seats, pay via M-Pesa, track buses live. Digitize your bus, matatu, or sacco
              business with world-class infrastructure.
            </motion.p>
          </motion.div>

          {/* Search Glass Card */}
          <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 max-w-5xl"
          >
            <Card className="border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-3xl sm:p-2 ring-1 ring-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigate({ to: "/search", search: { from: origin, to: destination, date } });
                }}
                className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto] p-4 sm:p-6"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">
                    From
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
                  >
                    <option value="" className="bg-background text-foreground">Any origin</option>
                    {origins.map((o) => (
                      <option key={o} value={o} className="bg-background text-foreground">
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">To</label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
                  >
                    <option value="" className="bg-background text-foreground">Any origin</option>
                    {destinations.map((d) => (
                      <option key={d} value={d} className="bg-background text-foreground">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 ml-1">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 rounded-xl border-white/10 bg-white/10 text-white focus:ring-accent/50"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" size="lg" className="h-12 w-full sm:w-auto rounded-xl gap-2 bg-accent text-accent-foreground hover:bg-accent/90 transition-all active:scale-95 shadow-lg shadow-accent/20 px-8">
                    Search <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Bento Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold sm:text-5xl tracking-tight">
            Everything an operator needs, <span className="text-primary">nothing they don't.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A unified ecosystem for bookings, fleet, drivers, and instant payments.
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2">
          {/* Large Primary Feature */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="col-span-full lg:col-span-2 lg:row-span-2 rounded-[2.5rem] border border-border bg-card p-8 sm:p-12 shadow-card relative overflow-hidden group transition-all duration-500"
          >
            <div className="absolute -right-10 -top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                  <Ticket className="h-8 w-8" />
                </div>
                <h3 className="text-3xl font-bold mb-4 tracking-tight">Passenger Booking Portal</h3>
                <p className="text-muted-foreground text-lg lg:text-xl leading-relaxed max-w-md">
                  Interactive seat maps, real-time availability, QR-code tickets, and instant confirmations. 
                  Seamlessly move your passengers from search to seat.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-4">
                <div className="h-2 w-32 rounded-full bg-primary/10 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="h-full bg-primary" 
                  />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Live Availability</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="col-span-full sm:col-span-1 rounded-[2rem] border border-border bg-card p-8 shadow-card relative overflow-hidden group transition-all duration-500"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent group-hover:scale-110 transition-transform duration-500">
              <Shield className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">Fleet Security</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track every vehicle, monitor driver performance, and manage maintenance schedules with precision.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="col-span-full sm:col-span-1 rounded-[2rem] border border-border bg-card p-8 shadow-card relative overflow-hidden group transition-all duration-500"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success group-hover:scale-110 transition-transform duration-500">
              <CreditCard className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight">M-Pesa Settlement</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Integrated payments with automatic revenue splitting and digital accounting for complete peace of mind.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="col-span-full sm:col-span-2 rounded-[2rem] border border-border bg-secondary/30 p-8 shadow-card relative overflow-hidden group transition-all duration-500"
          >
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                <Bus className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Scale your Sacco business</h3>
                <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                  From a single bus to a nationwide fleet, our infrastructure grows with you. 
                  Digitize your entire operation in minutes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
