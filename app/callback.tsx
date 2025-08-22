import { useClients } from '@/app/providers';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useUI } from '@/stores/ui';
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Let the auth state handler in providers.tsx handle the routing
      // This callback screen just shows a loading state while auth is processed
      console.log('Auth processing complete, letting auth handler manage routing');
      
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
