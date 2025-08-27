# Persistent Authentication Implementation

This document outlines the implementation of persistent authentication in the Xplit app, ensuring users stay signed in until they explicitly sign out.

## Overview

The app now implements persistent authentication with the following features:
- **Session Persistence**: Users remain signed in across app restarts
- **Profile-Aware Routing**: Automatic routing based on user authentication and profile status
- **Onboarding State Management**: Proper handling of first-time vs returning users
- **Graceful Sign Out**: Complete cleanup when users sign out

## Key Components

### 1. Supabase Configuration (`lib/supabase.ts`)
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,  // Key setting for persistence
    detectSessionInUrl: true,
  },
});
```

### 2. Enhanced AuthHandler (`app/providers.tsx`)
The AuthHandler now includes:
- **Profile Checking**: Verifies if authenticated users have completed profile setup
- **Smart Routing**: Routes users to appropriate screens based on their status
- **Session Management**: Handles initial sessions, sign-ins, and sign-outs

```typescript
const checkUserProfileAndRoute = async (user: any) => {
  const { data: hasProfile, error: profileError } = await supabase.rpc('user_has_profile');
  
  if (hasProfile) {
    router.replace('/(tabs)'); // User has profile, go to main app
  } else {
    router.replace('/profile-setup'); // User needs to create profile
  }
};
```

### 3. Authentication-Aware Splash Screen (`components/SplashScreen.tsx`)
The splash screen now checks authentication status and routes accordingly:
```typescript
if (user) {
  // User is authenticated, AuthHandler will handle profile routing
  router.replace('/(tabs)');
} else if (onboardingDone) {
  // User has seen onboarding but is not authenticated
  router.replace('/login');
} else {
  // First time user, show onboarding
  router.replace('/onboarding');
}
```

### 4. Persistent UI State (`stores/ui.ts`)
The UI store persists:
- `onboardingDone`: Whether user has completed onboarding
- `isAuthenticated`: Current authentication state
- `emailForVerification`: Email for verification flow

## Authentication Flow

### First-Time User
1. **Splash Screen** → Shows loading animation
2. **Onboarding** → User sees app introduction
3. **Sign Up/Login** → User creates account or signs in
4. **Email Verification** → User verifies email (if needed)
5. **Profile Setup** → User creates profile
6. **Main App** → User accesses the app

### Returning User (Signed In)
1. **Splash Screen** → Checks authentication
2. **Main App** → Direct access (if profile exists)
3. **Profile Setup** → If profile doesn't exist

### Returning User (Signed Out)
1. **Splash Screen** → Checks authentication
2. **Login Screen** → User signs in
3. **Main App** → After successful authentication

## Key Features

### Session Persistence
- Supabase automatically persists sessions using secure storage
- Sessions are refreshed automatically in the background
- Users remain signed in until they explicitly sign out

### Profile-Aware Routing
- Authenticated users without profiles are directed to profile setup
- Users with complete profiles go directly to the main app
- Prevents users from getting stuck in incomplete flows

### Onboarding State Management
- First-time users see onboarding screens
- Returning users skip onboarding
- Onboarding state is reset on sign out (users can see it again if desired)

### Graceful Sign Out
- Clears all authentication state
- Resets onboarding state
- Clears all cached queries
- Redirects to login screen

## Error Handling

### Network Issues
- App gracefully handles network connectivity issues
- Authentication state is preserved locally
- Automatic retry mechanisms for failed requests

### Profile Errors
- If profile checking fails, users are directed to profile setup
- Fallback mechanisms ensure users don't get stuck

### Session Expiry
- Automatic token refresh prevents session expiry
- Graceful handling of expired sessions
- Clear error messages for authentication issues

## Security Considerations

### Secure Storage
- Authentication tokens are stored securely using platform-specific storage
- Sensitive data is never logged or exposed
- Proper cleanup on sign out

### Token Management
- Automatic token refresh prevents session expiry
- Secure token exchange for email verification
- Proper token invalidation on sign out

### Data Protection
- User data is protected by Row Level Security (RLS)
- Profile data is only accessible to the owner
- Public data is limited to safe fields only

## Testing the Implementation

### Manual Testing Steps
1. **Fresh Install**: Install app and verify onboarding flow
2. **Sign Up**: Create account and verify email verification
3. **Profile Setup**: Create profile and verify main app access
4. **App Restart**: Close and reopen app, verify persistent sign-in
5. **Sign Out**: Sign out and verify complete cleanup
6. **Re-authentication**: Sign in again and verify proper routing

### Expected Behaviors
- Users stay signed in across app restarts
- Proper routing based on authentication and profile status
- Clean sign out with complete state reset
- Onboarding shown only to first-time users

## Future Enhancements

### Biometric Authentication
- Add biometric authentication for enhanced security
- Optional biometric unlock for returning users
- Secure biometric key storage

### Multi-Device Sync
- Synchronize authentication state across devices
- Handle concurrent sessions gracefully
- Device-specific security policies

### Advanced Session Management
- Session timeout configuration
- Remember me functionality
- Device trust management

## Troubleshooting

### Common Issues
1. **User stuck on splash screen**: Check authentication state and network connectivity
2. **Profile setup loop**: Verify profile creation is working correctly
3. **Session not persisting**: Check Supabase configuration and storage permissions
4. **Onboarding showing repeatedly**: Verify onboarding state persistence

### Debug Information
- Authentication state changes are logged to console
- Profile checking results are logged
- Routing decisions are logged for debugging
- Error details are logged for troubleshooting
