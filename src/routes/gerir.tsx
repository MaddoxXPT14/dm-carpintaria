import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  addGalleryProject,
  addProjectPhotos,
  changeGalleryPassword,
  checkGalleryPassword,
  deleteGalleryPhoto,
  deleteGalleryProject,
  getContent,
  listGallery,
  updateGalleryProject,
  updateSiteCopy,
} from "@/lib/gallery.functions";
import type { SiteCopy } from "@/lib/content";
import { clearContentCache } from "@/lib/use-content";
import { WorksManager } from "@/components/works-manager";
import type { GalleryProject } from "@/lib/gallery";

const storageKey = "dm-gallery-key";

export const Route = createFileRoute("/gerir")({
  head: () => ({
    meta: [
      { title: "Galeria" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ManagePage,
});

function ManagePage() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setProjects(await listGallery());
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (!saved) return;
    checkGalleryPassword({ data: { password: saved } })
      .then(async () => {
        setPassword(saved);
        setUnlocked(true);
        setProjects(await listGallery());
      })
      .catch(() => sessionStorage.removeItem(storageKey));
  }, []);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const next = String(new FormData(event.currentTarget).get("password") ?? "");
    try {
      await checkGalleryPassword({ data: { password: next } });
      sessionStorage.setItem(storageKey, next);
      setPassword(next);
      setUnlocked(true);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  }

  if (!unlocked) {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper px-5">
        <form onSubmit={unlock} className="grid w-full max-w-sm gap-4">
          <h1 className="font-display text-3xl text-ink">Entrada</h1>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="h-12 rounded-card border border-line bg-cream px-3"
          />
          {error ? <p className="text-sm text-oak-deep">{error}</p> : null}
          <button type="submit" className="tap btn btn-ink" disabled={busy}>
            {busy ? "A verificar…" : "Entrar"}
          </button>
        </form>
      </main>
    );
  }

  return <Editor password={password} projects={projects} onChange={refresh} onPassword={setPassword} />;
}

