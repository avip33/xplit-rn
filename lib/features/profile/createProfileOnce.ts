import { supabase } from '../../supabase';

export async function createProfileOnce(handle: string, displayName: string) {
  // availability check for a better UX
  const { data: available, error: availErr } = await supabase.rpc('is_handle_available', { p_handle: handle });
  if (availErr) throw availErr;
  if (!available) throw new Error('Handle is taken');

  // create profile (id comes from auth.uid() on the server)
  const { data, error } = await supabase.rpc('create_profile', {
    p_handle: handle,
    p_display_name: displayName
  });
  if (error) throw error;
  return data; // { id, handle, display_name, avatar_url }
}
