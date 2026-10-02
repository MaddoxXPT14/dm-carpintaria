import { useEffect, useState } from "react";
import { ArrowRight, Check, Star } from "lucide-react";
import { faqs, jsonLd, promises, services, site, steps, whatsappHref } from "@/lib/site";
import { listGallery } from "@/lib/gallery.functions";
import type { GalleryProject } from "@/lib/gallery";
import { Header } from "@/components/header";
import { Contact } from "@/components/contact";
import { FacebookIcon, WhatsAppIcon } from "@/components/icons";

export function HomePage() {
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
        href={whatsappHref("Olá, DM Carpintaria. Gostava de pedir um orçamento.")}
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
  return (
    <section className="grid lg:grid-cols-12">
      <div className="order-2 flex flex-col justify-center px-5 py-14 md:px-8 lg:order-1 lg:col-span-5 lg:py-20 lg:pr-10">
        <p className="kicker enter">Carpintaria de interiores</p>
        <h1 className="enter d1 mt-4 font-display text-5xl leading-tight text-ink md:text-6xl">
          Madeira à medida da sua casa.
        </h1>
        <p className="enter d2 mt-5 max-w-md text-lg text-muted">
          Painéis ripados, mobiliário e divisões feitas para o espaço real. Do desenho à montagem,
          com um orçamento que se percebe.
        </p>
        <div className="enter d3 mt-8 flex flex-wrap gap-3">
          <a href="#contactos" className="tap btn btn-ink">
            Pedir orçamento
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
          <a href="#contactos" className="tap btn btn-line">
            Contactar
          </a>
        </div>
        <ul className="enter d4 mt-10 flex list-none flex-col gap-2 text-sm text-muted sm:flex-row sm:gap-5">
          <li>Medição no local</li>
          <li className="hidden sm:list-item">·</li>
          <li>Orçamento sem compromisso</li>
          <li className="hidden sm:list-item">·</li>
          <li>Montagem incluída</li>
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
          Painel ripado em carvalho
        </p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="sobre" className="scroll-mt-20 bg-ink py-20 text-cream md:py-28">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 md:px-8 lg:grid-cols-2">
        <div>
          <p className="kicker text-brass">Sobre nós</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            Quem mede é quem monta.
          </h2>
          <p className="mt-5 text-cream/80">
            A DM Carpintaria faz interiores em madeira: paredes de televisão, móveis integrados,
            cozinhas, roupeiros e portas. O trabalho que publicamos — uma base de TV com painel
            ripado em carvalho — resume o ofício: uma peça desenhada para aquela parede, não
            adaptada de um catálogo.
          </p>
          <p className="mt-4 text-cream/80">
            Fala diretamente com quem executa. Sem balcão pelo meio, do primeiro contacto ao dia
            da montagem.
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <Value title="Missão" text="Entregar carpintaria bem feita, com materiais honestos e um resultado que se reconhece no dia da montagem." />
            <Value title="Visão" text="Ser a oficina a que se volta quando a casa pede o que o catálogo não tem." />
            <Value title="Valores" text="Rigor nas medidas, clareza no preço, respeito pela madeira e cuidado dentro de casa." />
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
        {steps.map((step) => (
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
  const lead = services[0];
  if (!lead) return null;
  const rest = services.slice(1);
  const LeadIcon = lead.icon;
  return (
    <section id="servicos" className="scroll-mt-20 bg-cream py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
        <div className="max-w-2xl">
          <p className="kicker">Serviços</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            O que a madeira pode fazer numa casa.
          </h2>
          <p className="mt-4 text-muted">
            Cada serviço inclui conversa, medição e montagem. O desenho segue o espaço, não uma
            medida de exposição.
          </p>
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
  return (
    <section id="testemunhos" className="scroll-mt-20 bg-ink py-20 text-cream md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-5 md:px-8 lg:grid-cols-2">
        <div>
          <p className="kicker text-brass">Testemunhos</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
            O que já foi dito em público.
          </h2>
          <figure className="mt-8 rounded-card border border-cream/15 bg-cream/5 p-6">
            <div className="flex gap-1 text-brass" aria-label="Reação positiva">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className="size-4 fill-current" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="mt-4 font-display text-5xl">“Top!”</blockquote>
            <figcaption className="mt-4 text-sm text-cream/70">
              Pedro Carvalho, comentário público no Facebook, sobre a base de TV com painel ripado
              em carvalho.
            </figcaption>
            <a href={site.facebook} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-brass">
              <FacebookIcon className="size-4" />
              Ver a página
            </a>
          </figure>
          <p className="mt-4 text-sm text-cream/60">
            A página ainda não tem avaliações formais com classificação. Se já fomos a sua casa, a
            sua opinião no Facebook ajuda quem está a decidir.
          </p>
        </div>
        <div>
          <p className="kicker text-brass">Em cada obra</p>
          <h3 className="mt-3 font-display text-3xl">Cinco pontos que não negociamos.</h3>
          <ul className="mt-8 space-y-3">
            {promises.map((item) => (
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
  return (
    <section id="faq" className="scroll-mt-20 bg-paper py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="kicker">Perguntas frequentes</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">Antes de ligar.</h2>
          <p className="mt-4 text-muted">Se a sua dúvida não estiver aqui, o WhatsApp é o caminho mais curto.</p>
        </div>
        <div className="lg:col-span-8">
          {faqs.map((item) => (
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
            <p className="kicker">Trabalhos</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-ink md:text-5xl">
              Trabalho já feito.
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              A galeria junta as fotografias de cada obra. Entra para ver o conjunto.
            </p>
          </div>
          <a href="/trabalhos" className="tap btn btn-ink">
            Ver a galeria
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
  return (
    <footer className="border-t border-line bg-cream">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pt-10 pb-24 md:flex-row md:items-end md:justify-between md:px-8 md:pb-10">
        <div>
          <p className="font-display text-3xl">DM Carpintaria</p>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Interiores em madeira à medida. {site.phoneDisplay} · {site.email}
          </p>
        </div>
        <p className="text-sm text-muted">© {new Date().getFullYear()} DM Carpintaria</p>
      </div>
    </footer>
  );
}
