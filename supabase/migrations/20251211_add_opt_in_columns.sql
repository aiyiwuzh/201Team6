-- Add opt-in columns to user_settings
alter table public.user_settings
  add column if not exists new_matches_opt_in boolean not null default false,
  add column if not exists messages_opt_in boolean not null default false,
  add column if not exists email_digest_opt_in boolean not null default false,
  add column if not exists marketing_emails_opt_in boolean not null default false,
  add column if not exists show_age_opt_in boolean not null default false,
  add column if not exists show_location_opt_in boolean not null default false,
  add column if not exists invisible_mode_opt_in boolean not null default false;

-- Optional: backfill opt-in to match existing columns (if they still exist)
update public.user_settings
set
  new_matches_opt_in = coalesce(new_matches, false),
  messages_opt_in = coalesce(messages, false),
  email_digest_opt_in = coalesce(email_digest, false),
  marketing_emails_opt_in = coalesce(marketing_emails, false),
  show_age_opt_in = coalesce(show_age, false),
  show_location_opt_in = coalesce(show_location, false),
  invisible_mode_opt_in = coalesce(invisible_mode, false);

-- Enable RLS if not already enabled
alter table public.user_settings enable row level security;

--------------------------------------------
-- Policies (Postgres does NOT allow IF NOT EXISTS)
-- So we safely drop first, then recreate.
--------------------------------------------

-- SELECT policy
drop policy if exists user_settings_select_own on public.user_settings;

create policy user_settings_select_own
on public.user_settings
for select
to authenticated
using (auth.uid() = user_id);

-- INSERT (upsert) policy
drop policy if exists user_settings_upsert_own on public.user_settings;

create policy user_settings_upsert_own
on public.user_settings
for insert
to authenticated
with check (auth.uid() = user_id);

-- UPDATE policy
drop policy if exists user_settings_update_own on public.user_settings;

create policy user_settings_update_own
on public.user_settings
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
