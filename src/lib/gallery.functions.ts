import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { defaultCopy, defaultProjects, type SiteCopy } from "@/lib/content";
import type { GalleryProject } from "@/lib/gallery";
import type { Sql } from "@/lib/db";

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
  heroImage: z.string().max(2_000_000),
  heroImageAlt: z.string().trim().max(180),
  aboutKicker: z.string().trim().max(40),
  aboutTitle: z.string().trim().max(160),
  aboutP1: z.string().trim().max(800),
  aboutP2: z.string().trim().max(500),
  aboutImage: z.string().max(2_000_000),
  aboutImageAlt: z.string().trim().max(180),
  aboutCaption: z.string().trim().max(180),
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
        image: z.string().max(2_000_000).default(""),
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
  visitTitle: z.string().trim().max(80),
  visitText: z.string().trim().max(300),
  footerText: z.string().trim().max(200),
  phone: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(120),
  address: z.string().trim().max(180),
  area: z.string().trim().max(80),
  facebook: z.string().trim().max(240),
  instagram: z.string().trim().max(240),
});

const projectSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1).max(120),
  tag: z.string().trim().max(40),
  body: z.string().trim().max(500),
  hidden: z.boolean().optional(),
  photos: z
    .array(
      z.object({
        id: z.number().int().positive(),
        alt: z.string().max(180),
        src: z.string().min(1).max(2_000_000),
      }),
    )
    .max(40),
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

type PhotoRow = {
  id: number;
  title: string;
  tag: string;
  body: string;
  hidden: boolean;
  photo_id: number | null;
  alt: string | null;
  src: string | null;
};

let ready: Promise<void> | null = null;

async function db() {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  ready ??= ensureReady(sql).catch((error) => {
    ready = null;
    throw error;
  });
  await ready;
  return sql;
}

async function ensureReady(sql: Sql) {
  const count = await sql<{ n: number }>`select count(*)::int as n from gallery_projects`;
  if ((count[0]?.n ?? 0) === 0) {
    let position = 0;
    for (const project of defaultProjects()) {
      const inserted = await sql<{ id: number }>`
        insert into gallery_projects (title, tag, body, hidden, position)
        values (${project.title}, ${project.tag}, ${project.body}, false, ${position})
        returning id
      `;
      const projectId = inserted[0]?.id;
      if (!projectId) continue;
      for (let index = 0; index < project.photos.length; index += 1) {
        const photo = project.photos[index];
        await sql`
          insert into gallery_photos (project_id, alt, src, position)
          values (${projectId}, ${photo.alt}, ${photo.src}, ${index})
        `;
      }
      position += 1;
    }
  }
  const copy = await sql<{ id: number }>`select id from site_copy where id = 1`;
  if (copy.length === 0) {
    await sql`
      insert into site_copy (id, copy)
      values (1, ${JSON.stringify(defaultCopy)}::jsonb)
    `;
  }
  await sql`
    insert into gallery_meta (id, seeded)
    values (1, true)
    on conflict (id) do update set seeded = true
  `;
  const categories = await sql<{ n: number }>`select count(*)::int as n from gallery_categories`;
  if ((categories[0]?.n ?? 0) === 0) {
    const tags = await sql<{ tag: string }>`
      select distinct btrim(tag) as tag
      from gallery_projects
      where btrim(tag) <> ''
      order by 1
    `;
    for (let index = 0; index < tags.length; index += 1) {
      await sql`
        insert into gallery_categories (name, position)
        values (${tags[index]?.tag ?? ""}, ${index})
        on conflict do nothing
      `;
    }
  }
}

async function touch(sql: Sql) {
  await sql`update gallery_meta set updated_at = now() where id = 1`;
}

function asCopy(value: unknown): SiteCopy {
  const stored = typeof value === "string" ? JSON.parse(value) : value;
  if (!stored || typeof stored !== "object") return defaultCopy;
  const merged = { ...defaultCopy, ...(stored as SiteCopy) };
  const services = Array.isArray(merged.services) ? merged.services : defaultCopy.services;
  merged.services = services.map((service, index) => ({
    title: service.title,
    summary: service.summary,
    benefits: service.benefits ?? [],
    image: service.image || defaultCopy.services[index]?.image || "",
  }));
  if (!merged.heroImage) merged.heroImage = defaultCopy.heroImage;
  if (!merged.aboutImage) merged.aboutImage = defaultCopy.aboutImage;
  if (!merged.aboutCaption) merged.aboutCaption = defaultCopy.aboutCaption;
  if (!merged.visitTitle) merged.visitTitle = defaultCopy.visitTitle;
  if (!merged.visitText) merged.visitText = defaultCopy.visitText;
  if (!merged.area) merged.area = defaultCopy.area;
  return merged;
}

