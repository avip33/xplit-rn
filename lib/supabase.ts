import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-get-random-values';
import { MMKV } from 'react-native-mmkv';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
if (!supabaseUrl || !supabaseAnonKey) throw new Error('Missing Supabase env vars');

const ENC_KEY_NAME = 'mmkv_encryption_key_v1';

async function getOrCreateEncryptionKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(ENC_KEY_NAME);
  if (!key) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes); // 256-bit
    key = Buffer.from(bytes).toString('base64'); // <-- safer than btoa in RN
    await SecureStore.setItemAsync(ENC_KEY_NAME, key, {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  }
  return key;
}

// Lazy singleton
let cached: Promise<SupabaseClient> | null = null;

export function getSupabase() {
  if (!cached) {
    cached = (async () => {
      const encryptionKey = await getOrCreateEncryptionKey();
      const mmkv = new MMKV({ id: 'supabase-auth', encryptionKey });

      const MMKVAdapter = {
        getItem: (k: string) => Promise.resolve(mmkv.getString(k) ?? null),
        setItem: (k: string, v: string) => Promise.resolve(mmkv.set(k, v)),
        removeItem: (k: string) => Promise.resolve(mmkv.delete(k)),
      };

      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: MMKVAdapter,
          storageKey: 'auth-token',   // <-- keep this consistent app-wide
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          flowType: 'pkce',
        },
      });
    })();
  }
  return cached;
}

// Migration remains the same...

export const debugStorage = async () => {
  try {
    console.log('Debugging MMKV storage...');
    const encryptionKey = await getOrCreateEncryptionKey();
    const mmkv = new MMKV({ id: 'supabase-auth', encryptionKey });

    const keys = [
      'sb-vknuortfipvywyntohrz-auth-token',
      'sb-vknuortfipvywyntohrz-auth-token-code-verifier',
      'sb-vknuortfipvywyntohrz-auth-token-refresh',
    ];
    for (const key of keys) {
      const value = mmkv.getString(key);
      console.log(`MMKV key: ${key}`, value ? 'has value' : 'no value');
    }
  } catch (error) {
    console.error('Error debugging MMKV storage:', error);
  }
};
