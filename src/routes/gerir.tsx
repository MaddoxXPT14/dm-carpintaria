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
    setNotice(published ? "Guardado. O site público atualiza dentro de um minuto." : "Guardado.");
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
      <section className="mx-auto w-full max-w-3xl px-5 py-12">
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
      const result = await updateSiteCopy({ data: { password, copy: draft } });
      onSaved(result.published);
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Não foi possível guardar.");
    } finally {
      onBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-8 grid gap-4">
      <Field label="Título principal" value={draft.heroTitle} onChange={(value) => set("heroTitle", value)} />
      <Field label="Texto principal" value={draft.heroText} onChange={(value) => set("heroText", value)} area />
      <Field label="Sobre — título" value={draft.aboutTitle} onChange={(value) => set("aboutTitle", value)} />
      <Field label="Sobre — texto" value={draft.aboutP1} onChange={(value) => set("aboutP1", value)} area />
      <Field label="Sobre — segundo texto" value={draft.aboutP2} onChange={(value) => set("aboutP2", value)} area />
      <Field label="Missão" value={draft.mission} onChange={(value) => set("mission", value)} area />
      <Field label="Visão" value={draft.vision} onChange={(value) => set("vision", value)} area />
      <Field label="Valores" value={draft.values} onChange={(value) => set("values", value)} area />
      {draft.services.map((service, index) => (
        <fieldset key={service.title} className="grid gap-2 rounded-card border border-line bg-foam p-4">
          <legend className="px-1 text-sm text-muted">Serviço {index + 1}</legend>
          <Field
            label="Nome"
            value={service.title}
            onChange={(value) =>
              set(
                "services",
                draft.services.map((item, itemIndex) => (itemIndex === index ? { ...item, title: value } : item)),
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
                draft.services.map((item, itemIndex) => (itemIndex === index ? { ...item, summary: value } : item)),
              )
            }
          />
        </fieldset>
      ))}
      {draft.faqs.map((item, index) => (
        <fieldset key={`${item.q}-${index}`} className="grid gap-2 rounded-card border border-line bg-foam p-4">
          <legend className="px-1 text-sm text-muted">Pergunta {index + 1}</legend>
          <Field
            label="Pergunta"
            value={item.q}
            onChange={(value) =>
              set(
                "faqs",
                draft.faqs.map((faq, faqIndex) => (faqIndex === index ? { ...faq, q: value } : faq)),
              )
            }
          />
          <Field
            label="Resposta"
            value={item.a}
            area
            onChange={(value) =>
              set(
                "faqs",
                draft.faqs.map((faq, faqIndex) => (faqIndex === index ? { ...faq, a: value } : faq)),
              )
            }
          />
        </fieldset>
      ))}
      <Field label="Citação" value={draft.quote} onChange={(value) => set("quote", value)} />
      <Field label="Autor da citação" value={draft.quoteBy} onChange={(value) => set("quoteBy", value)} area />
      <Field label="Telefone" value={draft.phone} onChange={(value) => set("phone", value)} />
      <Field label="Email" value={draft.email} onChange={(value) => set("email", value)} />
      <Field label="Morada" value={draft.address} onChange={(value) => set("address", value)} />
      <Field label="Instagram" value={draft.instagram} onChange={(value) => set("instagram", value)} />
      <button type="submit" className="tap btn btn-ink" disabled={busy}>
        {busy ? "A guardar…" : "Guardar textos"}
      </button>
    </form>
  );
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
