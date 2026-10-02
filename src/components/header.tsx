import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { nav } from "@/lib/site";
import { telHref } from "@/lib/content";
import { useSiteContent } from "@/lib/use-content";
import { cn } from "@/lib/cn";

export function Header() {
  const [open, setOpen] = useState(false);
  const { copy } = useSiteContent();
  const tel = telHref(copy.phone);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 md:h-18 md:px-8">
        <a href="/" className="flex items-baseline gap-2" onClick={() => setOpen(false)}>
          <span className="font-display text-2xl leading-none tracking-tight">DM</span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted">Carpintaria</span>
        </a>

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Secções">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-muted hover:text-ink">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${tel}`}
            className="tap btn btn-line hidden sm:inline-flex"
            aria-label={`Ligar agora para ${copy.phone}`}
          >
            <Phone className="size-4" aria-hidden="true" />
            Ligar agora
          </a>
          <a href={`tel:${tel}`} className="tap btn btn-line size-12 px-0 sm:hidden" aria-label="Ligar agora">
            <Phone className="size-5" aria-hidden="true" />
          </a>
          <a href="/#contactos" className="tap btn btn-ink hidden md:inline-flex">
            {copy.heroPrimary}
          </a>
          <button
            type="button"
            className="tap btn btn-line size-12 px-0 xl:hidden"
            aria-expanded={open}
            aria-controls="menu-movel"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <div
        id="menu-movel"
        className={cn(
          "border-t border-line bg-cream px-5 py-4 xl:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col" aria-label="Secções">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="border-b border-line py-3 font-display text-2xl"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a href="/#contactos" className="tap btn btn-ink mt-4" onClick={() => setOpen(false)}>
            {copy.heroPrimary}
          </a>
        </nav>
      </div>
    </header>
  );
}
