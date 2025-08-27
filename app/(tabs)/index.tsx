import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { AuthExample } from '@/components/AuthExample';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/hooks/useAuth';
import { useThemeContext } from '@/hooks/useThemeContext';
import { useToast } from '@/hooks/useToast';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, themeMode, toggleTheme } = useThemeContext();
  const { signOut, isSigningOut } = useAuth();
  const toast = useToast();
  
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Hello World!</ThemedText>
        <HelloWave />
      </ThemedView>
      
      {/* Theme Toggle Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Theme Toggle</ThemedText>
        <ThemedText>
          Current theme: <ThemedText type="defaultSemiBold">{theme}</ThemedText> 
          {themeMode === 'system' && ' (System)'}
        </ThemedText>
        <TouchableOpacity 
          style={styles.themeToggleButton}
          onPress={toggleTheme}
        >
          <ThemedText style={styles.themeToggleButtonText}>
            Toggle Theme ({themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark'})
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <TouchableOpacity 
          style={styles.onboardingButton}
          onPress={() => router.push('/onboarding')}
        >
          <ThemedText style={styles.onboardingButtonText}>Go to Onboarding</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <TouchableOpacity 
          style={styles.onboardingButton}
          onPress={() => router.push('/typography-preview')}
        >
          <ThemedText style={styles.onboardingButtonText}>Go to Typography Preview</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Test Verification Button - Only in development */}
      {__DEV__ && (
        <ThemedView style={styles.stepContainer}>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/test-verification')}
          >
            <ThemedText style={styles.testButtonText}>🧪 Test Email Verification</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
      
      {/* Sign Out Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Account</ThemedText>
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={async () => {
            try {
              await signOut();
              toast.success('Signed Out', 'You have been successfully signed out.');
              // Navigate to login page after signout
              router.replace('/login');
            } catch (error: any) {
              // Show user-friendly error message instead of technical database error
              toast.error('Sign Out Failed', 'Unable to sign out. Please try again.');
              console.error('Sign out error:', error);
            }
          }}
          disabled={isSigningOut}
        >
          <ThemedText style={styles.signOutButtonText}>
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      {/* Auth Example Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Authentication Example</ThemedText>
        <ThemedText>
          This demonstrates the new architecture with TanStack Query, Zustand, and Supabase.
        </ThemedText>
        <AuthExample />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  onboardingButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  onboardingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  themeToggleButton: {
    backgroundColor: '#FFCA62',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  themeToggleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
