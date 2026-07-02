import { useState } from "react";
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
import { Car, Plus, Truck, Info } from "lucide-react";
import { toast } from "sonner";

export const VehicleManagementPage = () => {
  const { vehicles, loading, addVehicle, isAdding } = useVehicles();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    plate_number: "",
    model: "",
    capacity: "",
    status: "available",
  });

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVehicle({
        plate_number: formData.plate_number,
        model: formData.model,
        capacity: parseInt(formData.capacity),
        status: formData.status as any,
      });
      toast.success("Vehicle added successfully");
      setFormData({ plate_number: "", model: "", capacity: "", status: "available" });
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to add vehicle. Check if plate number is unique.");
    }
  };

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Loading vehicles...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicle Management</h1>
          <p className="text-muted-foreground">Manage your transport fleet and capacity.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Vehicle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddVehicle} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="plate_number">Plate Number</Label>
                <Input
                  id="plate_number"
                  required
                  placeholder="KXX 000X"
                  value={formData.plate_number}
                  onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model/Type</Label>
                <Input
                  id="model"
                  required
                  placeholder="e.g. Isuzu NQR / 33 Seater"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Passenger Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <select
                  id="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="grounded">Grounded</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? "Adding..." : "Save Vehicle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No vehicles found. Add your first vehicle to start scheduling trips.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" /> {v.plate_number}
                    </div>
                  </TableCell>
                  <TableCell>{v.model}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Info className="h-3 w-3 text-muted-foreground" /> {v.capacity} seats
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
