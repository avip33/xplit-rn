import { User } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { resetPassword as resetPasswordApi, signInEmail, signOut as signOutApi, signUpEmail } from '../lib/features/auth/api';
import { getSupabase } from '../lib/supabase';
import { useUI } from '../stores/ui';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { setIsAuthenticated, setEmailForVerification } = useUI();

  useEffect(() => {
    let mounted = true;
    let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null;

    const initializeAuth = async () => {
      try {
        // Migrate existing SecureStore sessions to MMKV
        // await migrateSecureStoreSessionToMMKV();
        
        const supabase = await getSupabase();
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            setIsAuthenticated(true);
            setEmailForVerification(session.user.email || null);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            setEmailForVerification(null);
          }
          setIsInitialized(true);
          setIsLoading(false);
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            if (event === 'INITIAL_SESSION') {
              if (session?.user) {
                setUser(session.user);
                setIsAuthenticated(true);
                setEmailForVerification(session.user.email || null);
              } else {
                setUser(null);
                setIsAuthenticated(false);
                setEmailForVerification(null);
              }
              setIsInitialized(true);
              setIsLoading(false);
            } else if (event === 'SIGNED_IN') {
              if (session?.user) {
                setUser(session.user);
                setIsAuthenticated(true);
                setEmailForVerification(session.user.email || null);
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              setIsAuthenticated(false);
              setEmailForVerification(null);
            } else if (event === 'TOKEN_REFRESHED') {
              if (session?.user) {
                setUser(session.user);
                setIsAuthenticated(true);
                setEmailForVerification(session.user.email || null);
              }
            }
          }
        );

        authListener = { data: { subscription } };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      if (authListener) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, [setIsAuthenticated, setEmailForVerification]);

  const signIn = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signInEmail(email, password),
    onError: (error) => {
      console.error('Sign in error:', error);
    },
  });

  const signUp = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => signUpEmail(email, password),
    onError: (error) => {
      console.error('Sign up error:', error);
    },
  });



  const signOut = useMutation({
    mutationFn: () => signOutApi(),
    onError: (error) => {
      console.error('Sign out error:', error);
    },
  });

  const resetPassword = useMutation({
    mutationFn: ({ email }: { email: string }) => resetPasswordApi(email),
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });

  return {
    user,
    isLoading,
    isInitialized,
    signIn: signIn.mutateAsync,
    signUp: signUp.mutateAsync,
    signOut: signOut.mutateAsync,
    resetPassword: resetPassword.mutateAsync,
    isSigningIn: signIn.isPending,
    isSigningUp: signUp.isPending,
    isSigningOut: signOut.isPending,
    isResettingPassword: resetPassword.isPending,
  };
}
