-- Final optimized version of user_has_profile function
create or replace function public.user_has_profile()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  -- Get user ID and check if authenticated
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;
  
  -- Check if profile exists
  return exists (
    select 1 from public.user_profiles where id = v_user_id
  );
end
$$;

revoke all on function public.user_has_profile() from public;
grant execute on function public.user_has_profile() to authenticated;
