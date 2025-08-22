-- Optimize the user_has_profile function for better performance
create or replace function public.user_has_profile()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_profiles where id = auth.uid()
  ) and auth.uid() is not null;
$$;

revoke all on function public.user_has_profile() from public;
grant execute on function public.user_has_profile() to authenticated;
