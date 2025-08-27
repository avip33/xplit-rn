import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { getSupabase } from '@/lib/supabase';
import { useUI } from '@/stores/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TestVerificationScreen() {
  const [isProcessing, setIsProcessing] = useState(false);
  // We'll get supabase instance when needed
  const { setEmailForVerification } = useUI();
  const router = useRouter();

  const simulateEmailVerification = async () => {
    setIsProcessing(true);
    try {
      const supabase = await getSupabase();
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        Alert.alert('Error', 'No user found. Please sign up first.');
        return;
      }

      console.log('Simulating email verification for:', user.email);

      // Simulate the verification process
      // In a real scenario, this would happen when user clicks email link
      const { data, error } = await supabase.auth.updateUser({
        data: { email_confirmed: true }
      });

      if (error) {
        console.error('Error updating user:', error);
        Alert.alert('Error', 'Failed to simulate verification: ' + error.message);
        return;
      }

      console.log('User updated successfully:', data);

      // Clear verification state and redirect to main app
      setEmailForVerification(null);
      router.replace('/(tabs)');

    } catch (error: any) {
      console.error('Test verification error:', error);
      Alert.alert('Error', 'Failed to simulate verification: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateCallbackWithVerifiedUser = async () => {
    setIsProcessing(true);
    try {
      const supabase = await getSupabase();
      
      // First verify the user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'No user found. Please sign up first.');
        return;
      }

      // Update user to be verified
      await supabase.auth.updateUser({
        data: { email_confirmed: true }
      });

      // Now simulate the callback process
      console.log('Simulating callback with verified user');
      
      // This simulates what happens when user clicks verification link
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user.email_confirmed_at) {
        console.log('User verified, redirecting to main app');
        setEmailForVerification(null);
        router.replace('/(tabs)');
      } else {
        console.log('User not verified, redirecting to verification');
        setEmailForVerification(user.email || null);
        router.replace('/verification');
      }

    } catch (error: any) {
      console.error('Callback simulation error:', error);
      Alert.alert('Error', 'Failed to simulate callback: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Email Verification Testing</Text>
      <Text style={styles.subtitle}>
        This screen helps test the email verification flow without needing actual email links.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={simulateEmailVerification}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Processing...' : 'Simulate Email Verification'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={simulateCallbackWithVerifiedUser}
          disabled={isProcessing}
        >
          <Text style={styles.buttonText}>
            {isProcessing ? 'Processing...' : 'Simulate Callback (Verified)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.note}>
        Note: This is for testing only. In production, verification happens via email links.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: Fonts.sizes['2xl'],
    fontFamily: Fonts.avenir.heavy,
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.regular,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: Fonts.sizes.base * Fonts.lineHeights.normal,
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  backButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
  },
  note: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.regular,
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});
