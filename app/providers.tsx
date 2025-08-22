import { ThemeProvider } from "@/hooks/useThemeContext";
import { useUI } from '@/stores/ui';
import NetInfo from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from "@tanstack/react-query";
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { createContext, useContext, useEffect } from "react";
import { AppState, AppStateStatus } from "react-native";

// Import the shared Supabase client
import { supabase } from '@/lib/supabase';

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

    // Handle auth state changes - simplified
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        console.log('Session exists:', !!session);
        console.log('User exists:', !!session?.user);
        if (session?.user) {
          console.log('User email confirmed:', session.user.email_confirmed_at);
          console.log('User ID:', session.user.id);
        }
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              console.log('SIGNED_IN: Setting authenticated state');
              setIsAuthenticated(true);
              
              if (session.user.email_confirmed_at) {
                console.log('User is verified, redirecting to profile setup');
                router.replace('/profile-setup' as any);
              } else {
                console.log('User needs verification, redirecting to verification');
                setEmailForVerification(session.user.email || null);
                router.replace('/verification');
              }
            } else {
              console.log('SIGNED_IN: No session or user found');
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('SIGNED_OUT: Clearing authenticated state');
            setIsAuthenticated(false);
            setEmailForVerification(null);
            router.replace('/login');
            break;
            
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              console.log('TOKEN_REFRESHED: Setting authenticated state');
              setIsAuthenticated(true);
            }
            break;
            
          case 'USER_UPDATED':
            if (session?.user && session.user.email_confirmed_at) {
              console.log('Email confirmed in USER_UPDATED, redirecting to profile setup');
              router.replace('/profile-setup' as any);
            }
            break;
            
          case 'INITIAL_SESSION':
            if (session?.user) {
              console.log('INITIAL_SESSION: User found, setting authenticated state');
              setIsAuthenticated(true);
            } else {
              console.log('INITIAL_SESSION: No user found, redirecting to login');
              router.replace('/login');
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
              console.log('User email confirmed:', data.user.email_confirmed_at);
              
              // Set authentication state
              setIsAuthenticated(true);
              
              // Check if user is verified
              if (data.user.email_confirmed_at) {
                console.log('User is verified, redirecting to profile setup');
                router.replace('/profile-setup' as any);
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
