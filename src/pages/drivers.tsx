import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDrivers } from "@/hooks/use-drivers";
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
import { UserPlus, Phone, FileText, CalendarDays, BadgeCheck } from "lucide-react";

import { toast } from "sonner";
import { Driver } from "@/types/driver";
import { driverSchema, DriverFormValues } from "@/lib/validations";

export const DriversPage = () => {
  const { drivers, loading, addDriver, isAdding } = useDrivers();
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      license_no: "",
      license_expiry: "",
    },
  });

  const columns: Column<Driver>[] = [
    {
      header: "Driver",
      accessor: (driver) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
            {(driver.profiles?.full_name || "D")[0].toUpperCase()}
          </div>
          {driver.profiles?.full_name || "Unknown Driver"}
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (driver) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Phone className="h-3 w-3" /> {driver.profiles?.phone || "No phone"}
        </div>
      ),
    },
    {
      header: "License",
      accessor: (driver) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FileText className="h-3 w-3" /> {driver.license_no}
        </div>
      ),
    },
    {
      header: "Expiry",
      accessor: (driver) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="h-3 w-3" /> {driver.license_expiry}
        </div>
      ),
    },
    {
      header: "Status",
      align: "right",
      accessor: (driver) => (
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
            <BadgeCheck className="h-3 w-3" /> {driver.status}
          </div>
        </div>
      ),
    },
  ];

  const onSubmit = async (data: DriverFormValues) => {
    try {
      await addDriver({
        ...data,
        license_expiry: new Date(data.license_expiry).toISOString().split("T")[0],
      });
      toast.success("Driver added successfully");
      reset();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to add driver. Please check the license number.");
    }
  };

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Loading drivers...</div>;

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Driver Management"
        subtitle="Manage your fleet drivers and license compliance."
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
              <UserPlus className="h-4 w-4" /> Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" {...register("full_name")} />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="07..." {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_no">License Number</Label>
                <Input id="license_no" {...register("license_no")} />
                {errors.license_no && (
                  <p className="text-xs text-destructive">{errors.license_no.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_expiry">License Expiry</Label>
                <Input id="license_expiry" type="date" {...register("license_expiry")} />
                {errors.license_expiry && (
                  <p className="text-xs text-destructive">{errors.license_expiry.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isAdding}>
                {isAdding ? "Adding..." : "Register Driver"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="overflow-hidden">
        <DataTable
          columns={columns}
          data={drivers}
          emptyMessage="No drivers found. Add your first driver to get started."
        />
      </Card>
    </div>
  );
};
