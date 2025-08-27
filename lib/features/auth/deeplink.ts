// src/lib/features/auth/deeplink.ts
import * as Linking from 'expo-linking';

export type ParsedAuthLink =
  | { kind: 'pkce'; code: string }
  | { kind: 'fragment'; access_token: string; refresh_token?: string }
  | { kind: 'none' };

export function parseAuthDeepLink(url: string | null): ParsedAuthLink {
  if (!url) return { kind: 'none' };

  const { queryParams } = Linking.parse(url);
  // Accept both ?code=… (canonical PKCE) and ?token=pkce_… (verify hop)
  const code = (queryParams?.code || queryParams?.token || '') as string;
  if (code) return { kind: 'pkce', code };

  // Legacy fragment tokens (rare on mobile, but harmless to support)
  const hash = url.includes('#') ? url.split('#')[1] : '';
  if (hash) {
    const params = Object.fromEntries(
      hash.split('&').map((kv) => {
        const [k, v] = kv.split('=');
        return [decodeURIComponent(k), decodeURIComponent(v ?? '')];
      })
    );
    if (params['access_token']) {
      return {
        kind: 'fragment',
        access_token: params['access_token'],
        refresh_token: params['refresh_token'],
      };
    }
  }
  return { kind: 'none' };
}
