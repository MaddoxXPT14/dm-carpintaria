create table if not exists gallery_categories (
  id serial primary key,
  name text not null,
  position integer not null default 0
);

create unique index if not exists gallery_categories_name_lower_idx on gallery_categories (lower(name));
