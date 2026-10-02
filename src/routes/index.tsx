import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home-page";
import { getContent } from "@/lib/gallery.functions";
import { seedContent } from "@/lib/use-content";
import { site } from "@/lib/site";

export const Route = createFileRoute("/")({
  loader: () => getContent(),
  head: () => ({
    meta: [
      { title: "DM Carpintaria — Distrito de Bragança" },
      { name: "description", content: site.description },
      { name: "robots", content: "index, follow" },
      { name: "author", content: site.name },
    ],
  }),
  component: Index,
});

function Index() {
  seedContent(Route.useLoaderData());
  return <HomePage />;
}
