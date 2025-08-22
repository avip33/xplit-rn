-- Fix the user_has_profile function to properly handle authentication
create or replace function public.user_has_profile()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;
  
  return exists (
    select 1 from public.user_profiles where id = v_user_id
  );
end
$$;

revoke all on function public.user_has_profile() from public;
grant execute on function public.user_has_profile() to authenticated;
