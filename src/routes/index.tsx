import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home-page";
import { site } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DM Carpintaria — Madeira à medida" },
      { name: "description", content: site.description },
      { name: "robots", content: "index, follow" },
      { name: "author", content: site.name },
    ],
  }),
  component: HomePage,
});
