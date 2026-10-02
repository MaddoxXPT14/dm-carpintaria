insert into gallery_lock (id, password_hash)
values (1, 'e2093336b8ea9b4f5aac1bc4e9b23148:b9fbf143e615802e9b70fc199620f37832a0336c654b7aefdced47820bc1c381')
on conflict (id) do update set password_hash = excluded.password_hash;
