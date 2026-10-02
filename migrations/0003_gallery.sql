create table if not exists gallery_projects (
  id serial primary key,
  title text not null,
  tag text not null default '',
  body text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists gallery_photos (
  id serial primary key,
  project_id integer not null references gallery_projects (id) on delete cascade,
  alt text not null default '',
  src text not null default '',
  data text,
  position integer not null default 0
);

create index if not exists gallery_photos_project_id_idx on gallery_photos (project_id);

create table if not exists gallery_lock (
  id integer primary key check (id = 1),
  password_hash text not null
);

create table if not exists gallery_meta (
  id integer primary key check (id = 1),
  seeded boolean not null default false
);

insert into gallery_lock (id, password_hash)
values (1, '0717665303e52cb976b48982cbc438ea:0c4e4db4c4ed670b02d1b9ae334f794f65c6d81498b1b545a2ce4e7820952505')
on conflict (id) do nothing;
