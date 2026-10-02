import { execFile } from "node:child_process";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { defaultCopy, defaultProjects, type SiteCopy } from "@/lib/content";
import type { GalleryProject } from "@/lib/gallery";

const exec = promisify(execFile);

const imageSchema = z.object({
  alt: z.string().trim().max(180).default(""),
  data: z
    .string()
    .max(2_000_000)
    .refine((value) => value.startsWith("data:image/jpeg;base64,"), "A foto tem de ser JPEG."),
});

const copySchema = z.object({
  heroKicker: z.string().trim().max(80),
  heroTitle: z.string().trim().min(2).max(160),
  heroText: z.string().trim().max(500),
  heroPrimary: z.string().trim().max(40),
  heroSecondary: z.string().trim().max(40),
  heroNotes: z.array(z.string().trim().max(80)).max(4),
  heroBadge: z.string().trim().max(80),
  aboutKicker: z.string().trim().max(40),
  aboutTitle: z.string().trim().max(160),
  aboutP1: z.string().trim().max(800),
  aboutP2: z.string().trim().max(500),
  mission: z.string().trim().max(400),
  vision: z.string().trim().max(400),
  values: z.string().trim().max(400),
  steps: z.array(z.object({ n: z.string().max(8), title: z.string().max(80), text: z.string().max(300) })).max(6),
  servicesKicker: z.string().trim().max(40),
  servicesTitle: z.string().trim().max(160),
  servicesIntro: z.string().trim().max(400),
  services: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(120),
        summary: z.string().trim().max(500),
        benefits: z.array(z.string().trim().max(160)).max(6),
      }),
    )
    .min(1)
    .max(8),
  testimonialsKicker: z.string().trim().max(40),
  testimonialsTitle: z.string().trim().max(160),
  quote: z.string().trim().max(200),
  quoteBy: z.string().trim().max(300),
  testimonialsNote: z.string().trim().max(500),
  promisesTitle: z.string().trim().max(160),
  promises: z.array(z.string().trim().max(160)).max(8),
  faqKicker: z.string().trim().max(40),
  faqTitle: z.string().trim().max(160),
  faqIntro: z.string().trim().max(300),
  faqs: z.array(z.object({ q: z.string().trim().min(2).max(200), a: z.string().trim().max(800) })).max(20),
  galleryKicker: z.string().trim().max(40),
  galleryTitle: z.string().trim().max(160),
  galleryText: z.string().trim().max(300),
  galleryButton: z.string().trim().max(40),
  trabalhosTitle: z.string().trim().max(160),
  trabalhosText: z.string().trim().max(300),
  contactKicker: z.string().trim().max(40),
  contactTitle: z.string().trim().max(160),
  contactText: z.string().trim().max(500),
  footerText: z.string().trim().max(200),
  phone: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(120),
  address: z.string().trim().max(180),
  facebook: z.string().trim().max(240),
  instagram: z.string().trim().max(240),
});

const initialPasswordHash =
  "e2093336b8ea9b4f5aac1bc4e9b23148:b9fbf143e615802e9b70fc199620f37832a0336c654b7aefdced47820bc1c381";

const filePath = "/workspace/data/content.json";
const tmpPath = "/tmp/dm-gallery.json";
const remoteContent = "https://raw.githubusercontent.com/MaddoxXPT14/dm-carpintaria/main/data/content.json";

