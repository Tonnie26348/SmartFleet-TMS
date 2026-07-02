import { useDrivers } from "@/hooks/use-drivers";
import { useRoutes } from "@/hooks/use-routes";
import { useTrips } from "@/hooks/use-trips";
import { useVehicles } from "@/hooks/use-vehicles";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Bus,
  Users,
  MapPin,
  CalendarDays,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export const TMSDashboard = () => {
  const { drivers } = useDrivers();
  const { routes } = useRoutes();
  const { trips } = useTrips();
  const { vehicles } = useVehicles();

  const stats = [
    {
      label: "Total Fleet",
      value: vehicles.length,
      icon: Bus,
      color: "text-blue-600",
      bg: "bg-blue-50",
      link: "/app/vehicles",
    },
    {
      label: "Active Drivers",
      value: drivers.length,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
      link: "/app/drivers",
    },
    {
      label: "Defined Routes",
      value: routes.length,
      icon: MapPin,
      color: "text-purple-600",
      bg: "bg-purple-50",
      link: "/app/routes",
    },
    {
      label: "Upcoming Trips",
      value: trips.length,
      icon: CalendarDays,
      color: "text-orange-600",
      bg: "bg-orange-50",
      link: "/app/trips",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operational Overview</h1>
        <p className="text-muted-foreground">
          Welcome back. Here is the current state of your fleet.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 transition hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                <Link to={stat.link}>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Fleet Health</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
              <span className="text-sm">Vehicle Availability</span>
              <span className="text-sm font-bold text-green-600">
                {vehicles.length > 0
                  ? `${Math.round((vehicles.filter((v) => v.status === "available").length / vehicles.length) * 100)}%`
                  : "0%"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
              <span className="text-sm">Driver Utilization</span>
              <span className="text-sm font-bold text-blue-600">
                {drivers.length > 0
                  ? `${Math.round((trips.length / drivers.length) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">Action Required</h2>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            {trips.length === 0 ? (
              <p>No trips scheduled for the next 30 days. Start scheduling to generate revenue.</p>
            ) : (
              <p>You have {trips.length} trips scheduled. Ensure all vehicles are serviced.</p>
            )}
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link to="/app/trips">
                Manage Schedule <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
