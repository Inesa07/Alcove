-- Run this once in Supabase → SQL Editor.
-- One row per piece of data: 'state' (notes, books, calendar, room), 'bp:N' (diary page N), 'cover:<id>' (book cover).
create table if not exists planner_data (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  key text not null,
  value jsonb,                       -- null means it was deleted
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table planner_data enable row level security;

-- Each person sees and changes only their own rows.
drop policy if exists "own rows" on planner_data;
create policy "own rows" on planner_data
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