async function readCopy(sql: Sql) {
  const rows = await sql<{ copy: unknown }>`select copy from site_copy where id = 1`;
  return asCopy(rows[0]?.copy);
}

async function readProjects(sql: Sql, includeHidden: boolean) {
  const rows = await sql<PhotoRow>`
    select p.id, p.title, p.tag, p.body, p.hidden,
           ph.id as photo_id, ph.alt,
           case
             when ph.data is not null and ph.data <> '' then '/api/gallery/' || ph.id::text
             else ph.src
           end as src
    from gallery_projects p
    left join gallery_photos ph on ph.project_id = p.id
    order by p.position, p.id, ph.position, ph.id
  `;
  const projects = new Map<number, GalleryProject>();
  for (const row of rows) {
    if (!includeHidden && row.hidden) continue;
    let project = projects.get(row.id);
    if (!project) {
      project = {
        id: row.id,
        title: row.title,
        tag: row.tag,
        body: row.body,
        hidden: Boolean(row.hidden),
        photos: [],
      };
      projects.set(row.id, project);
    }
    if (row.photo_id && row.src) {
      project.photos.push({ id: row.photo_id, alt: row.alt ?? "", src: row.src });
    }
  }
  return [...projects.values()];
}

async function savedAt(sql: Sql) {
  const rows = await sql<{ saved_at: number }>`
    select (extract(epoch from updated_at) * 1000)::bigint as saved_at
    from gallery_meta
    where id = 1
  `;
  return rows[0]?.saved_at ?? 0;
}

async function snapshot(sql: Sql, includeHidden: boolean) {
  return {
    savedAt: await savedAt(sql),
    copy: await readCopy(sql),
    projects: await readProjects(sql, includeHidden),
    categories: await readCategories(sql),
  };
}

async function readCategories(sql: Sql) {
  return sql<{ id: number; name: string }>`select id, name from gallery_categories order by position, id`;
}

async function requirePassword(password: string) {
  const sql = await db();
  const rows = await sql<{ password_hash: string }>`select password_hash from gallery_lock where id = 1`;
  const stored = rows[0]?.password_hash ?? "";
  if (!passwordMatches(password, stored)) throw new Error("Palavra-passe incorreta.");
  return sql;
}

async function insertPhoto(sql: Sql, projectId: number, photo: { alt: string; src?: string; data?: string }, position: number) {
  const uploaded = photo.data?.startsWith("data:image/jpeg;base64,") ? photo.data : "";
  await sql`
    insert into gallery_photos (project_id, alt, src, data, position)
    values (${projectId}, ${photo.alt}, ${uploaded ? "" : (photo.src ?? "")}, ${uploaded || null}, ${position})
  `;
}

export const getContent = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  const current = await snapshot(sql, false);
  return { copy: current.copy, projects: current.projects };
});

export const listGallery = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await db();
  return readProjects(sql, false);
});

export const listManagedGallery = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const sql = await requirePassword(data.password);
    return snapshot(sql, true);
  });

export const restoreManagedContent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      password: z.string().min(1),
      savedAt: z.number().int().nonnegative(),
      copy: copySchema,
      projects: z.array(projectSchema).max(80),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await requirePassword(data.password);
    const current = await savedAt(sql);
    if (data.savedAt <= current) return snapshot(sql, true);
    await sql`delete from gallery_projects`;
    for (let index = 0; index < data.projects.length; index += 1) {
      const project = data.projects[index];
      const inserted = await sql<{ id: number }>`
        insert into gallery_projects (title, tag, body, hidden, position)
        values (${project.title}, ${project.tag}, ${project.body}, ${Boolean(project.hidden)}, ${index})
        returning id
      `;
      const projectId = inserted[0]?.id;
      if (!projectId) continue;
      for (let photoIndex = 0; photoIndex < project.photos.length; photoIndex += 1) {
        const photo = project.photos[photoIndex];
        const uploaded = photo.src.startsWith("data:image/jpeg;base64,") ? photo.src : "";
        await insertPhoto(sql, projectId, { alt: photo.alt, src: photo.src, data: uploaded }, photoIndex);
      }
    }
    await sql`
      insert into site_copy (id, copy)
      values (1, ${JSON.stringify(data.copy)}::jsonb)
      on conflict (id) do update set copy = excluded.copy
    `;
    await touch(sql);
    return snapshot(sql, true);
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
    const sql = await requirePassword(data.password);
    await sql`update gallery_lock set password_hash = ${hashPassword(data.next)} where id = 1`;
    await touch(sql);
    return { ok: true };
  });

