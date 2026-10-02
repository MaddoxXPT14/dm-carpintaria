import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryProject } from "@/lib/gallery";

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

  if (projects.length === 0) {
    return (
      <p className="mt-10 text-muted">Ainda não há trabalhos publicados.</p>
    );
  }

  return (
    <>
      <div className="mt-12 flex flex-col gap-10">
        {projects.map((item, workIndex) => (
          <article key={item.id} className="overflow-hidden rounded-card border border-line bg-foam">
            {item.photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-1 bg-line p-1 md:grid-cols-3">
                {item.photos.map((image, photoIndex) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setOpen({ work: workIndex, photo: photoIndex })}
                    className="group relative aspect-[4/3] overflow-hidden bg-ink text-left"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <p className="p-5 text-muted">Este trabalho ainda não tem fotografias.</p>
            )}
            <div className="p-5 md:p-6">
              {item.tag ? <p className="kicker">{item.tag}</p> : null}
              <h2 className="mt-1 font-display text-2xl md:text-3xl">{item.title}</h2>
              {item.body ? <p className="mt-2 max-w-xl text-muted">{item.body}</p> : null}
            </div>
          </article>
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
