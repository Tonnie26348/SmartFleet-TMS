import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Plus, Truck, Info } from "lucide-react";
import { toast } from "sonner";
import { Vehicle } from "@/types/vehicle";
import { vehicleSchema, VehicleFormValues } from "@/lib/validations";

export const VehicleManagementPage = () => {
  const { vehicles, loading, addVehicle, isAdding } = useVehicles();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate_no: "",
      model: "",
      capacity: "",
      status: "available",
    },
  });

  const columns: Column<Vehicle>[] = [
    {
      header: "Vehicle",
      accessor: (v) => (
        <div className="flex items-center gap-2 font-bold">
          <Truck className="h-4 w-4 text-muted-foreground" /> {v.plate_number}
        </div>
      ),
    },
    {
      header: "Model",
      accessor: (v) => v.model,
    },
    {
      header: "Capacity",
      accessor: (v) => (
        <div className="flex items-center gap-1">
          <Info className="h-3 w-3 text-muted-foreground" /> {v.capacity} seats
        </div>
      ),
    },
    {
      header: "Status",
      align: "right",
      accessor: (v) => (
        <div className="flex justify-end">
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              v.status === "available"
                ? "bg-green-100 text-green-700"
                : v.status === "on_trip"
                  ? "bg-blue-100 text-blue-700"
                  : v.status === "maintenance"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
            }`}
          >
            {v.status}
          </span>
        </div>
      ),
    },
  ];

  const onSubmit = async (data: VehicleFormValues) => {
    try {
      await addVehicle({
        plate_no: data.plate_no,
        model: data.model,
        capacity: Number(data.capacity),
        status: data.status as any,
      });
      toast.success("Vehicle added successfully");
      reset();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Vehicle addition error:", error);
      toast.error(`Failed to add vehicle: ${error.message || "Unknown error"}`);
    }
  };

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Loading vehicles...</div>;

  return (
    <div className="p-8 space-y-6">
      <PageHeader title="Vehicle Management" subtitle="Manage your transport fleet and capacity.">
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) reset();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="plate_no">Plate Number</Label>
                <Input id="plate_no" placeholder="KXX 000X" {...register("plate_no")} />
                {errors.plate_no && (
                  <p className="text-xs text-destructive">{errors.plate_no.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model/Type</Label>
                <Input id="model" placeholder="e.g. Isuzu NQR / 33 Seater" {...register("model")} />
                {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Passenger Capacity</Label>
                <Input id="capacity" type="number" {...register("capacity")} />
                {errors.capacity && (
                  <p className="text-xs text-destructive">{errors.capacity.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("status")}
                >
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="grounded">Grounded</option>
                </select>
                {errors.status && (
                  <p className="text-xs text-destructive">{errors.status.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? "Adding..." : "Save Vehicle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={vehicles}
          emptyMessage="No vehicles found. Add your first vehicle to start scheduling trips."
        />
      </Card>
    </div>
  );
};
