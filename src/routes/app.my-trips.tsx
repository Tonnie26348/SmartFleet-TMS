import { createFileRoute } from "@tanstack/react-router";
import MyTripsPage from "@/pages/my-trips";

export const Route = createFileRoute("/app/my-trips")({
  component: MyTripsPage,
});