type Store = {
  savedAt: number;
  nextId: number;
  passwordHash: string;
  copy: SiteCopy;
  projects: GalleryProject[];
};

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function passwordMatches(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function orderBy<T extends { id: number }>(items: T[], ids: number[]) {
  const map = new Map(items.map((item) => [item.id, item]));
  const next = ids.map((id) => map.get(id)).filter((item): item is T => Boolean(item));
  for (const item of items) {
    if (!ids.includes(item.id)) next.push(item);
  }
  return next;
}

function nextIdFrom(projects: GalleryProject[]) {
  return (
    projects.reduce((max, project) => {
      const photoMax = project.photos.reduce((current, photo) => Math.max(current, photo.id), 0);
      return Math.max(max, project.id, photoMax);
    }, 0) + 1
  );
}

function seed(): Store {
  const projects = defaultProjects();
  return {
    savedAt: 0,
    nextId: nextIdFrom(projects),
    passwordHash: initialPasswordHash,
    copy: defaultCopy,
    projects,
  };
}

function asStore(value: unknown): Store | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<Store>;
  if (!record.copy || !Array.isArray(record.projects) || !record.passwordHash) return null;
  return {
    savedAt: Number(record.savedAt) || 0,
    nextId: Number(record.nextId) || nextIdFrom(record.projects),
    passwordHash: record.passwordHash,
    copy: { ...defaultCopy, ...record.copy },
    projects: record.projects,
  };
}

let memory: Store | null = null;
let loadedAt = 0;

async function readJson(path: string) {
  try {
    return asStore(JSON.parse(await readFile(path, "utf8")));
  } catch {
    return null;
  }
}

async function loadStore() {
  if (memory && Date.now() - loadedAt < 5000) return memory;
  const local = (await readJson(tmpPath)) ?? (await readJson(filePath));
  let remote: Store | null = null;
  try {
    const response = await fetch(remoteContent, { cache: "no-store" });
    if (response.ok) remote = asStore(await response.json());
  } catch {
    remote = null;
  }
  const chosen = [memory, local, remote].filter((item): item is Store => Boolean(item)).sort((a, b) => b.savedAt - a.savedAt)[0];
  memory = chosen ?? seed();
  loadedAt = Date.now();
  return memory;
}

async function publish(store: Store) {
  store.savedAt = Date.now();
  memory = store;
  loadedAt = Date.now();
  const json = JSON.stringify(store);
  await mkdir("/tmp", { recursive: true }).catch(() => undefined);
  await writeFile(tmpPath, json).catch(() => undefined);
  try {
    await mkdir("/workspace/data", { recursive: true });
    await writeFile(filePath, JSON.stringify(store, null, 2));
  } catch {
    return false;
  }
  try {
    await exec("git", ["add", "data/content.json"], { cwd: "/workspace" });
    const status = await exec("git", ["diff", "--cached", "--name-only"], { cwd: "/workspace" });
    if (!status.stdout.includes("data/content.json")) return true;
    await exec("git", ["commit", "-m", "Atualiza os textos do site"], { cwd: "/workspace" });
    await exec("git", ["push", "origin", "main"], { cwd: "/workspace" });
    return true;
  } catch {
    return false;
  }
}

async function requirePassword(password: string) {
  const store = await loadStore();
  if (!passwordMatches(password, store.passwordHash)) {
    throw new Error("Palavra-passe incorreta.");
  }
  return store;
}

export const getContent = createServerFn({ method: "GET" }).handler(async () => {
  const store = await loadStore();
  return { copy: store.copy, projects: store.projects.filter((project) => !project.hidden) };
});

export const listGallery = createServerFn({ method: "GET" }).handler(async () => {
  const store = await loadStore();
  return store.projects.filter((project) => !project.hidden);
});

export const listManagedGallery = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const store = await requirePassword(data.password);
    return store.projects;
  });

export const checkGalleryPassword = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    await requirePassword(data.password);
    return { ok: true };
  });

export const changeGalleryPassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      password: z.string().min(1),
      next: z.string().trim().min(8, "A nova palavra-passe precisa de pelo menos 8 caracteres.").max(80),
    }),
  )
  .handler(async ({ data }) => {
    const store = await requirePassword(data.password);
    store.passwordHash = hashPassword(data.next);
    await publish(store);
    return { ok: true };
  });

export const updateSiteCopy = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), copy: copySchema }))
  .handler(async ({ data }) => {
    const store = await requirePassword(data.password);
    store.copy = data.copy;
    const published = await publish(store);
    return { published };
  });

