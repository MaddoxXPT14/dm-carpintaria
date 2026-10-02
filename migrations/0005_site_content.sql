alter table gallery_projects add column if not exists hidden boolean not null default false;

alter table gallery_meta add column if not exists updated_at timestamptz not null default now();

create table if not exists site_copy (
  id integer primary key check (id = 1),
  copy jsonb not null
);
