import { createFileRoute } from "@tanstack/react-router";
import { TMSDashboard } from "@/pages/dashboard";

export const Route = createFileRoute("/app/")({
  component: TMSDashboard,
});
