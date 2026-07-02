import { createFileRoute } from "@tanstack/react-router";
import { TripsPage } from "@/pages/trips";

export const Route = createFileRoute("/app/trips")({
  component: TripsPage,
});