export const updateSiteCopy = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), copy: copySchema }))
  .handler(async ({ data }) => {
    const sql = await requirePassword(data.password);
    await sql`
      insert into site_copy (id, copy)
      values (1, ${JSON.stringify(data.copy)}::jsonb)
      on conflict (id) do update set copy = excluded.copy
    `;
    await touch(sql);
    return { published: true };
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
    const sql = await requirePassword(data.password);
    const updated = await sql`update gallery_projects set title = ${data.title}, tag = ${data.tag}, body = ${data.body} where id = ${data.id} returning id`;
    if (updated.length === 0) throw new Error("Esse trabalho já não está na galeria.");
    for (const caption of data.captions ?? []) {
      await sql`update gallery_photos set alt = ${caption.alt || data.title} where id = ${caption.id} and project_id = ${data.id}`;
    }
    await touch(sql);
    return { published: true };
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
    const sql = await requirePassword(data.password);
    if (data.projectId) {
      await sql.query(
        `update gallery_photos as photo
         set position = ord.position
         from unnest($1::int[], $2::int[]) as ord(id, position)
         where photo.id = ord.id and photo.project_id = $3`,
        [data.ids, data.ids.map((_, index) => index), data.projectId],
      );
    } else {
      await sql.query(
        `update gallery_projects as project
         set position = ord.position
         from unnest($1::int[], $2::int[]) as ord(id, position)
         where project.id = ord.id`,
        [data.ids, data.ids.map((_, index) => index)],
      );
    }
    await touch(sql);
    return { published: true };
  });

export const setProjectHidden = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive(), hidden: z.boolean() }))
  .handler(async ({ data }) => {
    const sql = await requirePassword(data.password);
    const updated = await sql`update gallery_projects set hidden = ${data.hidden} where id = ${data.id} returning id`;
    if (updated.length === 0) throw new Error("Esse trabalho já não está na galeria.");
    await touch(sql);
    return { published: true };
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
    const sql = await requirePassword(data.password);
    const existing = await sql<{ id: number }>`select id from gallery_projects where id = ${data.id}`;
    if (existing.length === 0) throw new Error("Esse trabalho já não está na galeria.");
    const known = await sql<{ data: string | null }>`select data from gallery_photos where project_id = ${data.id}`;
    const seen = new Set(known.map((row) => row.data).filter(Boolean));
    const last = await sql<{ position: number }>`select coalesce(max(position), -1)::int as position from gallery_photos where project_id = ${data.id}`;
    let position = (last[0]?.position ?? -1) + 1;
    for (const image of data.images) {
      if (seen.has(image.data)) continue;
      await insertPhoto(sql, data.id, { alt: image.alt, data: image.data }, position);
      seen.add(image.data);
      position += 1;
    }
    await touch(sql);
    return { published: true };
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
    const sql = await requirePassword(data.password);
    const first = await sql<{ position: number }>`select coalesce(min(position), 0)::int as position from gallery_projects`;
    const inserted = await sql<{ id: number }>`
      insert into gallery_projects (title, tag, body, hidden, position)
      values (${data.title}, ${data.tag}, ${data.body}, false, ${(first[0]?.position ?? 0) - 1})
      returning id
    `;
    const id = inserted[0]?.id;
    if (!id) throw new Error("Não foi possível criar o trabalho.");
    for (let index = 0; index < data.images.length; index += 1) {
      await insertPhoto(sql, id, { alt: data.images[index]?.alt || data.title, data: data.images[index]?.data }, index);
    }
    await touch(sql);
    return { id, published: true };
  });

export const deleteGalleryProject = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const sql = await requirePassword(data.password);
    await sql`delete from gallery_projects where id = ${data.id}`;
    await touch(sql);
    return { ok: true, published: true };
  });

export const deleteGalleryPhoto = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const sql = await requirePassword(data.password);
    await sql`delete from gallery_photos where id = ${data.id}`;
    await touch(sql);
    return { ok: true, published: true };
  });

export const addGalleryCategory = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), name: z.string().trim().min(2).max(40) }))
  .handler(async ({ data }) => {
    const sql = await requirePassword(data.password);
    const existing = await sql<{ id: number }>`select id from gallery_categories where lower(name) = lower(${data.name})`;
    if (existing.length > 0) throw new Error("Essa categoria já existe.");
    const last = await sql<{ position: number }>`select coalesce(max(position), -1)::int as position from gallery_categories`;
    await sql`
      insert into gallery_categories (name, position)
      values (${data.name}, ${(last[0]?.position ?? -1) + 1})
    `;
    return { ok: true };
  });

export const deleteGalleryCategory = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1), id: z.number().int().positive() }))
  .handler(async ({ data }) => {
    const sql = await requirePassword(data.password);
    const rows = await sql<{ name: string }>`select name from gallery_categories where id = ${data.id}`;
    const name = rows[0]?.name;
    if (!name) throw new Error("Essa categoria já não existe.");
    await sql`update gallery_projects set tag = '' where lower(btrim(tag)) = lower(${name})`;
    await sql`delete from gallery_categories where id = ${data.id}`;
    await touch(sql);
    return { ok: true, published: true };
  });
