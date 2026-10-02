import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { site, whatsappHref } from "@/lib/site";
import { telHref, waNumber } from "@/lib/content";
import { useSiteContent } from "@/lib/use-content";
import { trackLead } from "@/components/analytics";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons";

type Errors = Partial<Record<"nome" | "telefone" | "email" | "servico" | "mensagem", string>>;

const initial = { nome: "", telefone: "", email: "", servico: "", mensagem: "" };

export function Contact() {
  const { copy } = useSiteContent();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<{ href: string; channel: Channel } | null>(null);

  function update(field: keyof typeof initial, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (values.nome.trim().length < 2) next.nome = "Indique o seu nome.";
    if (!/^[+0-9][0-9\s()-]{7,18}$/.test(values.telefone.trim())) {
      next.telefone = "Indique um telefone válido.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Indique um email válido.";
    }
    if (!values.servico) next.servico = "Escolha um serviço.";
    if (values.mensagem.trim().length < 12) {
      next.mensagem = "Descreva o que precisa, em poucas linhas.";
    }
    return next;
  }

  function requestText() {
    return [
      "Olá, DM Carpintaria. Venho pelo site pedir um orçamento.",
      `Nome: ${values.nome.trim()}`,
      `Telefone: ${values.telefone.trim()}`,
      `Email: ${values.email.trim()}`,
      `Serviço: ${values.servico}`,
      `Mensagem: ${values.mensagem.trim()}`,
    ].join("\n");
  }

  async function send(channel: Channel) {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const text = requestText();
    trackLead();
    if (channel === "whatsapp") {
      const href = whatsappHref(text, waNumber(copy.phone));
      setSent({ href, channel });
      const opened = window.open(href, "_blank", "noopener,noreferrer");
      if (!opened) window.location.href = href;
      return;
    }
    if (channel === "email") {
      const href = `mailto:${copy.email}?subject=${encodeURIComponent("Pedido de orçamento — DM Carpintaria")}&body=${encodeURIComponent(text)}`;
      setSent({ href, channel });
      window.location.href = href;
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // The Facebook window still opens; the visitor can copy from the confirmation.
    }
    const href = messengerHref(copy.facebook || site.facebook);
    setSent({ href, channel });
    const opened = window.open(href, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = href;
  }

  const mapsHref = copy.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(copy.address)}`
    : "https://www.google.com/maps/search/?api=1&query=DM%20Carpintaria";

  return (
    <section id="contactos" className="scroll-mt-20 bg-cream py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="kicker">{copy.contactKicker}</p>
          <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{copy.contactTitle}</h2>
          <p className="mt-4 text-muted">{copy.contactText}</p>

          <ul className="mt-8 space-y-3">
            <li>
              <a href={`tel:${telHref(copy.phone)}`} className="flex items-center gap-3 hover:text-oak-deep">
                <Phone className="size-5 text-oak" aria-hidden="true" />
                <span>
                  <span className="block text-xs uppercase tracking-widest text-muted">Ligar agora</span>
                  {copy.phone}
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${copy.email}`} className="flex items-center gap-3 hover:text-oak-deep">
                <Mail className="size-5 text-oak" aria-hidden="true" />
                <span>
                  <span className="block text-xs uppercase tracking-widest text-muted">Email</span>
                  {copy.email}
                </span>
              </a>
            </li>
            <li>
              <a
                href={whatsappHref("Olá, DM Carpintaria. Gostava de pedir um orçamento.", waNumber(copy.phone))}
                className="flex items-center gap-3 hover:text-oak-deep"
                target="_blank"
                rel="noreferrer"
              >
                <WhatsAppIcon className="size-5 text-oak" />
                <span>
                  <span className="block text-xs uppercase tracking-widest text-muted">WhatsApp</span>
                  {copy.phone}
                </span>
              </a>
            </li>
          </ul>

          <div className="mt-8 overflow-hidden rounded-card border border-line bg-paper">
            {copy.address ? (
              <iframe
                title="Mapa da DM Carpintaria"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(copy.address)}&z=15&output=embed`}
                className="h-56 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="flex h-44 flex-col justify-end bg-ink p-5 text-cream">
                <MapPin className="size-5 text-brass" aria-hidden="true" />
                <p className="mt-3 font-display text-2xl">{copy.visitTitle}</p>
                <p className="mt-1 text-sm text-cream/80">{copy.visitText}</p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="text-sm text-muted">
                {copy.address || "Portugal · deslocação ao local"}
              </p>
              <a href={mapsHref} target="_blank" rel="noreferrer" className="text-sm font-medium text-oak-deep">
                Abrir no Google Maps
              </a>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <a
              href={copy.facebook || site.facebook}
              target="_blank"
              rel="noreferrer"
              className="tap flex size-12 items-center justify-center rounded-full border border-line hover:border-ink"
              aria-label="Facebook da DM Carpintaria"
            >
              <FacebookIcon className="size-5" />
            </a>
            {copy.instagram ? (
              <a
                href={copy.instagram}
                target="_blank"
                rel="noreferrer"
                className="tap flex size-12 items-center justify-center rounded-full border border-line hover:border-ink"
                aria-label="Instagram da DM Carpintaria"
              >
                <InstagramIcon className="size-5" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="rounded-card border border-line bg-foam p-5 md:p-8 lg:col-span-7">
          {sent ? (
            <div className="flex h-full min-h-80 flex-col justify-center">
              <p className="kicker">Pedido pronto</p>
              <h3 className="mt-3 font-display text-4xl">{sentCopy[sent.channel].title}</h3>
              <p className="mt-3 max-w-md text-muted">{sentCopy[sent.channel].text}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={sent.href} target="_blank" rel="noreferrer" className="tap btn btn-ink">
                  {sent.channel === "email" ? <Mail className="size-4" /> : null}
                  {sent.channel === "whatsapp" ? <WhatsAppIcon className="size-4" /> : null}
                  {sent.channel === "facebook" ? <FacebookIcon className="size-4" /> : null}
                  {sentCopy[sent.channel].action}
                </a>
                <button
                  type="button"
                  className="tap btn btn-line"
                  onClick={() => {
                    setSent(null);
                    setValues(initial);
                  }}
                >
                  Novo pedido
                </button>
              </div>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                void send("whatsapp");
              }}
            >
              <h3 className="font-display text-3xl">Pedir orçamento</h3>
              <p className="mt-2 text-sm text-muted">Campos com asterisco são obrigatórios. Escolha como quer enviar.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  id="nome"
                  label="Nome"
                  value={values.nome}
                  error={errors.nome}
                  autoComplete="name"
                  onChange={(value) => update("nome", value)}
                />
                <Field
                  id="telefone"
                  label="Telefone"
                  value={values.telefone}
                  error={errors.telefone}
                  autoComplete="tel"
                  inputMode="tel"
                  onChange={(value) => update("telefone", value)}
                />
                <Field
                  id="email"
                  label="Email"
                  value={values.email}
                  error={errors.email}
                  autoComplete="email"
                  className="sm:col-span-2"
                  onChange={(value) => update("email", value)}
                />
                <div className="sm:col-span-2">
                  <label htmlFor="servico" className="mb-1.5 block text-sm font-medium">
                    Serviço *
                  </label>
                  <select
                    id="servico"
                    name="servico"
                    className="field"
                    value={values.servico}
                    aria-invalid={Boolean(errors.servico)}
                    aria-describedby={errors.servico ? "servico-erro" : undefined}
                    onChange={(event) => update("servico", event.target.value)}
                  >
                    <option value="">Escolher</option>
                    {copy.services.map((service) => (
                      <option key={service.title} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                    <option value="Ainda não sei">Ainda não sei</option>
                  </select>
                  {errors.servico ? (
                    <p id="servico-erro" className="mt-1 text-sm text-oak-deep">
                      {errors.servico}
                    </p>
                  ) : null}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="mensagem" className="mb-1.5 block text-sm font-medium">
                    O que precisa *
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    rows={5}
                    className="field py-3"
                    value={values.mensagem}
                    aria-invalid={Boolean(errors.mensagem)}
                    aria-describedby={errors.mensagem ? "mensagem-erro" : undefined}
                    onChange={(event) => update("mensagem", event.target.value)}
                  />
                  {errors.mensagem ? (
                    <p id="mensagem-erro" className="mt-1 text-sm text-oak-deep">
                      {errors.mensagem}
                    </p>
                  ) : null}
                </div>
              </div>
              {Object.values(errors).some(Boolean) ? (
                <p role="alert" className="mt-4 text-sm text-oak-deep">
                  Falta corrigir os campos assinalados.
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <button type="submit" className="tap btn btn-ink">
                  <WhatsAppIcon className="size-4" />
                  WhatsApp
                </button>
                <button type="button" className="tap btn btn-line" onClick={() => void send("email")}>
                  <Mail className="size-4" />
                  Email
                </button>
                <button type="button" className="tap btn btn-line" onClick={() => void send("facebook")}>
                  <FacebookIcon className="size-4" />
                  Facebook
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

type Channel = "whatsapp" | "email" | "facebook";

const sentCopy: Record<Channel, { title: string; text: string; action: string }> = {
  whatsapp: {
    title: "A conversa está aberta no WhatsApp.",
    text: "Se a janela não apareceu, use o botão. Respondemos com a disponibilidade para visitar ou orçamentar.",
    action: "Abrir WhatsApp",
  },
  email: {
    title: "O email está pronto a enviar.",
    text: "Abriu-se o programa de correio com o pedido. Confirme e envie. Se não abriu, use o botão.",
    action: "Abrir email",
  },
  facebook: {
    title: "A mensagem foi copiada.",
    text: "O Facebook não aceita o texto automaticamente. Na conversa, cole a mensagem e envie.",
    action: "Abrir Facebook",
  },
};

function messengerHref(facebook: string) {
  try {
    const id = new URL(facebook).searchParams.get("id");
    if (id) return `https://m.me/${id}`;
  } catch {
    return facebook;
  }
  return facebook;
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  className,
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  className?: string;
  autoComplete?: string;
  inputMode?: "tel" | "email" | "text";
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label} *
      </label>
      <input
        id={id}
        name={id}
        value={value}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-erro` : undefined}
        className="field"
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={`${id}-erro`} className="mt-1 text-sm text-oak-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}
