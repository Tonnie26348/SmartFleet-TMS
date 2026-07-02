import { createFileRoute } from "@tanstack/react-router";
import { VehicleManagementPage } from "@/pages/vehicles";

export const Route = createFileRoute("/app/vehicles")({
  component: VehicleManagementPage,
});
