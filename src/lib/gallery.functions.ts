import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { works } from "@/lib/site";
import type { GalleryProject } from "@/lib/gallery";

const imageSchema = z.object({
  alt: z.string().trim().max(180).default(""),
  data: z
    .string()
    .max(2_000_000)
    .refine((value) => value.startsWith("data:image/jpeg;base64,"), "A foto tem de ser JPEG."),
});

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

async function requirePassword(password: string) {
  const sql = await getSql();
  const rows = await sql<{ password_hash: string }>`select password_hash from gallery_lock where id = 1`;
  const stored = rows[0]?.password_hash;
  if (!stored || !passwordMatches(password, stored)) {
    throw new Error("Palavra-passe incorreta.");
  }
}

async function ensureSeeded() {
  const sql = await getSql();
  const meta = await sql<{ seeded: boolean }>`select seeded from gallery_meta where id = 1`;
  if (meta[0]?.seeded) return;
  const existing = await sql<{ n: number }>`select count(*)::int as n from gallery_projects`;
  if ((existing[0]?.n ?? 0) === 0) {
    for (let index = 0; index < works.length; index += 1) {
      const work = works[index];
      const rows = await sql<{ id: number }>`
        insert into gallery_projects (title, tag, body, position)
        values (${work.title}, ${work.tag}, ${work.text}, ${index})
        returning id
      `;
      const projectId = rows[0]?.id;
      if (!projectId) continue;
      for (let photo = 0; photo < work.images.length; photo += 1) {
        const image = work.images[photo];
        await sql`
          insert into gallery_photos (project_id, alt, src, position)
          values (${projectId}, ${image.alt}, ${image.src}, ${photo})
        `;
      }
    }
  }
  await sql`
    insert into gallery_meta (id, seeded) values (1, true)
    on conflict (id) do update set seeded = true
  `;
}

function mapProjects(
  projects: { id: number; title: string; tag: string; body: string }[],
  photos: { id: number; project_id: number; alt: string; src: string; has_data: boolean }[],
): GalleryProject[] {
  return projects.map((project) => ({
    id: project.id,
    title: project.title,
    tag: project.tag,
    body: project.body,
    photos: photos
      .filter((photo) => photo.project_id === project.id)
      .map((photo) => ({
        id: photo.id,
        alt: photo.alt || project.title,
        src: photo.has_data ? `/api/gallery/${photo.id}` : photo.src,
      })),
  }));
}

export const listGallery = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();
  const sql = await getSql();
  const projects = await sql<{ id: number; title: string; tag: string; body: string }>`
    select id, title, tag, body from gallery_projects order by position, id
  `;
  const photos = await sql<{ id: number; project_id: number; alt: string; src: string; has_data: boolean }>`
    select id, project_id, alt, src, (data is not null) as has_data
    from gallery_photos
    order by position, id
  `;
  return mapProjects(projects, photos);
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
    await requirePassword(data.password);
    const sql = await getSql();
    await sql`update gallery_lock set password_hash = ${hashPassword(data.next)} where id = 1`;
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
    await requirePassword(data.password);
    const sql = await getSql();
    const positionRows = await sql<{ n: number }>`select coalesce(max(position), -1)::int as n from gallery_projects`;
    const position = (positionRows[0]?.n ?? -1) + 1;
    const rows = await sql<{ id: number }>`
      insert into gallery_projects (title, tag, body, position)
      values (${data.title}, ${data.tag}, ${data.body}, ${position})
      returning id
    `;
    const projectId = rows[0]?.id;
    if (!projectId) throw new Error("Não foi possível guardar o trabalho.");
    for (let index = 0; index < data.images.length; index += 1) {
      const image = data.images[index];
      await sql`
        insert into gallery_photos (project_id, alt, src, data, position)
        values (${projectId}, ${image.alt || data.title}, ${""}, ${image.data}, ${index})
      `;
    }
    return { id: projectId };
  });

export const deleteGalleryProject = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await requirePassword(data.password);
    const sql = await getSql();
    await sql`delete from gallery_projects where id = ${data.id}`;
    return { ok: true };
  });

export const deleteGalleryPhoto = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    await requirePassword(data.password);
    const sql = await getSql();
    await sql`delete from gallery_photos where id = ${data.id}`;
    return { ok: true };
  });
