import { useEffect, useState, type DragEvent, type FormEvent } from "react";
import {
  addGalleryProject,
  addProjectPhotos,
  arrangeGallery,
  deleteGalleryPhoto,
  deleteGalleryProject,
  listManagedGallery,
  setProjectHidden,
  updateGalleryProject,
} from "@/lib/gallery.functions";
import type { GalleryProject } from "@/lib/gallery";

export function WorksManager({
  password,
  onSaved,
}: {
  password: string;
  onSaved: (published: boolean) => void;
}) {
  const [projects, setProjects] = useState<GalleryProject[]>([]);
  const [selected, setSelected] = useState<number | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh(keep?: number | "new" | null) {
    const next = await listManagedGallery({ data: { password } });
    setProjects(next);
    setSelected((current) => {
      const choice = keep === undefined ? current : keep;
      if (choice === "new") return "new";
      if (typeof choice === "number" && next.some((item) => item.id === choice)) return choice;
      return next[0]?.id ?? null;
    });
  }

  useEffect(() => {
    refresh().catch((caught) => setError(caught instanceof Error ? caught.message : "Não foi possível abrir os trabalhos."));
    // The password is the session key. Reload when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const visible = projects.filter((project) => !project.hidden).length;
  const filtered = projects.filter((project) => {
    const haystack = `${project.title} ${project.tag} ${project.body}`.toLocaleLowerCase("pt");
    return haystack.includes(query.trim().toLocaleLowerCase("pt"));
  });
  const current = typeof selected === "number" ? projects.find((project) => project.id === selected) : null;

  async function run(action: () => Promise<{ published?: boolean; ok?: boolean } | void>, keep?: number | "new" | null) {
    setBusy(true);
    setError("");
    try {
      const result = await action();
      if (result && "published" in result && typeof result.published === "boolean") onSaved(result.published);
      await refresh(keep);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível guardar.");
    } finally {
      setBusy(false);
    }
  }

  async function moveProject(id: number, direction: number) {
    const index = projects.findIndex((project) => project.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= projects.length) return;
    const ids = projects.map((project) => project.id);
    const [item] = ids.splice(index, 1);
    ids.splice(next, 0, item);
    await run(() => arrangeGallery({ data: { password, ids } }), id);
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="grid content-start gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {visible} no site{projects.length - visible > 0 ? ` · ${projects.length - visible} ocultos` : ""}
          </p>
          <button type="button" className="tap text-sm font-medium text-oak-deep" onClick={() => setSelected("new")}>
            Novo
          </button>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Procurar"
          className="h-11 rounded-card border border-line bg-cream px-3"
        />
        <div className="grid gap-2">
          {filtered.map((project) => {
            const cover = project.photos[0];
            const index = projects.findIndex((item) => item.id === project.id);
            return (
              <div
                key={project.id}
                className={`flex gap-2 rounded-card border p-2 ${selected === project.id ? "border-ink bg-foam" : "border-line bg-cream"}`}
              >
                <button type="button" className="tap flex min-w-0 flex-1 gap-2 text-left" onClick={() => setSelected(project.id)}>
                  {cover ? (
                    <img src={cover.src} alt="" className="size-14 shrink-0 rounded-card object-cover" />
                  ) : (
                    <span className="grid size-14 shrink-0 place-items-center rounded-card bg-line text-xs text-muted">Sem foto</span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{project.title}</span>
                    <span className="block truncate text-xs text-muted">
                      {project.hidden ? "Oculto · " : ""}
                      {project.tag || "Sem divisão"} · {project.photos.length} fotos
                    </span>
                  </span>
                </button>
                <span className="grid gap-1">
                  <button type="button" className="tap text-xs" disabled={busy || index === 0} onClick={() => moveProject(project.id, -1)} aria-label="Subir">
                    ↑
                  </button>
                  <button
                    type="button"
                    className="tap text-xs"
                    disabled={busy || index === projects.length - 1}
                    onClick={() => moveProject(project.id, 1)}
                    aria-label="Descer"
                  >
                    ↓
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      </aside>
      <div>
        {error ? <p className="mb-4 text-sm text-oak-deep">{error}</p> : null}
        {selected === "new" ? (
          <NewWork
            busy={busy}
            onCancel={() => setSelected(projects[0]?.id ?? null)}
            onCreate={async (input) => {
              setBusy(true);
              setError("");
              try {
                const result = await addGalleryProject({ data: { password, ...input } });
                onSaved(result.published);
                await refresh(result.id);
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : "Não foi possível guardar.");
              } finally {
                setBusy(false);
              }
            }}
          />
        ) : current ? (
          <WorkEditor
            key={current.id}
            project={current}
            busy={busy}
            onSave={(input) => run(() => updateGalleryProject({ data: { password, id: current.id, ...input } }), current.id)}
            onPhotos={(images) => run(() => addProjectPhotos({ data: { password, id: current.id, images } }), current.id)}
            onRemovePhoto={(photoId) => run(() => deleteGalleryPhoto({ data: { password, id: photoId } }), current.id)}
            onArrange={(ids) => run(() => arrangeGallery({ data: { password, projectId: current.id, ids } }), current.id)}
            onHide={(hidden) => run(() => setProjectHidden({ data: { password, id: current.id, hidden } }), current.id)}
            onDelete={() => {
              if (!confirm("Retirar este trabalho da galeria?")) return;
              run(() => deleteGalleryProject({ data: { password, id: current.id } }));
            }}
          />
        ) : (
          <p className="text-muted">Ainda não há trabalhos.</p>
        )}
      </div>
    </div>
  );
}

function NewWork({
  busy,
  onCancel,
  onCreate,
}: {
  busy: boolean;
  onCancel: () => void;
  onCreate: (input: { title: string; tag: string; body: string; images: { alt: string; data: string }[] }) => void;
}) {
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const files = Array.from(form.elements)
      .filter((element): element is HTMLInputElement => element instanceof HTMLInputElement && element.type === "file")
      .flatMap((element) => Array.from(element.files ?? []));
    if (files.length === 0) return;
    setSending(true);
    const data = new FormData(form);
    const title = String(data.get("title") ?? "");
    const tag = String(data.get("tag") ?? "");
    const body = String(data.get("body") ?? "");
    const images = [];
    for (const file of files.slice(0, 12)) images.push({ alt: title, data: await shrink(file) });
    form.reset();
    onCreate({ title, tag, body, images });
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-card border border-line bg-foam p-5">
      <h2 className="font-display text-2xl">Novo trabalho</h2>
      <input name="title" required minLength={2} placeholder="Nome" className="h-12 rounded-card border border-line bg-cream px-3" />
      <input name="tag" placeholder="Sala, cozinha, quarto…" className="h-12 rounded-card border border-line bg-cream px-3" />
      <textarea name="body" rows={4} placeholder="Texto que aparece por baixo das fotos" className="rounded-card border border-line bg-cream px-3 py-2" />
      <input name="photos" type="file" accept="image/*" multiple required className="text-sm" />
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="tap btn btn-ink" disabled={busy || sending}>
          {busy ? "A guardar…" : "Publicar trabalho"}
        </button>
        <button type="button" className="tap btn btn-line" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function WorkEditor({
  project,
  busy,
  onSave,
  onPhotos,
  onRemovePhoto,
  onArrange,
  onHide,
  onDelete,
}: {
  project: GalleryProject;
  busy: boolean;
  onSave: (input: { title: string; tag: string; body: string; captions: { id: number; alt: string }[] }) => void;
  onPhotos: (images: { alt: string; data: string }[]) => void;
  onRemovePhoto: (id: number) => void;
  onArrange: (ids: number[]) => void;
  onHide: (hidden: boolean) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(project.title);
  const [tag, setTag] = useState(project.tag);
  const [body, setBody] = useState(project.body);
  const [photos, setPhotos] = useState(project.photos);
  const [fileKey, setFileKey] = useState(0);
  const [captions, setCaptions] = useState<Record<number, string>>(() =>
    Object.fromEntries(project.photos.map((photo) => [photo.id, photo.alt])),
  );
  const order = project.photos.map((photo) => photo.id).join(",");

  useEffect(() => {
    setPhotos(project.photos);
    setCaptions((current) => {
      const next = { ...current };
      for (const photo of project.photos) {
        if (next[photo.id] == null) next[photo.id] = photo.alt;
      }
      return next;
    });
  }, [order]);

  function commitOrder(next: typeof photos) {
    setPhotos(next);
    onArrange(next.map((photo) => photo.id));
  }

  function movePhoto(index: number, direction: number) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= photos.length) return;
    const next = photos.slice();
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    commitOrder(next);
  }

  function dropPhoto(event: DragEvent<HTMLElement>, targetId: number) {
    event.preventDefault();
    const sourceId = Number(event.dataTransfer.getData("text/plain"));
    if (!sourceId || sourceId === targetId) return;
    const from = photos.findIndex((photo) => photo.id === sourceId);
    const to = photos.findIndex((photo) => photo.id === targetId);
    if (from < 0 || to < 0) return;
    const next = photos.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    commitOrder(next);
  }

  async function addPhotos(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const files = Array.from(form.elements)
      .filter((element): element is HTMLInputElement => element instanceof HTMLInputElement && element.type === "file")
      .flatMap((element) => Array.from(element.files ?? []));
    if (files.length === 0) return;
    const images = [];
    for (const file of files.slice(0, 12)) images.push({ alt: title, data: await shrink(file) });
    form.reset();
    setFileKey((current) => current + 1);
    onPhotos(images);
  }

  const cover = project.photos[0];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl">{project.title}</h2>
        <button type="button" className="tap btn btn-line" disabled={busy} onClick={() => onHide(!project.hidden)}>
          {project.hidden ? "Mostrar no site" : "Ocultar do site"}
        </button>
      </div>
      <form
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            title,
            tag,
            body,
            captions: photos.map((photo) => ({ id: photo.id, alt: captions[photo.id] ?? photo.alt })),
          });
        }}
      >
        <input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={2} className="h-12 rounded-card border border-line bg-cream px-3" />
        <input value={tag} onChange={(event) => setTag(event.target.value)} placeholder="Divisão" className="h-12 rounded-card border border-line bg-cream px-3" />
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} className="rounded-card border border-line bg-cream px-3 py-2" />
        <button type="submit" className="tap btn btn-ink w-fit" disabled={busy}>
          {busy ? "A guardar…" : "Guardar texto e legendas"}
        </button>
      </form>
      <p className="text-sm text-muted">Arrasta as fotos, ou usa as setas, para mudar a ordem. A primeira é a capa.</p>
      <div className="grid gap-3">
        {photos.map((photo, index) => (
          <article
            key={photo.id}
            draggable
            onDragStart={(event) => event.dataTransfer.setData("text/plain", String(photo.id))}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => dropPhoto(event, photo.id)}
            className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-card border border-line bg-foam p-3 sm:grid-cols-[140px_minmax(0,1fr)]"
          >
            <img src={photo.src} alt={captions[photo.id] || photo.alt} className="aspect-[4/3] w-full rounded-card object-cover" />
            <div className="grid content-start gap-2">
              <p className="text-xs uppercase tracking-widest text-muted">{index === 0 ? `1 · Capa` : String(index + 1)}</p>
              <input
                value={captions[photo.id] ?? ""}
                onChange={(event) => setCaptions((current) => ({ ...current, [photo.id]: event.target.value }))}
                placeholder="Legenda"
                className="h-10 rounded-card border border-line bg-cream px-3 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <button type="button" className="tap btn btn-line" disabled={busy || index === 0} onClick={() => movePhoto(index, -1)}>
                  Subir
                </button>
                <button type="button" className="tap btn btn-line" disabled={busy || index === photos.length - 1} onClick={() => movePhoto(index, 1)}>
                  Descer
                </button>
                <button type="button" className="tap text-sm text-oak-deep" disabled={busy} onClick={() => onRemovePhoto(photo.id)}>
                  Tirar
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <form onSubmit={addPhotos} className="flex flex-wrap items-center gap-3">
        <input key={fileKey} name="photos" type="file" accept="image/*" multiple className="text-sm" />
        <button type="submit" className="tap btn btn-line" disabled={busy}>
          Juntar fotos
        </button>
      </form>
      {cover ? (
        <div className="overflow-hidden rounded-card border border-line">
          <img src={cover.src} alt="" className="aspect-[16/7] w-full object-cover" />
          <div className="p-4">
            {tag ? <p className="kicker">{tag}</p> : null}
            <p className="font-display text-2xl">{title || project.title}</p>
            {body ? <p className="mt-1 text-sm text-muted">{body}</p> : null}
          </div>
        </div>
      ) : null}
      <button type="button" className="tap w-fit text-sm text-oak-deep" disabled={busy} onClick={onDelete}>
        Retirar este trabalho
      </button>
    </div>
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
