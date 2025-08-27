import { getSupabase } from '../../supabase';

export async function createProfileOnce(handle: string, displayName: string) {
  try {
    const supabase = await getSupabase();
    
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
  } catch (error: any) {
    // Handle database constraint violations that might occur due to race conditions
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code || '';
    
    const isHandleTaken = 
      error.message === 'Handle is taken' ||
      errorMessage.includes('handle') && errorMessage.includes('taken') ||
      errorMessage.includes('already exists') ||
      errorMessage.includes('duplicate key') ||
      errorMessage.includes('unique constraint') ||
      errorCode === '23505' || // PostgreSQL unique constraint violation
      errorMessage.includes('violates unique constraint');
    
    if (isHandleTaken) {
      throw new Error('Handle is taken');
    }
    
    // Re-throw other errors as they are
    throw error;
  }
}
