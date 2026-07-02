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
import { DataTable, Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/page-header";
import { Calendar, Clock, Plus, MapPin, Bus, User } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/format";
import { Trip } from "@/types/trip";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/error-boundary";

const tripSchema = z.object({
  route_id: z.string().min(1, "Please select a route"),
  vehicle_id: z.string().min(1, "Please select a vehicle"),
  driver_id: z.string().optional(),
  departure_at: z.string().min(1, "Departure time is required"),
  base_fare: z.coerce.number().min(1, "Fare must be at least 1 KES"),
});

type TripFormValues = z.infer<typeof tripSchema>;

export const TripsPage = () => {
  const { trips, loading: tripsLoading, addTrip, isAdding: tripsAdding } = useTrips();
  const { routes, loading: routesLoading } = useRoutes();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { drivers, loading: driversLoading } = useDrivers();

  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      route_id: "",
      vehicle_id: "",
      driver_id: "",
      departure_at: "",
      base_fare: 0,
    },
  });

  const columns: Column<Trip>[] = [
    {
      header: "Trip & Route",
      accessor: (trip) => (
        <div className="flex flex-col">
          <span className="font-medium flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" /> {trip.route_id}
          </span>
          <span className="text-xs text-muted-foreground">Scheduled</span>
        </div>
      ),
    },
    {
      header: "Departure",
      accessor: (trip) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="h-3 w-3" /> {formatDateTime(trip.departure_at)}
        </div>
      ),
    },
    {
      header: "Vehicle",
      accessor: (trip) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Bus className="h-3 w-3" /> {trip.vehicle_id}
        </div>
      ),
    },
    {
      header: "Driver",
      accessor: (trip) => (
        <div className="flex items-center gap-1.5 text-sm">
          <User className="h-3 w-3" /> {trip.driver_id || "Unassigned"}
        </div>
      ),
    },
    {
      header: "Fare",
      align: "right",
      accessor: (trip) => <span className="font-bold">KES {trip.base_fare}</span>,
    },
  ];

  const handleScheduleTrip = async (values: TripFormValues) => {
    try {
      await addTrip({
        ...values,
        driver_id: values.driver_id || null,
        departure_at: new Date(values.departure_at).toISOString(),
        status: "scheduled",
      });
      toast.success("Trip scheduled successfully");
      form.reset();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to schedule trip. Please check your inputs.");
    }
  };

  const isLoading = tripsLoading || routesLoading || vehiclesLoading || driversLoading;

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="Trip Scheduling" subtitle="Assign vehicles and drivers to defined routes.">
        <ErrorBoundary onReset={() => window.location.reload()}>
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleScheduleTrip)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="route_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Route</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a route..." />
                            </SelectTrigger>
                            <SelectContent>
                              {routes.map((r) => (
                                <SelectItem key={r.id} value={r.id}>
                                  {r.name} ({r.origin} → {r.destination})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicle_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign Vehicle</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a vehicle..." />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicles.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.plate_number} - {v.model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="driver_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign Driver (Optional)</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                              {drivers.map((d) => (
                                <SelectItem key={d.id} value={d.id}>
                                  {d.profiles?.full_name || "Unknown Driver"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departure_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departure Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="base_fare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Fare (KES)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={tripsAdding}>
                    {tripsAdding ? "Scheduling..." : "Confirm Trip"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </ErrorBoundary>
      </PageHeader>
      <Card className="overflow-hidden">
        <ErrorBoundary onReset={() => window.location.reload()}>
          {isLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={trips}
              emptyMessage="No trips scheduled. Start by adding your first trip."
            />
          )}
        </ErrorBoundary>
      </Card>
    </div>
  );
};
