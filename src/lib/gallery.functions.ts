import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { works } from "@/lib/site";
import type { GalleryProject } from "@/lib/gallery";

const imageSchema = z.object({
  alt: z.string().trim().max(180).default(""),
  data: z
    .string()
    .max(2_000_000)
    .refine((value) => value.startsWith("data:image/jpeg;base64,"), "A foto tem de ser JPEG."),
});

const initialPasswordHash =
  "e2093336b8ea9b4f5aac1bc4e9b23148:b9fbf143e615802e9b70fc199620f37832a0336c654b7aefdced47820bc1c381";

const storePath = "/tmp/dm-gallery.json";

type Store = {
  nextId: number;
  passwordHash: string;
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

function seed(): Store {
  let nextId = 1;
  const projects = works.map((work) => {
    const id = nextId;
    nextId += 1;
    return {
      id,
      title: work.title,
      tag: work.tag,
      body: work.text,
      photos: work.images.map((image) => {
        const photoId = nextId;
        nextId += 1;
        return { id: photoId, alt: image.alt, src: image.src };
      }),
    };
  });
  return { nextId, passwordHash: initialPasswordHash, projects };
}

let memory: Store | null = null;

async function loadStore() {
  if (memory) return memory;
  try {
    memory = JSON.parse(await readFile(storePath, "utf8")) as Store;
    if (!memory.projects || !memory.passwordHash) memory = seed();
  } catch {
    memory = seed();
  }
  return memory;
}

async function saveStore(next: Store) {
  memory = next;
  try {
    await mkdir("/tmp", { recursive: true });
    await writeFile(storePath, JSON.stringify(next));
  } catch {
    // The preview keeps the copy in memory when the disk is read-only.
  }
}

async function requirePassword(password: string) {
  const store = await loadStore();
  if (!passwordMatches(password, store.passwordHash)) {
    throw new Error("Palavra-passe incorreta.");
  }
}

export const listGallery = createServerFn({ method: "GET" }).handler(async () => {
  const store = await loadStore();
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
    const store = await loadStore();
    await requirePassword(data.password);
    store.passwordHash = hashPassword(data.next);
    await saveStore(store);
    return { ok: true };
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
    const store = await loadStore();
    await requirePassword(data.password);
    const id = store.nextId;
    store.nextId += 1;
    const photos = data.images.map((image) => {
      const photoId = store.nextId;
      store.nextId += 1;
      return { id: photoId, alt: image.alt || data.title, src: image.data };
    });
    store.projects.unshift({
      id,
      title: data.title,
      tag: data.tag,
      body: data.body,
      photos,
    });
    await saveStore(store);
    return { id };
  });

export const deleteGalleryProject = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const store = await loadStore();
    await requirePassword(data.password);
    store.projects = store.projects.filter((project) => project.id !== data.id);
    await saveStore(store);
    return { ok: true };
  });

export const deleteGalleryPhoto = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const store = await loadStore();
    await requirePassword(data.password);
    store.projects = store.projects.map((project) => ({
      ...project,
      photos: project.photos.filter((photo) => photo.id !== data.id),
    }));
    await saveStore(store);
    return { ok: true };
  });
