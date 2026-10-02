import { useEffect, useState } from "react";
import { ArrowRight, Check, Star } from "lucide-react";
import { services as serviceIcons, whatsappHref } from "@/lib/site";
import { telHref, waNumber } from "@/lib/content";
import { useSiteContent } from "@/lib/use-content";
import { listGallery } from "@/lib/gallery.functions";
import type { GalleryProject } from "@/lib/gallery";
import { Header } from "@/components/header";
import { Contact } from "@/components/contact";
import { FacebookIcon, WhatsAppIcon } from "@/components/icons";

export function HomePage() {
  const { copy } = useSiteContent();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HomeAndConstructionBusiness",
        name: "DM Carpintaria",
        description: copy.heroText,
        telephone: telHref(copy.phone),
        email: copy.email,
        areaServed: "Portugal",
      },
      {
        "@type": "FAQPage",
        mainEntity: copy.faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main id="topo">
        <Hero />
        <About />
        <Services />
        <GalleryTeaser />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <a
        href={whatsappHref("Olá, DM Carpintaria. Gostava de pedir um orçamento.", waNumber(copy.phone))}
        target="_blank"
        rel="noreferrer"
        className="tap fixed right-4 bottom-5 z-50 flex size-14 items-center justify-center rounded-full bg-oak-deep text-cream shadow-lg"
        aria-label="Falar no WhatsApp"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    </>
  );
}

function Hero() {
  const { copy } = useSiteContent();
  return (
    <section className="grid lg:grid-cols-12">
      <div className="order-2 flex flex-col justify-center px-5 py-14 md:px-8 lg:order-1 lg:col-span-5 lg:py-20 lg:pr-10">
        <p className="kicker enter">{copy.heroKicker}</p>
        <h1 className="enter d1 mt-4 font-display text-5xl leading-tight text-ink md:text-6xl">{copy.heroTitle}</h1>
        <p className="enter d2 mt-5 max-w-md text-lg text-muted">{copy.heroText}</p>
        <div className="enter d3 mt-8 flex flex-wrap gap-3">
          <a href="#contactos" className="tap btn btn-ink">
            {copy.heroPrimary}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <a href="#contactos" className="tap btn btn-line">
            {copy.heroSecondary}
          </a>
        </div>
        <ul className="enter d4 mt-10 flex list-none flex-col gap-2 text-sm text-muted sm:flex-row sm:gap-5">
          {copy.heroNotes.flatMap((note, index) =>
            index === 0
              ? [<li key={note}>{note}</li>]
              : [
                  <li key={`${note}-dot`} className="hidden sm:list-item">
                    ·
                  </li>,
                  <li key={note}>{note}</li>,
                ],
          )}
        </ul>
      </div>
      <div className="relative order-1 min-h-[58vw] lg:order-2 lg:col-span-7 lg:min-h-full">
        <img
          src="/gallery/fb/sala.jpg"
          alt="Sala concluída com painel ripado em carvalho e base de televisão, obra da DM Carpintaria"
          width={2048}
          height={1536}
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover"
        />
        <p className="absolute bottom-4 left-4 rounded-full bg-cream/95 px-3 py-2 text-xs font-medium uppercase tracking-widest text-ink">
          {copy.heroBadge}
        </p>
      </div>
    </section>
  );
}

function About() {
  const { copy } = useSiteContent();
  return (
    <section id="sobre" className="scroll-mt-20 bg-ink py-20 text-cream md:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 md:px-8 lg:grid-cols-2">
        <div>
          <p className="kicker text-brass">{copy.aboutKicker}</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{copy.aboutTitle}</h2>
          <p className="mt-5 text-cream/80">{copy.aboutP1}</p>
          <p className="mt-4 text-cream/80">{copy.aboutP2}</p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <Value title="Missão" text={copy.mission} />
            <Value title="Visão" text={copy.vision} />
            <Value title="Valores" text={copy.values} />
          </dl>
        </div>
        <figure>
          <img
            src="/gallery/fb/carrinha.jpg"
            alt="Carrinha branca da DM Carpintaria com o telefone e o email"
            className="aspect-video w-full rounded-card object-cover"
            loading="lazy"
          />
          <figcaption className="mt-3 text-sm text-cream/60">A carrinha com que chegamos à obra.</figcaption>
        </figure>
      </div>
      <div className="mx-auto mt-16 w-full max-w-6xl px-5 md:px-8">
        <ol className="grid gap-px overflow-hidden rounded-card border border-cream/15 bg-cream/15 sm:grid-cols-2 lg:grid-cols-4">
        {copy.steps.map((step) => (
          <li key={step.n} className="bg-ink p-6">
            <p className="font-display text-2xl text-brass">{step.n}</p>
            <h3 className="mt-3 font-display text-2xl">{step.title}</h3>
            <p className="mt-2 text-sm text-cream/70">{step.text}</p>
          </li>
        ))}
        </ol>
      </div>
    </section>
  );
}

function Value({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-t border-cream/20 pt-3">
      <dt className="text-xs font-semibold uppercase tracking-widest text-brass">{title}</dt>
      <dd className="mt-2 text-sm text-cream/75">{text}</dd>
    </div>
  );
}

