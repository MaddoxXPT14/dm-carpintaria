import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  addGalleryProject,
  changeGalleryPassword,
  checkGalleryPassword,
  deleteGalleryPhoto,
  deleteGalleryProject,
  listGallery,
} from "@/lib/gallery.functions";
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
  const [busy, setBusy] = useState(false);

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
        <form onSubmit={add} className="mt-8 grid gap-4 rounded-card border border-line bg-foam p-5">
          <h2 className="font-display text-2xl">Novo trabalho</h2>
          <input name="title" required minLength={2} placeholder="Nome" className="h-12 rounded-card border border-line bg-cream px-3" />
          <input name="tag" placeholder="Sala, cozinha, quarto…" className="h-12 rounded-card border border-line bg-cream px-3" />
          <textarea name="body" rows={3} placeholder="Texto" className="rounded-card border border-line bg-cream px-3 py-2" />
          <input name="photos" type="file" accept="image/*" multiple required className="text-sm" />
          {error ? <p className="text-sm text-oak-deep">{error}</p> : null}
          <button type="submit" className="tap btn btn-ink" disabled={busy}>
            {busy ? "A guardar…" : "Publicar trabalho"}
          </button>
        </form>
        <div className="mt-8 grid gap-4">
          {projects.map((project) => (
            <article key={project.id} className="rounded-card border border-line bg-foam p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {project.tag ? <p className="kicker">{project.tag}</p> : null}
                  <h2 className="font-display text-2xl">{project.title}</h2>
                </div>
                <button type="button" className="tap btn btn-line" onClick={() => removeProject(project.id)}>
                  Retirar
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {project.photos.map((photo) => (
                  <div key={photo.id}>
                    <img src={photo.src} alt={photo.alt} className="aspect-[4/3] w-full rounded-card object-cover" />
                    <button type="button" className="tap mt-1 text-xs font-medium text-oak-deep" onClick={() => removePhoto(photo.id)}>
                      Tirar foto
                    </button>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
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
