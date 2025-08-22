import { supabase } from '../../supabase';

export async function updateProfile(opts: { 
  displayName?: string; 
  bio?: string; 
  avatarUrl?: string 
}) {
  const { data, error } = await supabase.rpc('update_profile', {
    p_display_name: opts.displayName ?? null,
    p_bio: opts.bio ?? null,
    p_avatar_url: opts.avatarUrl ?? null
  });
  if (error) throw error;
  return data;
}
