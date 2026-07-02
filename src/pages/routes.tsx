import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Plus, Navigation, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";

export const RoutesPage = () => {
  const { routes, loading, addRoute, isAdding } = useRoutes();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    origin: "",
    destination: "",
    distance_km: "",
  });

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRoute({
        ...formData,
        distance_km: parseFloat(formData.distance_km),
      });
      toast.success("Route created successfully");
      setFormData({ name: "", origin: "", destination: "", distance_km: "" });
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create route. Please check the details.");
    }
  };

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Loading routes...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Route Management</h1>
          <p className="text-muted-foreground">
            Define and manage transportation paths and distance metrics.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Route Definition</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddRoute} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Route Name</Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g. Nairobi - Mombasa Express"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="origin">Origin City</Label>
                  <Input
                    id="origin"
                    required
                    placeholder="Nairobi"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination City</Label>
                  <Input
                    id="destination"
                    required
                    placeholder="Mombasa"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="distance_km">Distance (KM)</Label>
                <Input
                  id="distance_km"
                  type="number"
                  required
                  step="0.1"
                  placeholder="485.5"
                  value={formData.distance_km}
                  onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? "Saving..." : "Save Route"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Route Name</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Distance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {routes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No routes defined. Create your first route to begin scheduling trips.
                </TableCell>
              </TableRow>
            ) : (
              routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-primary" /> {route.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-muted-foreground" /> {route.origin}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />{" "}
                      {route.destination}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{route.distance_km} km</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