function Services() {
  const { copy } = useSiteContent();
  const items = copy.services.map((service, index) => ({
    ...service,
    icon: serviceIcons[index]?.icon ?? serviceIcons[0].icon,
  }));
  const lead = items[0];
  if (!lead) return null;
  const rest = items.slice(1);
  const LeadIcon = lead.icon;
  return (
    <section id="servicos" className="scroll-mt-20 bg-cream py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="kicker">{copy.servicesKicker}</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{copy.servicesTitle}</h2>
          <p className="mt-4 text-muted">{copy.servicesIntro}</p>
        </div>

        <article className="mt-12 grid overflow-hidden rounded-card border border-line bg-foam md:grid-cols-2">
          <img
            src="/gallery/fb/ripas.jpg"
            alt="Painel ripado em carvalho com televisão integrada, obra publicada"
            className="h-full min-h-64 w-full object-cover"
            loading="lazy"
          />
          <div className="flex flex-col justify-center p-6 md:p-10">
            <LeadIcon className="size-6 text-oak" aria-hidden="true" />
            <h3 className="mt-4 font-display text-3xl">{lead.title}</h3>
            <p className="mt-3 text-muted">{lead.summary}</p>
            <ul className="mt-5 space-y-2">
              {lead.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-oak" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </article>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rest.map((service) => {
            const Icon = service.icon;
            return (
              <article key={service.title} className="rounded-card border border-line bg-foam p-6">
                <Icon className="size-6 text-oak" aria-hidden="true" />
                <h3 className="mt-4 font-display text-2xl">{service.title}</h3>
                <p className="mt-2 text-sm text-muted">{service.summary}</p>
                <ul className="mt-4 space-y-2">
                  {service.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-oak" aria-hidden="true" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { copy } = useSiteContent();
  return (
    <section id="testemunhos" className="scroll-mt-20 bg-ink py-20 text-cream md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-2">
        <div>
          <p className="kicker text-brass">{copy.testimonialsKicker}</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{copy.testimonialsTitle}</h2>
          <figure className="mt-8 rounded-card border border-cream/15 bg-cream/5 p-6">
            <div className="flex gap-1 text-brass" aria-label="Reação positiva">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className="size-4 fill-current" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="mt-4 font-display text-5xl">“{copy.quote}”</blockquote>
            <figcaption className="mt-4 text-sm text-cream/70">{copy.quoteBy}</figcaption>
            <a href={copy.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-brass">
              <FacebookIcon className="size-4" />
              Ver a página
            </a>
          </figure>
          <p className="mt-4 text-sm text-cream/60">{copy.testimonialsNote}</p>
        </div>
        <div>
          <p className="kicker text-brass">Em cada obra</p>
          <h3 className="mt-3 font-display text-3xl">{copy.promisesTitle}</h3>
          <ul className="mt-8 space-y-3">
            {copy.promises.map((item) => (
              <li key={item} className="flex items-center gap-3 border-b border-cream/15 pb-3">
                <Star className="size-4 shrink-0 fill-current text-brass" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const { copy } = useSiteContent();
  return (
    <section id="faq" className="scroll-mt-20 bg-paper py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="kicker">{copy.faqKicker}</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{copy.faqTitle}</h2>
          <p className="mt-4 text-muted">{copy.faqIntro}</p>
        </div>
        <div className="lg:col-span-8">
          {copy.faqs.map((item) => (
            <details key={item.q} className="group border-b border-line py-4">
              <summary className="flex items-center justify-between gap-4 font-medium">
                {item.q}
                <span className="mark-closed font-display text-2xl leading-none text-oak" aria-hidden="true">
                  +
                </span>
                <span className="mark-open font-display text-2xl leading-none text-oak" aria-hidden="true">
                  –
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function GalleryTeaser() {
  const { copy } = useSiteContent();
  const [projects, setProjects] = useState<GalleryProject[] | null>(null);

  useEffect(() => {
    listGallery()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  const covers = (projects ?? []).flatMap((project) => project.photos.slice(0, 1)).slice(0, 3);

  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="kicker">{copy.galleryKicker}</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">{copy.galleryTitle}</h2>
            <p className="mt-4 max-w-xl text-muted">{copy.galleryText}</p>
          </div>
          <a href="/trabalhos" className="tap btn btn-ink">
            {copy.galleryButton}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        {covers.length > 0 ? (
          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {covers.map((photo) => (
              <a key={photo.id} href="/trabalhos" className="block overflow-hidden rounded-card bg-ink">
                <img src={photo.src} alt={photo.alt} className="aspect-[4/3] w-full object-cover" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Footer() {
  const { copy } = useSiteContent();
  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pt-10 pb-24 md:flex-row md:items-end md:justify-between md:px-8 md:pb-10">
        <div>
          <p className="font-display text-3xl">DM Carpintaria</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            {copy.footerText} {copy.phone} · {copy.email}
          </p>
        </div>
        <p className="text-sm text-muted">© {new Date().getFullYear()} DM Carpintaria</p>
      </div>
    </footer>
  );
}
