import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SearchPage } from "@/pages/search";

const searchSchema = z.object({
  from: z.string().optional().catch(""),
  to: z.string().optional().catch(""),
  date: z.string().optional().catch(""),
});

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Find your trip — SafariGo" },
      { name: "description", content: "Search available bus and matatu trips across Kenya." },
    ],
  }),
  validateSearch: searchSchema,
  component: SearchPage,
});
