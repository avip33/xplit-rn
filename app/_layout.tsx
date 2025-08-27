import {
  Lato_100Thin,
  Lato_300Light,
  Lato_400Regular,
  Lato_700Bold,
  Lato_900Black,
  useFonts
} from '@expo-google-fonts/lato';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import 'react-native-reanimated';

import { Providers } from '@/app/providers';
import CustomToast from '@/components/ui/Toast';
import { getSupabase } from '@/lib/supabase';
import { useUI } from '@/stores/ui';

const PUBLIC_ROUTES = new Set([
  '/login',
  '/signup',
  '/verification',
  '/callback',
  '/splash',
  '/onboarding',
]);

function AuthGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { authResolving, setProfileExists } = useUI();

  useEffect(() => {
    let mounted = true;

    const guard = async () => {
      if (authResolving) return;

      // Let pure public routes pass
      if (PUBLIC_ROUTES.has(pathname)) return;

      const supabase = await getSupabase();
      const { data } = await supabase.auth.getSession();

      // Not signed in → only allow true public routes
      if (!data.session) {
        if (pathname !== '/login' && !PUBLIC_ROUTES.has(pathname)) {
          router.replace('/login');
        }
        return;
      }

      // Signed in → check profile
      const { data: hasProfile, error } = await supabase.rpc('user_has_profile');
      if (error) {
        // if we can't check, be conservative and send to profile-setup
        router.replace('/profile-setup');
        return;
      }
      setProfileExists(!!hasProfile);

      // If user lacks profile:
      if (!hasProfile) {
        // They are allowed ONLY on /profile-setup
        if (pathname !== '/profile-setup') {
          router.replace('/profile-setup');
        }
        return;
      }

      // If user HAS profile:
      // don’t let them stay on profile-setup anymore
      if (pathname === '/profile-setup') {
        router.replace('/(tabs)');
        return;
      }
      // else: allow access everywhere (e.g., /(tabs))
    };

    guard();
  }, [pathname, authResolving]);

  return null;
}


export default function RootLayout() {
  const systemColorScheme = useSystemColorScheme();
  // Avenir is a system font on iOS, no need to load custom fonts
  const [loaded] = useFonts({
    Lato_100Thin,
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
    Lato_900Black,
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Providers>
      <NavigationThemeProvider value={systemColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGuard />
        <Stack>
          <Stack.Screen name="splash" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="verification" options={{ headerShown: false }} />
          <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
          <Stack.Screen name="callback" options={{ headerShown: false }} />
          <Stack.Screen name="test-verification" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
        <CustomToast />
      </NavigationThemeProvider>
    </Providers>
  );
}
