import { createFileRoute } from "@tanstack/react-router";
import { LandingPage, routesQO } from "@/pages/landing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafariGo — Book bus & matatu tickets, manage your fleet" },
      {
        name: "description",
        content:
          "Kenya's transport OS: passenger bookings with M-Pesa, live GPS tracking, driver management, and revenue analytics.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(routesQO),
  component: LandingPage,
});
