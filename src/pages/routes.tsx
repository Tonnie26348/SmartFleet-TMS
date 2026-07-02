import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRoutes } from "@/hooks/use-routes";
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
import { MapPin, Plus, Navigation, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import { Route } from "@/types/route";
import { routeSchema, RouteFormValues } from "@/lib/validations";

export const RoutesPage = () => {
  const { routes, loading, addRoute, isAdding } = useRoutes();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      name: "",
      origin: "",
      destination: "",
      distance_km: "",
    },
  });

  const columns: Column<Route>[] = [
    {
      header: "Route Name",
      accessor: (route) => (
        <div className="flex items-center gap-2 font-medium">
          <Navigation className="h-4 w-4 text-primary" /> {route.name}
        </div>
      ),
    },
    {
      header: "Origin",
      accessor: (route) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-muted-foreground" /> {route.origin}
        </div>
      ),
    },
    {
      header: "Destination",
      accessor: (route) => (
        <div className="flex items-center gap-1.5">
          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" /> {route.destination}
        </div>
      ),
    },
    {
      header: "Distance",
      accessor: (route) => `${route.distance_km} km`,
      className: "text-muted-foreground",
    },
  ];

  const onSubmit = async (data: RouteFormValues) => {
    try {
      await addRoute(data);
      toast.success("Route created successfully");
      reset();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create route. Please check the details.");
    }
  };

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Loading routes...</div>;

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Route Management"
        subtitle="Define and manage transportation paths and distance metrics."
      >
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) reset();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Route Definition</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Nairobi - Mombasa Express"
                  {...register("name")}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin City</Label>
                  <Input id="origin" placeholder="Nairobi" {...register("origin")} />
                  {errors.origin && (
                    <p className="text-xs text-destructive">{errors.origin.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination City</Label>
                  <Input id="destination" placeholder="Mombasa" {...register("destination")} />
                  {errors.destination && (
                    <p className="text-xs text-destructive">{errors.destination.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance_km">Distance (KM)</Label>
                <Input
                  id="distance_km"
                  type="number"
                  step="0.1"
                  placeholder="485.5"
                  {...register("distance_km")}
                />
                {errors.distance_km && (
                  <p className="text-xs text-destructive">{errors.distance_km.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? "Saving..." : "Save Route"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={routes}
          emptyMessage="No routes defined. Create your first route to begin scheduling trips."
        />
      </Card>
    </div>
  );
};
