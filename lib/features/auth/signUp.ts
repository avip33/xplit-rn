import { getSupabase } from '../../supabase';

// Sign up with password OR use magic link (signInWithOtp) if you prefer
export async function signUpWithEmail(email: string, password: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      emailRedirectTo: 'xplit://callback' // your deep link
    }
  });
  if (error) throw error;
  return data.user; // email must be verified before profile creation
}

// Alternative: Sign up with magic link (no password required)
export async function signUpWithMagicLink(email: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'xplit://callback'
    }
  });
  if (error) throw error;
  return data;
} 
