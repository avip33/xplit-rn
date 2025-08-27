import { getSupabase } from '@/lib/supabase';

export async function signUpEmail(email: string, password: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: 'xplit://callback' }
  });
  if (error) throw error;
  return data;
}

export async function signInEmail(email: string, password: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = await getSupabase();
  await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'xplit://reset-password',
  });
  if (error) throw error;
}

export async function isEmailVerified(): Promise<boolean> {
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user?.email_confirmed_at);
}

// Profile helpers
export async function profileExists(): Promise<boolean> {
  const supabase = await getSupabase();
  const { data: me, error: meErr } = await supabase.auth.getUser();
  if (meErr || !me.user) return false;
  const { data, error } = await supabase.rpc('user_has_profile');
  if (error) throw error;
  return Boolean(data);
}

export async function isHandleAvailable(handle: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc('is_handle_available', { p_handle: handle.toLowerCase() });
  if (error) throw error;
  return Boolean(data);
}

export async function createProfile(handle: string, displayName: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc('create_profile', {
    p_handle: handle.toLowerCase(),
    p_display_name: displayName.trim()
  });
  if (error) throw error;
  return data; // { id, handle, display_name, avatar_url }
}
