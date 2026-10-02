import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryProject } from "@/lib/gallery";

function groupProjects(projects: GalleryProject[]) {
  const order: string[] = [];
  const groups = new Map<string, { key: string; label: string; items: { project: GalleryProject; index: number }[] }>();
  projects.forEach((project, index) => {
    const label = project.tag.trim() || "Outros";
    const key = label
      .toLocaleLowerCase("pt")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const id = key || "outros";
    const current = groups.get(id);
    if (current) {
      current.items.push({ project, index });
      return;
    }
    groups.set(id, { key: id, label, items: [{ project, index }] });
    order.push(id);
  });
  return order.map((id) => groups.get(id)!);
}

export function Portfolio({ projects }: { projects: GalleryProject[] }) {
  const [open, setOpen] = useState<{ work: number; photo: number } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const work = open ? projects[open.work] : null;
  const photo = work && open ? work.photos[open.photo] : null;

  function step(direction: number) {
    setOpen((current) => {
      if (!current) return current;
      const photos = projects[current.work]?.photos ?? [];
      if (photos.length === 0) return current;
      const photoIndex = (current.photo + direction + photos.length) % photos.length;
      return { ...current, photo: photoIndex };
    });
  }

  const groups = groupProjects(projects);

  if (projects.length === 0) {
    return (
      <p className="mt-10 text-muted">Ainda não há trabalhos publicados.</p>
    );
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2">
        {groups.map((group) => (
          <a key={group.key} href={`#categoria-${group.key}`} className="tap rounded-full border border-line bg-foam px-3 py-2 text-sm">
            {group.label}
            <span className="ml-2 text-muted">{group.items.length}</span>
          </a>
        ))}
      </div>
      <div className="mt-12 flex flex-col gap-16">
        {groups.map((group) => (
          <section key={group.key} id={`categoria-${group.key}`} className="scroll-mt-24">
            <h2 className="font-display text-3xl md:text-4xl">{group.label}</h2>
            <div className="mt-8 flex flex-col gap-14">
              {group.items.map(({ project: item, index: workIndex }) => {
                const [cover, ...rest] = item.photos;
                return (
                  <article key={item.id} id={`trabalho-${item.id}`} className="scroll-mt-24">
                    {cover ? (
                      <button
                        type="button"
                        onClick={() => setOpen({ work: workIndex, photo: 0 })}
                        className="group block w-full overflow-hidden rounded-card bg-ink text-left"
                      >
                        <img
                          src={cover.src}
                          alt={cover.alt}
                          className="aspect-[16/9] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </button>
                    ) : (
                      <p className="text-muted">Este trabalho ainda não tem fotografias.</p>
                    )}
                    {rest.length > 0 ? (
                      <div className="mt-1 grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-6">
                        {rest.map((image, photoIndex) => (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => setOpen({ work: workIndex, photo: photoIndex + 1 })}
                            className="group overflow-hidden rounded-card bg-ink"
                          >
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className="mt-4 max-w-2xl">
                      <h3 className="font-display text-2xl md:text-3xl">{item.title}</h3>
                      {item.body ? <p className="mt-2 text-muted">{item.body}</p> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="lightbox"
        onClose={() => setOpen(null)}
        aria-label={work ? work.title : "Trabalho"}
      >
        {work && photo ? (
          <div className="overflow-hidden rounded-card bg-paper">
            <div className="relative bg-ink">
              <img src={photo.src} alt={photo.alt} className="max-h-[70dvh] w-full object-contain" />
              <button
                type="button"
                className="tap absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-cream text-ink"
                onClick={() => setOpen(null)}
                aria-label="Fechar"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4 p-5">
              <div>
                {work.tag ? <p className="kicker">{work.tag}</p> : null}
                <h3 className="mt-1 font-display text-2xl">{work.title}</h3>
                <p className="mt-2 text-sm text-muted">
                  {open ? open.photo + 1 : 1} / {work.photos.length}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="tap btn btn-line size-12 px-0" onClick={() => step(-1)} aria-label="Anterior">
                  <ChevronLeft className="size-5" />
                </button>
                <button type="button" className="tap btn btn-line size-12 px-0" onClick={() => step(1)} aria-label="Seguinte">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
