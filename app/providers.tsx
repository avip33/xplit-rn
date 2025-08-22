import { ThemeProvider } from "@/hooks/useThemeContext";
import { useUI } from '@/stores/ui';
import NetInfo from "@react-native-community/netinfo";
import { createClient } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from "@tanstack/react-query";
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { createContext, useContext, useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";

// Create Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Please check your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Set up redirect URL for deep links
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

// Set up online manager
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(!!state.isConnected))
);

// Set up focus manager
focusManager.setEventListener((handleFocus) => {
  const sub = AppState.addEventListener("change", (s) => handleFocus(s === "active"));
  return () => sub.remove();
});

// Clients context
interface ClientsContextType {
  supabase: typeof supabase;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error("useClients must be used within a ClientsProvider");
  }
  return context;
};

// Main providers component
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClientsContext.Provider value={{ supabase }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthHandler />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </ClientsContext.Provider>
  );
}

// Component to handle auth state changes
function AuthHandler() {
  const { supabase } = useClients();
  const { setIsAuthenticated, setEmailForVerification } = useUI();
  const router = useRouter();

  useEffect(() => {
    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App became active, check for deep links
        supabase.auth.startAutoRefresh();
      } else {
        // App went to background, stop auto refresh
        supabase.auth.stopAutoRefresh();
      }
    };

    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              setIsAuthenticated(true);
              
              if (session.user.email_confirmed_at) {
                // User is verified, redirect to main app
                router.replace('/(tabs)');
              } else {
                // User needs verification
                setEmailForVerification(session.user.email || null);
                router.replace('/verification');
              }
            }
            break;
            
          case 'SIGNED_OUT':
            setIsAuthenticated(false);
            setEmailForVerification(null);
            router.replace('/login');
            break;
            
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              setIsAuthenticated(true);
            }
            break;
            
          case 'USER_UPDATED':
            if (session?.user) {
              // Check if email was just confirmed
              if (session.user.email_confirmed_at) {
                router.replace('/(tabs)');
              }
            }
            break;
        }
      }
    );

    // Handle deep links
    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      
      // Check if this is a Supabase auth callback with verification code
      if (url.includes('code=')) {
        console.log('Processing verification code from deep link...');
        
        // Extract the code from the URL
        const codeMatch = url.match(/code=([^&]+)/);
        if (codeMatch) {
          const code = codeMatch[1];
          console.log('Exchanging code for session:', code);
          
          try {
            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Error exchanging code for session:', error);
              return;
            }
            
            if (data.session && data.user) {
              console.log('Successfully exchanged code for session');
              
              // Check if user is verified
              if (data.user.email_confirmed_at) {
                console.log('User is verified, redirecting to main app');
                setIsAuthenticated(true);
                router.replace('/(tabs)');
              } else {
                console.log('User not verified yet, redirecting to verification');
                setEmailForVerification(data.user.email || null);
                router.replace('/verification');
              }
            }
          } catch (error) {
            console.error('Error processing verification code:', error);
          }
        }
      } else if (url.includes('access_token') || url.includes('refresh_token') || url.includes('error')) {
        // This is a Supabase auth callback, let Supabase handle it
        supabase.auth.onAuthStateChange((event, session) => {
          console.log('Deep link auth state change:', event);
        });
      }
    };

    // Set up deep link listener
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Set up app state listener
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    // Start auto refresh
    supabase.auth.startAutoRefresh();

    return () => {
      subscription.unsubscribe();
      linkingSubscription?.remove();
      appStateSubscription?.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, [supabase, setIsAuthenticated, setEmailForVerification, router]);

  return null;
}

// Default export for Expo Router
export default Providers;
