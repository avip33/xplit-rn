// app/callback.tsx
import { profileExists } from '@/lib/features/auth/api';
import { getSupabase } from '@/lib/supabase';
import { useUI } from '@/stores/ui';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function CallbackScreen() {
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);
  const router = useRouter();
  const { setAuthResolving, setProfileExists } = useUI();

  // 👇 expo-router parses ?code and ?token for you
  const params = useLocalSearchParams<{ code?: string | string[]; token?: string | string[] }>();

  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const val = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

    const routeNext = async () => {
      const exists = await profileExists();
      setProfileExists(exists);
      router.replace(exists ? '/(tabs)' : '/profile-setup');
    };

    const tryExchange = async (codeOrToken: string) => {
      const supabase = await getSupabase();

      // v2 API expects a plain string (PKCE code)
      const { error } = await supabase.auth.exchangeCodeForSession(codeOrToken);
      if (error) throw error;

      const after = await supabase.auth.getSession();
    };

    const handle = async (url: string | null) => {
      if (processedRef.current) return;
      if (!url) return; // wait; do not redirect
      processedRef.current = true;

      setAuthResolving(true);
      try {

        // Prefer expo-router params, but also parse runtime URL
        const { queryParams } = Linking.parse(url);
        const code = val(params.code) || (queryParams?.code as string);
        const token = val(params.token) || (queryParams?.token as string);

        const codeOrToken = code || token;
        if (!codeOrToken) {
          processedRef.current = false; // let fallback check session
          return;
        }

        await tryExchange(codeOrToken);
        await routeNext();
      } catch (e: any) {
        console.error('[CALLBACK] error:', e);
        setError(e?.message ?? 'Could not complete sign-in.');
      } finally {
        setAuthResolving(false);
      }
    };

    // 1) Fast path: if expo-router already gave us params, try immediately
    const first = (Array.isArray(params.code) ? params.code[0] : params.code) ||
                  (Array.isArray(params.token) ? params.token[0] : params.token);
    if (first && !processedRef.current) {
      processedRef.current = true;
      setAuthResolving(true);
      (async () => {
        try {
          await tryExchange(first);
          await routeNext();
        } catch (e: any) {
          console.error('[CALLBACK] direct param error:', e);
          setError(e?.message ?? 'Could not complete sign-in.');
        } finally {
          setAuthResolving(false);
        }
      })();
    }

    // 2) Cold start: may be null initially on iOS — don’t redirect
    Linking.getInitialURL().then(handle);

    // 3) Warm start
    sub = Linking.addEventListener('url', (ev) => handle(ev.url));

    // 4) Fallback after 2.5s: if nothing processed, check if a session already exists
    fallbackTimer = setTimeout(async () => {
      if (processedRef.current) return;
      setAuthResolving(true);
      try {
        const supabase = await getSupabase();
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          processedRef.current = true;
          await routeNext();
          return;
        }
      } finally {
        setAuthResolving(false);
        if (!processedRef.current) router.replace('/login');
      }
    }, 2500);

    return () => {
      sub?.remove?.();
      if (fallbackTimer) clearTimeout(fallbackTimer);
      setAuthResolving(false);
    };
  }, [params.code, params.token]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {!error ? (
        <>
          <ActivityIndicator />
          <Text>Completing secure sign-in…</Text>
        </>
      ) : (
        <>
          <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
          <Text onPress={() => router.replace('/login')} style={{ textDecorationLine: 'underline', marginTop: 8 }}>
            Go to Sign in
          </Text>
        </>
      )}
    </View>
  );
}
