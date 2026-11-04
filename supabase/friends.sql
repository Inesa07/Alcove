-- Run this once in Supabase → SQL Editor. Friends: visit each other's rooms and leave notes.
--
-- What a friend can see: your name, how your room looks and the books on your shelf.
-- What a friend can NOT see: your diary, your notes, your calendar.
-- Notes: the person who receives a note reads it; nobody else can.

-- 1. Your public card: a friend code, your name, your room and your shelf
create table if not exists profiles (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  code text unique not null,
  name text,
  room jsonb,
  books jsonb,
  updated_at timestamptz not null default now()
);
alter table profiles enable row level security;

-- 2. Who is friends with whom (one row each way)
create table if not exists friendships (
  user_id uuid not null references auth.users on delete cascade,
  friend_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);
alter table friendships enable row level security;

-- 3. Notes left on a friend's board
create table if not exists friend_notes (
  id bigint generated always as identity primary key,
  from_id uuid not null default auth.uid() references auth.users on delete cascade,
  to_id uuid not null references auth.users on delete cascade,
  from_name text,
  text text not null check (char_length(text) between 1 and 500),
  color text,
  created_at timestamptz not null default now()
);
alter table friend_notes enable row level security;

create or replace function is_friend(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from friendships where user_id = a and friend_id = b)
$$;

-- profiles: you write your own; you and your friends can read it
drop policy if exists "write own profile" on profiles;
create policy "write own profile" on profiles for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "friends read profile" on profiles;
create policy "friends read profile" on profiles for select to authenticated
  using (auth.uid() = user_id or is_friend(auth.uid(), user_id));

-- friendships: you see and remove your own
drop policy if exists "see own friends" on friendships;
create policy "see own friends" on friendships for select to authenticated using (auth.uid() = user_id);
drop policy if exists "remove own friends" on friendships;
create policy "remove own friends" on friendships for delete to authenticated using (auth.uid() = user_id or auth.uid() = friend_id);

-- notes: you can leave one only for a friend; only the receiver reads and removes it
drop policy if exists "leave a note for a friend" on friend_notes;
create policy "leave a note for a friend" on friend_notes for insert to authenticated
  with check (auth.uid() = from_id and is_friend(auth.uid(), to_id));
drop policy if exists "receiver reads notes" on friend_notes;
create policy "receiver reads notes" on friend_notes for select to authenticated using (auth.uid() = to_id);
drop policy if exists "receiver removes notes" on friend_notes;
create policy "receiver removes notes" on friend_notes for delete to authenticated using (auth.uid() = to_id);

-- Adding a friend by their code. Both people become friends. Returns the friend's name.
create or replace function add_friend(friend_code text) returns text
language plpgsql security definer set search_path = public as $$
declare other uuid; other_name text;
begin
  select user_id, name into other, other_name from profiles where code = upper(trim(friend_code));
  if other is null then raise exception 'No one has this code'; end if;
  if other = auth.uid() then raise exception 'This is your own code'; end if;
  insert into friendships (user_id, friend_id) values (auth.uid(), other), (other, auth.uid()) on conflict do nothing;
  return coalesce(other_name, 'your friend');
end $$;
grant execute on function add_friend(text) to authenticated;