export const updateGalleryProject = createServerFn({ method: "POST" })
  .validator(
    z.object({
      password: z.string().min(1),
      id: z.number().int().positive(),
      title: z.string().trim().min(2).max(120),
      tag: z.string().trim().max(40),
      body: z.string().trim().max(500),
      captions: z.array(z.object({ id: z.number().int().positive(), alt: z.string().trim().max(180) })).max(40).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const store = await requirePassword(data.password);
    const project = store.projects.find((item) => item.id === data.id);
    if (!project) throw new Error("Esse trabalho já não está na galeria.");
    project.title = data.title;
    project.tag = data.tag;
    project.body = data.body;
    for (const caption of data.captions ?? []) {
      const photo = project.photos.find((item) => item.id === caption.id);
      if (photo) photo.alt = caption.alt || project.title;
    }
    const published = await publish(store);
    return { published };
  });

export const arrangeGallery = createServerFn({ method: "POST" })
  .validator(
    z.object({
      password: z.string().min(1),
      projectId: z.number().int().positive().optional(),
      ids: z.array(z.number().int().positive()).min(1).max(80),
    }),
  )
  .handler(async ({ data }) => {
    const store = await requirePassword(data.password);
    if (data.projectId) {
      const project = store.projects.find((item) => item.id === data.projectId);
      if (!project) throw new Error("Esse trabalho já não está na galeria.");
      project.photos = orderBy(project.photos, data.ids);
    } else {
      store.projects = orderBy(store.projects, data.ids);
    }
    const published = await publish(store);
    return { published };
  });

export const setProjectHidden = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive(), hidden: z.boolean() }))
  .handler(async ({ data }) => {
    const store = await requirePassword(data.password);
    const project = store.projects.find((item) => item.id === data.id);
    if (!project) throw new Error("Esse trabalho já não está na galeria.");
    project.hidden = data.hidden;
    const published = await publish(store);
    return { published };
  });

export const addProjectPhotos = createServerFn({ method: "POST" })
  .validator(
    z.object({
      password: z.string().min(1),
      id: z.number().int().positive(),
      images: z.array(imageSchema).min(1).max(12),
    }),
  )
  .handler(async ({ data }) => {
    const store = await requirePassword(data.password);
    const project = store.projects.find((item) => item.id === data.id);
    if (!project) throw new Error("Esse trabalho já não está na galeria.");
    for (const image of data.images) {
      const photoId = store.nextId;
      store.nextId += 1;
      project.photos.push({ id: photoId, alt: image.alt || project.title, src: image.data });
    }
    const published = await publish(store);
    return { published };
  });

export const addGalleryProject = createServerFn({ method: "POST" })
  .validator(
    z.object({
      password: z.string().min(1),
      title: z.string().trim().min(2, "Indique o nome do trabalho.").max(120),
      tag: z.string().trim().max(40).default(""),
      body: z.string().trim().max(500).default(""),
      images: z.array(imageSchema).min(1, "Junte pelo menos uma foto.").max(12),
    }),
  )
  .handler(async ({ data }) => {
    const store = await requirePassword(data.password);
    const id = store.nextId;
    store.nextId += 1;
    store.projects.unshift({
      id,
      title: data.title,
      tag: data.tag,
      body: data.body,
      photos: data.images.map((image) => {
        const photoId = store.nextId;
        store.nextId += 1;
        return { id: photoId, alt: image.alt || data.title, src: image.data };
      }),
    });
    const published = await publish(store);
    return { id, published };
  });

export const deleteGalleryProject = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const store = await requirePassword(data.password);
    store.projects = store.projects.filter((project) => project.id !== data.id);
    const published = await publish(store);
    return { ok: true, published };
  });

export const deleteGalleryPhoto = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const store = await requirePassword(data.password);
    store.projects = store.projects.map((project) => ({
      ...project,
      photos: project.photos.filter((photo) => photo.id !== data.id),
    }));
    const published = await publish(store);
    return { ok: true, published };
  });
