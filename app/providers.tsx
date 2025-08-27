import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ThemeProvider } from '../hooks/useThemeContext';
import { useUI } from '../stores/ui';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AuthHandler() {
  const { setIsAuthenticated, setEmailForVerification, setOnboardingDone, initAuth } = useUI();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize auth state using the new approach
        await initAuth();
      } catch (error) {
        console.error('Error initializing auth handler:', error);
      }
    };

    initializeAuth();
  }, [initAuth]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthHandler />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Default export for Expo Router
export default Providers;
