import { useState } from "react";
import { useDrivers } from "@/hooks/use-drivers";
import { useRoutes } from "@/hooks/use-routes";
import { useTrips } from "@/hooks/use-trips";
import { useVehicles } from "@/hooks/use-vehicles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, Plus, MapPin, Bus, User } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/format";

export const TripsPage = () => {
  const { trips, loading: tripsLoading, addTrip, isAdding: tripsAdding } = useTrips();
  const { routes, loading: routesLoading } = useRoutes();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { drivers, loading: driversLoading } = useDrivers();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    route_id: "",
    vehicle_id: "",
    driver_id: "",
    departure_at: "",
    base_fare: "",
  });

  const handleScheduleTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTrip({
        route_id: formData.route_id,
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id || null,
        departure_at: new Date(formData.departure_at).toISOString(),
        base_fare: parseFloat(formData.base_fare),
        status: "scheduled",
      });
      toast.success("Trip scheduled successfully");
      setFormData({ route_id: "", vehicle_id: "", driver_id: "", departure_at: "", base_fare: "" });
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to schedule trip. Please check your inputs.");
    }
  };

  const loading = tripsLoading || routesLoading || vehiclesLoading || driversLoading;

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Loading operational data...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trip Scheduling</h1>
          <p className="text-muted-foreground">Assign vehicles and drivers to defined routes.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Schedule Trip
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Trip Schedule</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleScheduleTrip} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="route_id">Select Route</Label>
                <select
                  id="route_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                  value={formData.route_id}
                  onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
                >
                  <option value="">Choose a route...</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.origin} → {r.destination})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_id">Assign Vehicle</Label>
                <select
                  id="vehicle_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                  value={formData.vehicle_id}
                  onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                >
                  <option value="">Choose a vehicle...</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate_number} - {v.model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver_id">Assign Driver (Optional)</Label>
                <select
                  id="driver_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.driver_id}
                  onChange={(e) => setFormData({ ...formData, driver_id: e.target.value })}
                >
                  <option value="">Unassigned</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departure_at">Departure Time</Label>
                  <Input
                    id="departure_at"
                    type="datetime-local"
                    required
                    value={formData.departure_at}
                    onChange={(e) => setFormData({ ...formData, departure_at: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="base_fare">Base Fare (KES)</Label>
                  <Input
                    id="base_fare"
                    type="number"
                    required
                    value={formData.base_fare}
                    onChange={(e) => setFormData({ ...formData, base_fare: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={tripsAdding}>
                {tripsAdding ? "Scheduling..." : "Confirm Trip"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trip & Route</TableHead>
              <TableHead>Departure</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead className="text-right">Fare</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No trips scheduled. Start by adding your first trip.
                </TableCell>
              </TableRow>
            ) : (
              trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-primary" /> {trip.route_id}
                      </span>
                      <span className="text-xs text-muted-foreground">Scheduled</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="h-3 w-3" /> {formatDateTime(trip.departure_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Bus className="h-3 w-3" /> {trip.vehicle_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <User className="h-3 w-3" /> {trip.driver_id || "Unassigned"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold">KES {trip.base_fare}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
