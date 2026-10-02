import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { site, works } from "@/lib/site";

export function Portfolio() {
  const [open, setOpen] = useState<{ work: number; photo: number } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const work = open ? works[open.work] : null;
  const photo = work && open ? work.images[open.photo] : null;

  function step(direction: number) {
    setOpen((current) => {
      if (!current) return current;
      const images = works[current.work].images;
      const photo = (current.photo + direction + images.length) % images.length;
      return { ...current, photo };
    });
  }

  return (
    <section id="trabalhos" className="scroll-mt-20 bg-paper py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="kicker">Trabalhos</p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
            Trabalho já feito.
          </h2>
          <p className="mt-4 max-w-xl text-muted">
            Cada publicação fica na sua ficha. As fotos de um trabalho não se misturam com as do seguinte.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-10">
          {works.map((item, workIndex) => (
            <article key={item.title} className="overflow-hidden rounded-card border border-line bg-foam">
              <div className="grid grid-cols-2 gap-1 bg-line p-1 md:grid-cols-3">
                {item.images.map((image, photoIndex) => (
                  <button
                    key={image.src}
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
              <div className="flex flex-wrap items-end justify-between gap-4 p-5 md:p-6">
                <div>
                  <p className="kicker">{item.tag}</p>
                  <h3 className="mt-1 font-display text-2xl md:text-3xl">{item.title}</h3>
                  <p className="mt-2 max-w-xl text-muted">{item.text}</p>
                </div>
                <a href={site.facebook} target="_blank" rel="noreferrer" className="text-sm font-medium text-oak-deep">
                  Ver a publicação
                </a>
              </div>
            </article>
          ))}
        </div>
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
                <p className="kicker">{work.tag}</p>
                <h3 className="mt-1 font-display text-2xl">{work.title}</h3>
                <p className="mt-2 text-sm text-muted">
                  {open ? open.photo + 1 : 1} / {work.images.length}
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
    </section>
  );
}
