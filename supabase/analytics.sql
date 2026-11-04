-- Run this once in Supabase → SQL Editor. Anonymous usage statistics for the owner of the app.
-- People only ADD events about what they do (never the text they write). Only the owner can READ them.
create table if not exists app_events (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  props jsonb,
  created_at timestamptz not null default now()
);
create index if not exists app_events_time on app_events (created_at);
alter table app_events enable row level security;

drop policy if exists "add own events" on app_events;
create policy "add own events" on app_events
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "owner reads all" on app_events;
create policy "owner reads all" on app_events
  for select to authenticated using ((auth.jwt() ->> 'email') = 'inesasargsyan2021@gmail.com');
