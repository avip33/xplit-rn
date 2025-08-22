import { useClients } from "@/app/providers";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// Profile type definition
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Get profile query
export function useProfile(userId?: string) {
  const { supabase } = useClients();

  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const { supabase } = useClients();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<Profile> }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the profile
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId] });
      
      // Optionally update the cache directly
      queryClient.setQueryData(["profile", variables.userId], data);
    },
  });
}

// Realtime profile subscription
export function useProfileRealtime(userId?: string) {
  const { supabase } = useClients();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        () => {
          // Invalidate the profile query when changes occur
          queryClient.invalidateQueries({ queryKey: ["profile", userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, queryClient]);
}

// Get all profiles (for admin or listing purposes)
export function useProfiles() {
  const { supabase } = useClients();

  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Profile[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create profile mutation
export function useCreateProfile() {
  const { supabase } = useClients();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Omit<Profile, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("profiles")
        .insert(profile)
        .select()
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: () => {
      // Invalidate profiles list
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}
