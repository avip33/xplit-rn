-- Enable useful extensions
create extension if not exists citext;
create extension if not exists pg_trgm;

-- 1) Base profile table (email stays in auth.users; we never expose an email-change path)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle citext not null unique,
  display_name text not null,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Enforce ASCII, lowercase-friendly handle format and length
  constraint handle_format_chk check (handle ~ '^[a-z0-9._-]{2,30}$')
);

-- Indexes for lookups/search
create index if not exists user_profiles_handle_trgm on public.user_profiles using gin (handle gin_trgm_ops);
create index if not exists user_profiles_display_trgm on public.user_profiles using gin (display_name gin_trgm_ops);

-- 2) Make handle immutable after insert
create or replace function public.prevent_handle_update()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' and new.handle is distinct from old.handle then
    raise exception 'Handle is immutable';
  end if;
  return new;
end
$$;

drop trigger if exists trg_prevent_handle_update on public.user_profiles;
create trigger trg_prevent_handle_update
before update on public.user_profiles
for each row execute function public.prevent_handle_update();

-- 3) Maintain updated_at
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists trg_touch_updated_at on public.user_profiles;
create trigger trg_touch_updated_at
before update on public.user_profiles
for each row execute function public.touch_updated_at();

-- 4) Public read surface via a VIEW (limits what anonymous/clients see)
create or replace view public.profiles_public as
select
  id,
  handle,
  display_name,
  avatar_url
from public.user_profiles;

-- 5) RLS
alter table public.user_profiles enable row level security;

-- Allow everyone to SELECT (for discovery) OR switch to view-only exposure (recommended).
-- If you plan to expose only the view via PostgREST, keep base table select locked down.
-- We'll lock the base table and expose the view instead.
drop policy if exists "public read profiles" on public.user_profiles;
drop policy if exists "select all" on public.user_profiles;

-- Owner can select/update their full row
create policy "owner can select own profile"
on public.user_profiles
for select
using (auth.uid() = id);

create policy "owner can insert own profile"
on public.user_profiles
for insert
with check (auth.uid() = id);

create policy "owner can update mutable fields"
on public.user_profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and handle is not distinct from (select handle from public.user_profiles where id = auth.uid())
);

-- To serve public discovery, we rely on the VIEW + a SECURITY DEFINER function below.

-- 6) Public discovery: a SECURITY DEFINER function that reads from the view safely
create or replace function public.search_profiles(q text, limit_count int default 20)
returns table(id uuid, handle text, display_name text, avatar_url text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.handle::text, p.display_name, p.avatar_url
  from public.profiles_public p
  where
    -- Prioritize handle prefix, otherwise fuzzy on display_name
    (q is null)
    or (p.handle ilike q || '%')
    or (p.display_name ilike '%' || q || '%')
  order by
    case when p.handle ilike q || '%' then 0 else 1 end,
    similarity(p.display_name, coalesce(q,'')) desc
  limit greatest(1, least(limit_count, 50));
$$;

revoke all on function public.search_profiles(text, int) from public;
grant execute on function public.search_profiles(text, int) to anon, authenticated;

-- 7) Profile creation/update RPCs that keep handle immutable

-- Create profile after email verification & first sign-in
create or replace function public.create_profile(p_handle text, p_display_name text)
returns public.profiles_public
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := auth.uid();
  v_row public.profiles_public%rowtype;
begin
  if v_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Normalize handle: lowercase; validate format
  p_handle := lower(p_handle);
  if p_handle !~ '^[a-z0-9._-]{2,30}$' then
    raise exception 'Invalid handle format';
  end if;

  insert into public.user_profiles (id, handle, display_name)
  values (v_id, p_handle, trim(both from p_display_name))
  on conflict (id) do nothing;

  select id, handle, display_name, avatar_url into v_row
  from public.profiles_public where id = v_id;
  return v_row;
end
$$;

revoke all on function public.create_profile(text, text) from public;
grant execute on function public.create_profile(text, text) to authenticated;

-- Update mutable fields only
create or replace function public.update_profile(p_display_name text default null, p_bio text default null, p_avatar_url text default null)
returns public.profiles_public
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid := auth.uid();
  v_row public.profiles_public%rowtype;
begin
  if v_id is null then
    raise exception 'Not authenticated';
  end if;

  update public.user_profiles
  set
    display_name = coalesce(nullif(trim(both from p_display_name), ''), display_name),
    bio = coalesce(p_bio, bio),
    avatar_url = coalesce(nullif(trim(both from p_avatar_url), ''), avatar_url)
  where id = v_id;

  select id, handle, display_name, avatar_url into v_row
  from public.profiles_public where id = v_id;
  return v_row;
end
$$;

revoke all on function public.update_profile(text, text, text) from public;
grant execute on function public.update_profile(text, text, text) to authenticated;

-- Handle availability checker
create or replace function public.is_handle_available(p_handle text)
returns boolean
language sql
stable
as $$
  select not exists (
    select 1 from public.user_profiles where handle = lower(p_handle)
  );
$$;

revoke all on function public.is_handle_available(text) from public;
grant execute on function public.is_handle_available(text) to anon, authenticated;
