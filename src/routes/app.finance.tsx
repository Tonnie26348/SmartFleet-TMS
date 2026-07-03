import { createFileRoute } from "@tanstack/react-router";
import FinancePage from "@/pages/finance";

export const Route = createFileRoute("/app/finance")({
  component: FinancePage,
});
