-- Reminders that arrive even when Alcove is closed (push notifications).
-- Run this once in Supabase → SQL Editor, after the edge function "send-reminders" is deployed.

-- 1. Where each phone or computer can be reached (one row per device)
create table if not exists push_subscriptions (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  keys jsonb not null,
  created_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;
drop policy if exists "own devices" on push_subscriptions;
create policy "own devices" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. The reminders the app wrote for you: what to say, and when
create table if not exists push_reminders (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  id text not null,
  at timestamptz not null,
  title text not null,
  body text not null default '',
  url text not null default './#calendar',
  sent_at timestamptz,
  primary key (user_id, id)
);
alter table push_reminders enable row level security;
drop policy if exists "own reminders" on push_reminders;
create policy "own reminders" on push_reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists push_reminders_due on push_reminders (at) where sent_at is null;

-- 3. Every minute, ask the edge function to send the reminders that are due
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule('alcove-reminders') where exists (select 1 from cron.job where jobname = 'alcove-reminders');
select cron.schedule('alcove-reminders', '* * * * *', $$
  select net.http_post(
    url := 'https://hugsvebdqfmvpleqitym.supabase.co/functions/v1/send-reminders',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  )
$$);
