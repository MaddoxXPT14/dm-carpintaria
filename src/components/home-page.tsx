import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { services as serviceIcons, whatsappHref } from "@/lib/site";
import { telHref, waNumber } from "@/lib/content";
import { useSiteContent } from "@/lib/use-content";
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
        areaServed: copy.area,
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
    <section className="bg-ink">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-5 py-8 md:px-8 lg:grid-cols-2 lg:gap-10 lg:py-12">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cream/70">{copy.heroBadge}</p>
          <img
            src={copy.heroImage}
            alt={copy.heroImageAlt}
            width={2048}
            height={1536}
            fetchPriority="high"
            className="mt-3 block h-auto max-h-56 w-full object-contain object-left sm:max-h-72 lg:max-h-[22rem]"
          />
        </div>
        <div className="max-w-xl border border-line bg-cream p-6 md:p-10">
          <p className="kicker enter">{copy.heroKicker}</p>
          <p className="enter mt-2 text-sm font-medium text-oak">{copy.area}</p>
          <h1 className="enter d1 mt-4 font-display text-5xl leading-[1.05] text-ink md:text-6xl">{copy.heroTitle}</h1>
          <p className="enter d2 mt-5 text-lg text-muted">{copy.heroText}</p>
          <div className="enter d3 mt-8 flex flex-wrap gap-3">
            <a href="#contactos" className="tap btn btn-ink">
              {copy.heroPrimary}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a href="#contactos" className="tap btn btn-line">
              {copy.heroSecondary}
            </a>
          </div>
          <ul className="enter d4 mt-8 flex list-none flex-col gap-2 text-sm text-muted sm:flex-row sm:gap-5">
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
            src={copy.aboutImage}
            alt={copy.aboutImageAlt}
            className="aspect-video w-full rounded-card object-cover"
            loading="lazy"
          />
          <figcaption className="mt-3 text-sm text-cream/60">{copy.aboutCaption}</figcaption>
        </figure>
      </div>
      <div className="mx-auto mt-16 w-full max-w-6xl px-5 md:px-8">
        <ol className="grid gap-px overflow-hidden rounded-card border border-cream/15 bg-cream/15 sm:grid-cols-2 lg:grid-cols-4">
        {copy.steps.map((step) => (
          <li key={step.n} className="bg-ink p-6 transition-colors duration-300 hover:bg-[#2a221c]">
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
  const [active, setActive] = useState(0);
  const items = copy.services.map((service, index) => ({
    ...service,
    icon: serviceIcons[index]?.icon ?? serviceIcons[0].icon,
  }));
  const current = items[active] ?? items[0];
  if (!current) return null;
  const Icon = current.icon;
  return (
    <section id="servicos" className="scroll-mt-20 bg-cream py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="kicker">{copy.servicesKicker}</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{copy.servicesTitle}</h2>
          <p className="mt-4 text-muted">{copy.servicesIntro}</p>
        </div>
        <div className="mt-10 grid items-start gap-6 lg:grid-cols-12">
          <div className="grid gap-2 lg:col-span-4" role="tablist" aria-label="Serviços">
            {items.map((service, index) => (
              <button
                key={service.title}
                type="button"
                role="tab"
                aria-selected={index === active}
                className={`tap rounded-card border px-4 py-3 text-left ${index === active ? "border-ink bg-ink text-cream" : "border-line bg-foam text-ink"}`}
                onClick={() => setActive(index)}
              >
                <span className={`font-display text-sm ${index === active ? "text-brass" : "text-oak"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 block font-display text-xl leading-tight">{service.title}</span>
              </button>
            ))}
          </div>
          <article key={current.title} className="enter overflow-hidden rounded-card border border-line bg-foam lg:col-span-8">
            <img src={current.image} alt="" className="aspect-[16/10] w-full object-cover" />
            <div className="p-6 md:p-8">
              <Icon className="size-6 text-oak" aria-hidden="true" />
              <h3 className="mt-4 font-display text-3xl">{current.title}</h3>
              <p className="mt-3 max-w-xl text-muted">{current.summary}</p>
              <ul className="mt-5 space-y-2">
                {current.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-oak" aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { copy } = useSiteContent();
  return (
    <section id="testemunhos" className="scroll-mt-20 bg-ink py-20 text-cream md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="kicker text-brass">{copy.testimonialsKicker}</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{copy.testimonialsTitle}</h2>
          <figure className="mt-10">
            <blockquote className="font-display text-5xl leading-[1.05] md:text-7xl">“{copy.quote}”</blockquote>
            <figcaption className="mt-6 max-w-md text-sm text-cream/70">{copy.quoteBy}</figcaption>
            <a href={copy.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-brass">
              <FacebookIcon className="size-4" />
              Ver a página
            </a>
          </figure>
          <p className="mt-6 max-w-md text-sm text-cream/60">{copy.testimonialsNote}</p>
        </div>
        <div className="lg:col-span-5 lg:pt-16">
          <h3 className="font-display text-3xl">{copy.promisesTitle}</h3>
          <ul className="mt-8">
            {copy.promises.map((item, index) => (
              <li key={item} className="flex items-start gap-4 border-t border-cream/15 py-4">
                <span className="font-display text-brass">{String(index + 1).padStart(2, "0")}</span>
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
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-20 bg-paper py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="kicker">{copy.faqKicker}</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{copy.faqTitle}</h2>
          <p className="mt-4 text-muted">{copy.faqIntro}</p>
        </div>
        <div className="lg:col-span-8">
          {copy.faqs.map((item, index) => {
            const shown = open === index;
            return (
              <div key={item.q} className="border-b border-line">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 py-4 text-left font-medium"
                  aria-expanded={shown}
                  onClick={() => setOpen(shown ? -1 : index)}
                >
                  {item.q}
                  <span className="font-display text-2xl leading-none text-oak" aria-hidden="true">
                    {shown ? "–" : "+"}
                  </span>
                </button>
                {shown ? <p className="max-w-2xl pb-4 text-muted">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GalleryTeaser() {
  const { copy } = useSiteContent();
  return (
    <section className="bg-paper py-20 md:py-28">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-end justify-between gap-6 px-5 md:px-8">
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
    </section>
  );
}

function Footer() {
  const { copy } = useSiteContent();
  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pt-10 pb-24 md:flex-row md:items-end md:justify-between md:px-8 md:pb-10">
        <div>
          <a href="/" className="inline-flex items-center gap-3">
            <img src="/logo.jpg" alt="" className="h-12 w-auto" />
            <span className="font-display text-3xl">DM Carpintaria</span>
          </a>
          <p className="mt-2 text-sm text-muted">{copy.area}</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            {copy.footerText} {copy.phone} · {copy.email}
          </p>
        </div>
        <p className="text-sm text-muted">© {new Date().getFullYear()} DM Carpintaria</p>
      </div>
    </footer>
  );
}
