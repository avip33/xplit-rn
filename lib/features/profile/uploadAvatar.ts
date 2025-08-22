import * as FileSystem from 'expo-file-system';
import { supabase } from '../../supabase';

export async function uploadAvatar(userId: string, uri: string) {
  const file = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  const path = `${userId}/avatar-${Date.now()}.jpg`;

  const { data, error } = await supabase.storage.from('avatars').upload(path, decodeBase64(file), {
    contentType: 'image/jpeg',
    upsert: true
  });
  if (error) throw error;

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
  return urlData.publicUrl;
}

// helper for base64→Uint8Array
function decodeBase64(b64: string) {
  const binary = global.atob ? global.atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
