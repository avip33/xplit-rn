import { supabase } from '../../supabase';

export async function searchProfiles(q: string, limit = 20) {
  const { data, error } = await supabase.rpc('search_profiles', { q, limit_count: limit });
  if (error) throw error;
  return data as Array<{ 
    id: string; 
    handle: string; 
    display_name: string; 
    avatar_url: string | null 
  }>;
}
