import { createProfileOnce, searchProfiles, updateProfile, uploadAvatar } from "@/lib/features/profile";
import { getSupabase } from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

// Profile state query
export function useProfile() {
  const { data: user } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const supabase = await getSupabase();
      
      // First check if user has a profile
      const { data: hasProfile, error: checkError } = await supabase.rpc('user_has_profile');
      if (checkError) throw checkError;
      
      if (!hasProfile) return null;
      
      // Get profile from the public view
      const { data, error } = await supabase
        .from('profiles_public')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create profile mutation
export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  return useMutation({
    mutationFn: async ({ handle, displayName }: { handle: string; displayName: string }) => {
      return createProfileOnce(handle, displayName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  return useMutation({
    mutationFn: async (updates: { displayName?: string; bio?: string; avatarUrl?: string }) => {
      return updateProfile(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
  });
}

// Upload avatar mutation
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { data: user } = useAuth();

  return useMutation({
    mutationFn: async (uri: string) => {
      if (!user?.id) throw new Error("User not authenticated");
      return uploadAvatar(user.id, uri);
    },
    onSuccess: (avatarUrl) => {
      // Update profile with new avatar URL
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      return avatarUrl;
    },
  });
}

// Search profiles query
export function useSearchProfiles(query: string, limit = 20) {
  return useQuery({
    queryKey: ["search-profiles", query, limit],
    queryFn: () => searchProfiles(query, limit),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
