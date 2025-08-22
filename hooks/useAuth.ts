import { useClients } from "@/app/providers";
import { useUI } from "@/stores/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

// Auth state query
export function useAuth() {
  const { supabase } = useClients();
  const { setIsAuthenticated } = useUI();

  const query = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Update authentication state when query data changes
  React.useEffect(() => {
    if (query.data !== undefined) {
      setIsAuthenticated(!!query.data);
    }
  }, [query.data, setIsAuthenticated]);

  React.useEffect(() => {
    if (query.error) {
      setIsAuthenticated(false);
    }
  }, [query.error, setIsAuthenticated]);

  return query;
}

// Sign in mutation
export function useSignIn() {
  const { supabase } = useClients();
  const queryClient = useQueryClient();
  const { setIsLoading } = useUI();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
}

// Sign up mutation
export function useSignUp() {
  const { supabase } = useClients();
  const { setIsLoading } = useUI();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "xplit://callback",
        },
      });
      if (error) throw error;
      return data;
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
}

// Sign out mutation
export function useSignOut() {
  const { supabase } = useClients();
  const queryClient = useQueryClient();
  const { setIsAuthenticated, setIsLoading } = useUI();

  return useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      queryClient.clear(); // Clear all queries on sign out
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
}

// Password reset mutation
export function usePasswordReset() {
  const { supabase } = useClients();
  const { setIsLoading } = useUI();

  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
}