function Editor({
  password,
  projects,
  onChange,
  onPassword,
}: {
  password: string;
  projects: GalleryProject[];
  onChange: () => Promise<void>;
  onPassword: (password: string) => void;
}) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<"trabalhos" | "textos">("trabalhos");
  const [copy, setCopy] = useState<SiteCopy | null>(null);

  useEffect(() => {
    getContent()
      .then((value) => setCopy(value.copy))
      .catch(() => setCopy(null));
  }, [projects]);

  function saved(published: boolean) {
    clearContentCache();
    setNotice("Guardado.");
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const files = data.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
    if (files.length === 0) {
      setError("Escolhe pelo menos uma foto.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const images = [];
      for (const file of files.slice(0, 12)) {
        images.push({ alt: String(data.get("title") ?? ""), data: await shrink(file) });
      }
      await addGalleryProject({
        data: {
          password,
          title: String(data.get("title") ?? ""),
          tag: String(data.get("tag") ?? ""),
          body: String(data.get("body") ?? ""),
          images,
        },
      });
      form.reset();
      await onChange();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }

  async function saveProject(event: FormEvent<HTMLFormElement>, id: number) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const result = await updateGalleryProject({
        data: {
          password,
          id,
          title: String(data.get("title") ?? ""),
          tag: String(data.get("tag") ?? ""),
          body: String(data.get("body") ?? ""),
        },
      });
      const files = data.getAll("photos").filter((item): item is File => item instanceof File && item.size > 0);
      if (files.length > 0) {
        const images = [];
        for (const file of files.slice(0, 12)) {
          images.push({ alt: String(data.get("title") ?? ""), data: await shrink(file) });
        }
        await addProjectPhotos({ data: { password, id, images } });
      }
      saved(result.published);
      await onChange();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }

  async function removeProject(id: number) {
    if (!confirm("Retirar este trabalho da galeria?")) return;
    setError("");
    try {
      await deleteGalleryProject({ data: { password, id } });
      await onChange();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível retirar.");
    }
  }

  async function removePhoto(id: number) {
    setError("");
    try {
      await deleteGalleryPhoto({ data: { password, id } });
      await onChange();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível retirar a foto.");
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const next = String(new FormData(form).get("next") ?? "");
    setBusy(true);
    setError("");
    try {
      await changeGalleryPassword({ data: { password, next } });
      sessionStorage.setItem(storageKey, next);
      onPassword(next);
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível mudar a palavra-passe.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="bg-paper">
      <section className="mx-auto w-full max-w-6xl px-5 py-12">
        <h1 className="font-display text-4xl text-ink">Trabalhos</h1>
        <p className="mt-2 text-sm text-muted">Esta página não aparece no site.</p>
        <div className="mt-6 flex gap-2">
          <button type="button" className={`tap btn ${panel === "trabalhos" ? "btn-ink" : "btn-line"}`} onClick={() => setPanel("trabalhos")}>
            Trabalhos
          </button>
          <button type="button" className={`tap btn ${panel === "textos" ? "btn-ink" : "btn-line"}`} onClick={() => setPanel("textos")}>
            Textos do site
          </button>
        </div>
        {notice ? <p className="mt-4 text-sm text-oak">{notice}</p> : null}
        {panel === "textos" && copy ? (
          <TextEditor
            password={password}
            copy={copy}
            busy={busy}
            onBusy={setBusy}
            onError={setError}
            onSaved={saved}
          />
        ) : null}
        {panel === "trabalhos" ? <WorksManager password={password} onSaved={saved} /> : null}
        {error && panel === "textos" ? <p className="mt-4 text-sm text-oak-deep">{error}</p> : null}
        <form onSubmit={changePassword} className="mt-10 grid gap-3 border-t border-line pt-8">
          <h2 className="font-display text-2xl">Mudar palavra-passe</h2>
          <input name="next" type="password" required minLength={8} autoComplete="new-password" className="h-12 rounded-card border border-line bg-cream px-3" />
          <button type="submit" className="tap btn btn-line" disabled={busy}>
            Guardar
          </button>
        </form>
      </section>
    </main>
  );
}

function TextEditor({
  password,
  copy,
  busy,
  onBusy,
  onError,
  onSaved,
}: {
  password: string;
  copy: SiteCopy;
  busy: boolean;
  onBusy: (busy: boolean) => void;
  onError: (message: string) => void;
  onSaved: (published: boolean) => void;
}) {
  const [draft, setDraft] = useState(copy);

  useEffect(() => {
    setDraft(copy);
  }, [copy]);

  function set<K extends keyof SiteCopy>(key: K, value: SiteCopy[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onBusy(true);
    onError("");
    try {
      const result = await updateSiteCopy({
        data: {
          password,
          copy: {
            ...draft,
            heroNotes: draft.heroNotes.map((line) => line.trim()).filter(Boolean),
            promises: draft.promises.map((line) => line.trim()).filter(Boolean),
            services: draft.services.map((service) => ({
              ...service,
              benefits: service.benefits.map((line) => line.trim()).filter(Boolean),
            })),
          },
        },
      });
      onSaved(result.published);
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Não foi possível guardar.");
    } finally {
      onBusy(false);
    }
  }

  const [menu, setMenu] = useState<(typeof menus)[number]["id"]>("inicio");
  const [open, setOpen] = useState(0);
  const current = menus.find((item) => item.id === menu) ?? menus[0];
  const stepIndex = Math.min(open, Math.max(draft.steps.length - 1, 0));
  const serviceIndex = Math.min(open, Math.max(draft.services.length - 1, 0));
  const faqIndex = Math.min(open, Math.max(draft.faqs.length - 1, 0));
  const step = draft.steps[stepIndex];
  const service = draft.services[serviceIndex];
  const faq = draft.faqs[faqIndex];

  function choose(id: (typeof menus)[number]["id"]) {
    setMenu(id);
    setOpen(0);
  }

  return (
    <form onSubmit={save} className="mt-8 lg:flex lg:items-start lg:gap-8">
      <nav className="grid content-start gap-2 lg:sticky lg:top-24 lg:w-52 lg:shrink-0">
        {menus.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`tap rounded-card border px-3 py-2 text-left text-sm ${menu === item.id ? "border-ink bg-ink text-cream" : "border-line bg-cream"}`}
            onClick={() => choose(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <section className="mt-6 grid min-w-0 flex-1 gap-4 lg:mt-0">
        <div>
          <h2 className="font-display text-3xl">{current.label}</h2>
          <p className="mt-1 text-sm text-muted">{current.hint}</p>
        </div>
        {menu === "inicio" ? (
          <>
            <Field label="Pequeno texto por cima" value={draft.heroKicker} onChange={(value) => set("heroKicker", value)} />
            <Field label="Título" value={draft.heroTitle} onChange={(value) => set("heroTitle", value)} />
            <Field label="Texto" value={draft.heroText} onChange={(value) => set("heroText", value)} area />
            <Field label="Botão principal" value={draft.heroPrimary} onChange={(value) => set("heroPrimary", value)} />
            <Field label="Botão secundário" value={draft.heroSecondary} onChange={(value) => set("heroSecondary", value)} />
            <Lines label="Notas, uma por linha" value={draft.heroNotes} onChange={(value) => set("heroNotes", value)} />
            <Field label="Legenda da imagem" value={draft.heroBadge} onChange={(value) => set("heroBadge", value)} />
            <PhotoField label="Fotografia de entrada" value={draft.heroImage} onChange={(value) => set("heroImage", value)} />
            <Field label="Descrição da fotografia" value={draft.heroImageAlt} onChange={(value) => set("heroImageAlt", value)} />
          </>
        ) : null}
        {menu === "sobre" ? (
          <>
            <Field label="Pequeno texto por cima" value={draft.aboutKicker} onChange={(value) => set("aboutKicker", value)} />
            <Field label="Título" value={draft.aboutTitle} onChange={(value) => set("aboutTitle", value)} />
            <Field label="Primeiro texto" value={draft.aboutP1} onChange={(value) => set("aboutP1", value)} area />
            <Field label="Segundo texto" value={draft.aboutP2} onChange={(value) => set("aboutP2", value)} area />
            <PhotoField label="Fotografia" value={draft.aboutImage} onChange={(value) => set("aboutImage", value)} />
            <Field label="Descrição da fotografia" value={draft.aboutImageAlt} onChange={(value) => set("aboutImageAlt", value)} />
            <Field label="Legenda por baixo da fotografia" value={draft.aboutCaption} onChange={(value) => set("aboutCaption", value)} />
            <Field label="Missão" value={draft.mission} onChange={(value) => set("mission", value)} area />
            <Field label="Visão" value={draft.vision} onChange={(value) => set("vision", value)} area />
            <Field label="Valores" value={draft.values} onChange={(value) => set("values", value)} area />
            <OneOf labels={draft.steps.map((item, index) => item.title || `Passo ${index + 1}`)} index={open} onPick={setOpen} />
            {step ? (
              <fieldset className="grid gap-2 rounded-card border border-line bg-foam p-4">
                <legend className="px-1 text-sm text-muted">Passo {Math.min(open, draft.steps.length - 1) + 1}</legend>
                <Field
                  label="Título"
                  value={step.title}
                  onChange={(value) =>
                    set(
                      "steps",
                      draft.steps.map((item, itemIndex) => (itemIndex === open ? { ...item, title: value } : item)),
                    )
                  }
                />
                <Field
                  label="Texto"
                  value={step.text}
                  area
                  onChange={(value) =>
                    set(
                      "steps",
                      draft.steps.map((item, itemIndex) => (itemIndex === open ? { ...item, text: value } : item)),
                    )
                  }
                />
              </fieldset>
            ) : null}
          </>
        ) : null}
        {menu === "servicos" ? (
          <>
            <Field label="Pequeno texto por cima" value={draft.servicesKicker} onChange={(value) => set("servicesKicker", value)} />
            <Field label="Título" value={draft.servicesTitle} onChange={(value) => set("servicesTitle", value)} />
            <Field label="Introdução" value={draft.servicesIntro} onChange={(value) => set("servicesIntro", value)} area />
            <OneOf labels={draft.services.map((item, index) => item.title || `Serviço ${index + 1}`)} index={open} onPick={setOpen} />
            {service ? (
              <fieldset className="grid gap-2 rounded-card border border-line bg-foam p-4">
                <legend className="px-1 text-sm text-muted">Serviço {Math.min(open, draft.services.length - 1) + 1}</legend>
                <Field
                  label="Nome"
                  value={service.title}
                  onChange={(value) =>
                    set(
                      "services",
                      draft.services.map((item, itemIndex) => (itemIndex === open ? { ...item, title: value } : item)),
                    )
                  }
                />
                <Field
                  label="Texto"
                  value={service.summary}
                  area
                  onChange={(value) =>
                    set(
                      "services",
                      draft.services.map((item, itemIndex) => (itemIndex === open ? { ...item, summary: value } : item)),
                    )
                  }
                />
                <Lines
                  label="Benefícios, um por linha"
                  value={service.benefits}
                  onChange={(value) =>
                    set(
                      "services",
                      draft.services.map((item, itemIndex) => (itemIndex === open ? { ...item, benefits: value } : item)),
                    )
                  }
                />
                <PhotoField
                  label="Fotografia deste serviço"
                  value={service.image}
                  onChange={(value) =>
                    set(
                      "services",
                      draft.services.map((item, itemIndex) => (itemIndex === open ? { ...item, image: value } : item)),
                    )
                  }
                />
              </fieldset>
            ) : null}
          </>
        ) : null}
        {menu === "galeria" ? (
          <>
            <Field label="Pequeno texto por cima" value={draft.galleryKicker} onChange={(value) => set("galleryKicker", value)} />
            <Field label="Título na página inicial" value={draft.galleryTitle} onChange={(value) => set("galleryTitle", value)} />
            <Field label="Texto na página inicial" value={draft.galleryText} onChange={(value) => set("galleryText", value)} area />
            <Field label="Botão para a galeria" value={draft.galleryButton} onChange={(value) => set("galleryButton", value)} />
            <Field label="Título da página de trabalhos" value={draft.trabalhosTitle} onChange={(value) => set("trabalhosTitle", value)} />
            <Field label="Texto da página de trabalhos" value={draft.trabalhosText} onChange={(value) => set("trabalhosText", value)} area />
          </>
        ) : null}
        {menu === "testemunhos" ? (
          <>
            <Field label="Pequeno texto por cima" value={draft.testimonialsKicker} onChange={(value) => set("testimonialsKicker", value)} />
            <Field label="Título" value={draft.testimonialsTitle} onChange={(value) => set("testimonialsTitle", value)} />
            <Field label="Citação" value={draft.quote} onChange={(value) => set("quote", value)} area />
            <Field label="Quem disse" value={draft.quoteBy} onChange={(value) => set("quoteBy", value)} area />
            <Field label="Nota" value={draft.testimonialsNote} onChange={(value) => set("testimonialsNote", value)} area />
            <Field label="Título dos compromissos" value={draft.promisesTitle} onChange={(value) => set("promisesTitle", value)} />
            <Lines label="Compromissos, um por linha" value={draft.promises} onChange={(value) => set("promises", value)} />
          </>
        ) : null}
        {menu === "perguntas" ? (
          <>
            <Field label="Pequeno texto por cima" value={draft.faqKicker} onChange={(value) => set("faqKicker", value)} />
            <Field label="Título" value={draft.faqTitle} onChange={(value) => set("faqTitle", value)} />
            <Field label="Introdução" value={draft.faqIntro} onChange={(value) => set("faqIntro", value)} area />
            <OneOf labels={draft.faqs.map((item, index) => item.q || `Pergunta ${index + 1}`)} index={open} onPick={setOpen} />
            {faq ? (
              <fieldset className="grid gap-2 rounded-card border border-line bg-foam p-4">
                <legend className="px-1 text-sm text-muted">Pergunta {Math.min(open, draft.faqs.length - 1) + 1}</legend>
                <Field
                  label="Pergunta"
                  value={faq.q}
                  onChange={(value) =>
                    set(
                      "faqs",
                      draft.faqs.map((item, itemIndex) => (itemIndex === open ? { ...item, q: value } : item)),
                    )
                  }
                />
                <Field
                  label="Resposta"
                  value={faq.a}
                  area
                  onChange={(value) =>
                    set(
                      "faqs",
                      draft.faqs.map((item, itemIndex) => (itemIndex === open ? { ...item, a: value } : item)),
                    )
                  }
                />
              </fieldset>
            ) : null}
          </>
        ) : null}
        {menu === "contactos" ? (
          <>
            <Field label="Pequeno texto por cima" value={draft.contactKicker} onChange={(value) => set("contactKicker", value)} />
            <Field label="Título" value={draft.contactTitle} onChange={(value) => set("contactTitle", value)} />
            <Field label="Texto" value={draft.contactText} onChange={(value) => set("contactText", value)} area />
            <Field label="Título se ainda não houver morada" value={draft.visitTitle} onChange={(value) => set("visitTitle", value)} />
            <Field label="Texto se ainda não houver morada" value={draft.visitText} onChange={(value) => set("visitText", value)} area />
            <Field label="Telefone" value={draft.phone} onChange={(value) => set("phone", value)} />
            <Field label="Email" value={draft.email} onChange={(value) => set("email", value)} />
            <Field label="Morada" value={draft.address} onChange={(value) => set("address", value)} />
            <Field label="Zona de trabalho" value={draft.area} onChange={(value) => set("area", value)} />
            <Field label="Facebook" value={draft.facebook} onChange={(value) => set("facebook", value)} />
            <Field label="Instagram" value={draft.instagram} onChange={(value) => set("instagram", value)} />
            <Field label="Texto do rodapé" value={draft.footerText} onChange={(value) => set("footerText", value)} area />
          </>
        ) : null}
        <button type="submit" className="tap btn btn-ink w-fit" disabled={busy}>
          {busy ? "A guardar…" : "Guardar este menu"}
        </button>
      </section>
    </form>
  );
}

const menus = [
  { id: "inicio", label: "Início", hint: "O primeiro ecrã do site." },
  { id: "sobre", label: "Sobre nós", hint: "História, missão e os passos do trabalho." },
  { id: "servicos", label: "Serviços", hint: "Cada serviço e os benefícios." },
  { id: "galeria", label: "Galeria", hint: "Os textos da galeria, não as fotos." },
  { id: "testemunhos", label: "Testemunhos", hint: "A citação e os compromissos." },
  { id: "perguntas", label: "Perguntas", hint: "As perguntas frequentes." },
  { id: "contactos", label: "Contactos", hint: "Telefone, email, morada e redes." },
] as const;

function OneOf({ labels, index, onPick }: { labels: string[]; index: number; onPick: (index: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label, itemIndex) => (
        <button
          key={itemIndex}
          type="button"
          className={`tap max-w-64 truncate rounded-full border px-3 py-2 text-left text-sm ${itemIndex === index ? "border-ink bg-ink text-cream" : "border-line bg-cream"}`}
          onClick={() => onPick(itemIndex)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function PhotoField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-muted">{label}</span>
      {value ? <img src={value} alt="" className="aspect-[16/10] w-full max-w-sm rounded-card object-cover" /> : null}
      <input
        type="file"
        accept="image/*"
        className="text-sm"
        onChange={async (event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (!file) return;
          onChange(await shrink(file));
        }}
      />
    </label>
  );
}

function Lines({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) {
  const text = value.join("\n");
  return <Field label={label} value={text} area onChange={(next) => onChange(next.split("\n"))} />;
}

function Field({
  label,
  value,
  onChange,
  area,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  area?: boolean;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted">{label}</span>
      {area ? (
        <textarea
          value={value}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-card border border-line bg-cream px-3 py-2"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 rounded-card border border-line bg-cream px-3"
        />
      )}
    </label>
  );
}

async function shrink(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a foto.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}
