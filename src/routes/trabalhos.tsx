import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { Portfolio } from "@/components/portfolio";
import { listGallery } from "@/lib/gallery.functions";
import { useSiteContent } from "@/lib/use-content";

export const Route = createFileRoute("/trabalhos")({
  loader: () => listGallery(),
  head: () => ({
    meta: [
      { title: "Trabalhos — DM Carpintaria" },
      { name: "description", content: "Galeria de trabalhos de carpintaria já feitos pela DM Carpintaria." },
    ],
  }),
  component: TrabalhosPage,
});

function TrabalhosPage() {
  const projects = Route.useLoaderData();
  const { copy } = useSiteContent();

  return (
    <>
      <Header />
      <main className="bg-paper">
        <section className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="kicker">Galeria</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-ink md:text-5xl">{copy.trabalhosTitle}</h1>
          <p className="mt-4 max-w-xl text-muted">{copy.trabalhosText}</p>
          <Portfolio projects={projects} />
        </section>
      </main>
    </>
  );
}
