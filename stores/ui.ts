import { getSupabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { MMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const storage = new MMKV();

type UIState = {
  // Theme state
  theme: "light" | "dark" | "system";
  setTheme: (t: UIState["theme"]) => void;
  
  // Onboarding state
  onboardingDone: boolean;
  setOnboardingDone: (v: boolean) => void;
  
  // App session state
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
  
  // UI flags
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  
  // Navigation state
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  
  // Form states
  formData: Record<string, any>;
  setFormData: (key: string, value: any) => void;
  clearFormData: (key?: string) => void;
  
  // Email verification state
  emailForVerification: string | null;
  setEmailForVerification: (email: string | null) => void;
  

  
  // Auth state (like ChatGPT solution)
  session: Session | null;
  user: User | null;
  profileExists: boolean | null; // null = unknown, false = must create
  setProfileExists: (v: boolean) => void;
  authResolving: boolean;          // <- NEW
  setAuthResolving: (v: boolean) => void; // <- NEW
  initAuth: () => Promise<void>;
};

export const useUI = create<UIState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: "system",
      setTheme: (theme) => set({ theme }),
      
      // Onboarding
      onboardingDone: false,
      setOnboardingDone: (onboardingDone) => set({ onboardingDone }),
      
      // Authentication
      isAuthenticated: false,
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      // Loading state
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      
      // Navigation
      currentTab: "index",
      setCurrentTab: (currentTab) => set({ currentTab }),
      
      // Form data
      formData: {},
      setFormData: (key, value) => 
        set((state) => ({
          formData: { ...state.formData, [key]: value }
        })),
      clearFormData: (key) => 
        set((state) => ({
          formData: key 
            ? Object.fromEntries(Object.entries(state.formData).filter(([k]) => k !== key))
            : {}
        })),
      
      // Email verification
      emailForVerification: null,
      setEmailForVerification: (emailForVerification) => set({ emailForVerification }),
      

      
      // Auth state
      session: null,
      user: null,
      profileExists: null,
      setProfileExists: (profileExists) => set({ profileExists }),
      authResolving: false,
      setAuthResolving: (authResolving) => set({ authResolving }),
      initAuth: async () => {
        const supabase = await getSupabase();
        const { data } = await supabase.auth.getSession();
        set({ session: data.session ?? null, user: data.session?.user ?? null });

        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session: session ?? null, user: session?.user ?? null });
          // reset profile existence on auth change
          set({ profileExists: null });
        });
      },
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => ({
        setItem: (name, value) => {
          storage.set(name, value);
        },
        getItem: (name) => {
          const value = storage.getString(name);
          return value ?? null;
        },
        removeItem: (name) => {
          storage.delete(name);
        },
      })),
      version: 1,
      // Only persist certain fields
      partialize: (state) => ({
        theme: state.theme,
        onboardingDone: state.onboardingDone,
        isAuthenticated: state.isAuthenticated,
        currentTab: state.currentTab,
        formData: state.formData,
        emailForVerification: state.emailForVerification,
      }),
      // Add migration function to handle version updates
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Handle migration from version 0 to 1
          return {
            ...persistedState,
            // Add any new fields with defaults
          };
        }
        return persistedState;
      },
    }
  )
);
