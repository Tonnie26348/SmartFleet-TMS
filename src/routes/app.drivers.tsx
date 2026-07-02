import { createFileRoute } from "@tanstack/react-router";
import { DriversPage } from "@/pages/drivers";

export const Route = createFileRoute("/app/drivers")({
  component: DriversPage,
});
