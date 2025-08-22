# Xplit Architecture Guide

This project uses a modern React Native architecture with **TanStack Query**, **Zustand**, and **Context API** for state management, integrated with **Supabase** for backend services.

## Architecture Overview

### State Management Strategy

- **TanStack Query (React Query)** - Server state (Supabase data)
- **Zustand** - Local/UI state with persistence
- **Context API** - Stable app-wide configuration and clients

### File Structure

```
├── app/
│   ├── providers.tsx          # Main providers (Supabase, Query Client, Theme)
│   └── _layout.tsx           # Root layout with providers
├── stores/
│   └── ui.ts                 # Zustand store for UI state
├── hooks/
│   ├── useAuth.ts            # Authentication hooks
│   ├── useProfile.ts         # Profile data hooks
│   └── useThemeContext.tsx   # Theme context
└── components/
    └── AuthExample.tsx       # Example component
```

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in your project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase Database Setup

Create the following tables in your Supabase database:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Usage Examples

### Authentication

```tsx
import { useAuth, useSignIn, useSignUp, useSignOut } from '@/hooks/useAuth';

function MyComponent() {
  const { data: user, isLoading } = useAuth();
  const signIn = useSignIn();
  const signUp = useSignUp();
  const signOut = useSignOut();

  const handleSignIn = async () => {
    try {
      await signIn.mutateAsync({ email: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  
  return user ? <UserProfile /> : <SignInForm />;
}
```

### Profile Management

```tsx
import { useProfile, useUpdateProfile, useProfileRealtime } from '@/hooks/useProfile';

function ProfileComponent({ userId }: { userId: string }) {
  const { data: profile, isLoading } = useProfile(userId);
  const updateProfile = useUpdateProfile();
  
  // Enable realtime updates
  useProfileRealtime(userId);

  const handleUpdate = async () => {
    await updateProfile.mutateAsync({
      userId,
      updates: { full_name: 'New Name' }
    });
  };

  if (isLoading) return <LoadingSpinner />;
  
  return (
    <View>
      <Text>{profile?.full_name}</Text>
      <Button onPress={handleUpdate} title="Update Profile" />
    </View>
  );
}
```

### UI State Management

```tsx
import { useUI } from '@/stores/ui';

function MyComponent() {
  const { 
    theme, 
    setTheme, 
    isLoading, 
    setIsLoading,
    formData,
    setFormData 
  } = useUI();

  // Update theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Store form data
  const saveFormData = (key: string, value: any) => {
    setFormData(key, value);
  };

  return (
    <View>
      <Button onPress={toggleTheme} title={`Current: ${theme}`} />
      <Text>Loading: {isLoading ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

### Realtime Subscriptions

```tsx
import { useProfileRealtime } from '@/hooks/useProfile';

function RealtimeProfile({ userId }: { userId: string }) {
  // This will automatically invalidate the profile query
  // when changes occur in the database
  useProfileRealtime(userId);
  
  const { data: profile } = useProfile(userId);
  
  return <Text>{profile?.full_name}</Text>;
}
```

## Best Practices

### 1. Query Keys

Use consistent query key patterns:

```tsx
// Single item
['profile', userId]

// List
['profiles']

// With filters
['profiles', { status: 'active' }]

// Nested data
['user', userId, 'posts']
```

### 2. Error Handling

```tsx
const { data, error, isLoading } = useQuery({
  queryKey: ['profile', userId],
  queryFn: async () => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error; // TanStack Query will catch this
    return data;
  },
  retry: (failureCount, error) => {
    // Don't retry on 4xx errors
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    return failureCount < 3;
  },
});
```

### 3. Optimistic Updates

```tsx
const updateProfile = useMutation({
  mutationFn: async (updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    if (error) throw error;
    return data;
  },
  onMutate: async (updates) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['profile', userId] });
    
    // Snapshot previous value
    const previousProfile = queryClient.getQueryData(['profile', userId]);
    
    // Optimistically update
    queryClient.setQueryData(['profile', userId], (old) => ({
      ...old,
      ...updates,
    }));
    
    return { previousProfile };
  },
  onError: (err, updates, context) => {
    // Rollback on error
    queryClient.setQueryData(['profile', userId], context?.previousProfile);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
  },
});
```

### 4. Zustand Selectors

Use selectors to prevent unnecessary re-renders:

```tsx
// Good - only re-renders when theme changes
const theme = useUI((state) => state.theme);

// Bad - re-renders when any UI state changes
const { theme } = useUI();
```

### 5. Context Usage

Only use Context for stable values:

```tsx
// Good - stable clients
const { supabase } = useClients();

// Bad - frequently changing state
const [user, setUser] = useState(null); // Use Zustand instead
```

## Performance Tips

1. **Use selectors** in Zustand to avoid unnecessary re-renders
2. **Keep Context values stable** - memoize providers if needed
3. **Use `staleTime` and `gcTime`** in TanStack Query to control caching
4. **Implement optimistic updates** for better UX
5. **Use `enabled` option** in queries to control when they run
6. **Batch mutations** when possible
7. **Use `useCallback` and `useMemo`** for expensive computations

## Troubleshooting

### Common Issues

1. **Query not refetching**: Check `staleTime` and `enabled` options
2. **State not persisting**: Verify MMKV/AsyncStorage setup
3. **Realtime not working**: Check Supabase RLS policies
4. **Performance issues**: Use React DevTools Profiler to identify bottlenecks

### Debug Tools

- **TanStack Query DevTools**: Add to development builds
- **Zustand DevTools**: Available in development
- **React DevTools**: For component re-render analysis

## Migration Guide

If migrating from Redux or other state management:

1. **Server state** → Move to TanStack Query
2. **UI state** → Move to Zustand
3. **Global config** → Keep in Context
4. **Form state** → Use react-hook-form (don't put in global stores)

This architecture provides a scalable, performant foundation for React Native apps with Supabase backend.
