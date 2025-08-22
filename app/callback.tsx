import { useClients } from '@/app/providers';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useUI } from '@/stores/ui';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

export default function CallbackScreen() {
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useClients();
  const { setEmailForVerification } = useUI();
  const router = useRouter();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      console.log('Processing auth callback...');
      
      // Wait a moment for Supabase to process the auth state change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if there's a verification code in the URL
      const url = await Linking.getInitialURL();
      console.log('Initial URL:', url);
      
      if (url && url.includes('code=')) {
        console.log('Found verification code, processing...');
        
        // Extract the code from the URL
        const codeMatch = url.match(/code=([^&]+)/);
        if (codeMatch) {
          const code = codeMatch[1];
          console.log('Processing verification code:', code);
          
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error exchanging code for session:', error);
            throw error;
          }
          
          if (data.session) {
            console.log('Successfully exchanged code for session');
            
            // Check if user is verified
            if (data.user?.email_confirmed_at) {
              console.log('User is verified, showing success message');
              
              Alert.alert(
                'Email Verified Successfully! 🎉',
                'Your email has been verified. You can now sign in to your account.',
                [
                  {
                    text: 'Continue',
                    onPress: () => {
                      setEmailForVerification(null);
                      router.replace('/login');
                    }
                  }
                ]
              );
            } else {
              console.log('User not verified yet');
              setEmailForVerification(data.user?.email || null);
              router.replace('/verification');
            }
            return;
          }
        }
      }
      
      // Fallback to session check if no code found
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (session) {
        console.log('Authentication successful:', session.user.email);
        
        // Check if the user's email is confirmed
        if (session.user.email_confirmed_at) {
          // User is verified and has a session, redirect to main app
          console.log('User email confirmed and has session, redirecting to main app');
          
          // Show success message briefly before redirecting
          Alert.alert(
            'Welcome Back! 🎉',
            'Your email has been verified successfully.',
            [
              {
                text: 'Continue',
                onPress: () => {
                  router.replace('/(tabs)');
                }
              }
            ]
          );
        } else {
          // User needs to verify email
          console.log('User needs email verification');
          setEmailForVerification(session.user.email || null);
          router.replace('/verification');
        }
      } else {
        // No session, check if there's a user (might be unverified)
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.log('No user found, redirecting to login');
          // No user found, redirect to login
          router.replace('/login');
          return;
        }

        if (user) {
          if (user.email_confirmed_at) {
            // User exists and is verified, but might not have a session
            console.log('User exists and is verified, showing success message');
            
            // Show success message before redirecting to login
            Alert.alert(
              'Email Verified Successfully! 🎉',
              'Your email has been verified. Please sign in to continue.',
              [
                {
                  text: 'Sign In',
                  onPress: () => {
                    // Clear any verification state and go to login
                    setEmailForVerification(null);
                    router.replace('/login');
                  }
                }
              ]
            );
          } else {
            // User exists but needs verification
            console.log('User exists but needs verification');
            setEmailForVerification(user.email || null);
            router.replace('/verification');
          }
        } else {
          // No user or session, redirect to login
          console.log('No user or session, redirecting to login');
          router.replace('/login');
        }
      }
    } catch (error: any) {
      console.error('Auth callback error:', error);
      setError(error.message || 'Authentication failed');
      
      // Show error alert and redirect to login
      Alert.alert(
        'Authentication Error',
        error.message || 'Failed to complete authentication. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Authentication Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Completing authentication...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: Fonts.sizes.lg,
    fontFamily: Fonts.avenir.medium,
    color: '#333333',
    textAlign: 'center',
  },
  errorText: {
    fontSize: Fonts.sizes.xl,
    fontFamily: Fonts.avenir.heavy,
    color: '#FF3B30',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.regular,
    color: '#666666',
    textAlign: 'center',
    lineHeight: Fonts.sizes.base * Fonts.lineHeights.normal,
  },
});
