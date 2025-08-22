import { useClients } from '@/app/providers';
import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUI } from '@/stores/ui';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function VerificationScreen() {
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const router = useRouter();
  const { emailForVerification, setEmailForVerification } = useUI();
  const { supabase } = useClients();

  // Theme-aware colors
  const backgroundColor = useThemeColor({}, 'background') as string;
  const isDarkTheme = backgroundColor === Colors.dark.background;
  
  const titleColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const subtitleColor = isDarkTheme ? '#E6E6E6' : '#666666';
  const inputBackgroundColor = isDarkTheme ? Colors.dark.neutral[500] : Colors.light.neutral[200];
  const inputTextColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const inputBorderColor = isDarkTheme ? Colors.dark.neutral[400] : Colors.light.neutral[400];

  // If no email is stored, redirect to signup
  useEffect(() => {
    if (!emailForVerification) {
      router.replace('/signup');
    }
  }, [emailForVerification, router]);

  // Don't render anything if no email is stored
  if (!emailForVerification) {
    return null;
  }

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      // For Supabase, we typically verify by checking if the user's email is confirmed
      // The verification code is usually handled automatically by Supabase
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (user && user.email_confirmed_at) {
        Alert.alert('Success', 'Email verified successfully!');
        setEmailForVerification(null); // Clear the stored email
        router.replace('/(tabs)');
      } else {
        Alert.alert('Verification Pending', 'Please check your email and click the verification link. Then try checking the status again.');
      }
    } catch (error: any) {
      Alert.alert('Verification Error', error.message || 'Failed to verify email. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailForVerification!,
      });
      
      if (error) throw error;
      
      Alert.alert('Email Resent', 'A new verification email has been sent to your inbox.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignup = () => {
    setEmailForVerification(null);
    router.replace('/signup');
  };

  const handleOpenEmail = () => {
    // Try to open the default email app
    Linking.openURL('mailto:');
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToSignup} style={styles.backButton}>
          <Icon name="arrowLeft" size={20} />
          <Text style={[styles.backText, { color: isDarkTheme? Colors.dark.text : Colors.light.text }]}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <View style={[styles.iconBackground, { backgroundColor: Colors.primary }]}>
            <Icon name="mail" size={32} color="#333" />
          </View>
        </View>

        <Text style={[styles.title, { color: titleColor }]}>Verify your email</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          We've sent a verification email to
        </Text>
        <Text style={[styles.emailText, { color: Colors.primary }]}>
          {emailForVerification}
        </Text>
        <Text style={[styles.instructionText, { color: subtitleColor }]}>
          Please check your email and click the verification link to continue.
        </Text>

        {/* Check Verification Status */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: subtitleColor }]}>VERIFICATION STATUS</Text>
          <View style={[
            styles.inputWrapper,
            { 
              backgroundColor: inputBackgroundColor,
              borderColor: inputBorderColor
            }
          ]}>
            <Text style={[styles.statusText, { color: inputTextColor }]}>
              Click "Check Status" to verify if your email has been confirmed
            </Text>
          </View>
        </View>

        {/* Verify Button */}
        <TouchableOpacity 
          onPress={handleVerify} 
          style={[
            styles.verifyButton,
            { opacity: isVerifying ? 0.6 : 1 }
          ]}
          disabled={isVerifying}
        >
          <Text style={styles.verifyButtonText}>
            {isVerifying ? 'Checking...' : 'Check Status'}
          </Text>
          {!isVerifying && <Icon name="arrowRight" size={16} color="#333" />}
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
            <Text style={[styles.actionText, { color: Colors.primary }]}>
              {isResending ? 'Resending...' : 'Resend Email'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleOpenEmail}>
            <Text style={[styles.actionText, { color: Colors.primary }]}>
              Open Email App
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Buttons - Remove in production */}
        {__DEV__ && (
          <View style={styles.testContainer}>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={async () => {
                try {
                  // Simulate successful verification by signing in
                  console.log('Simulating verification for email:', emailForVerification);

                  if (!emailForVerification) {
                    Alert.alert('Test Error', 'No email found for verification.');
                    return;
                  }

                  // For testing, we'll simulate the verification by signing in
                  // In a real scenario, the user would click the email link and be authenticated
                  console.log('Attempting to sign in user for testing...');

                  // Try to sign in (this will fail, but that's expected for testing)
                  const { data, error } = await supabase.auth.signInWithPassword({
                    email: emailForVerification,
                    password: 'test-password-123' // This will fail, but we'll simulate success
                  });

                  if (error) {
                    console.log('Sign-in failed (expected for testing):', error.message);
                    
                    // For testing purposes, we'll simulate a successful verification
                    // In production, this would happen when user clicks the email link
                    console.log('Simulating successful email verification');
                    
                    // Clear verification state and redirect to main app
                    setEmailForVerification(null);
                    router.replace('/(tabs)');
                  } else {
                    console.log('User signed in successfully');
                    setEmailForVerification(null);
                    router.replace('/(tabs)');
                  }

                } catch (error: any) {
                  console.error('Test verification error:', error);
                  Alert.alert('Test Error', error.message);
                }
              }}
            >
              <Text style={styles.testButtonText}>🧪 Simulate Verification</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.testButton, { marginTop: 10, backgroundColor: '#34C759' }]}
              onPress={async () => {
                try {
                  // Test with actual password from signup
                  console.log('Testing with actual signup password for:', emailForVerification);

                  if (!emailForVerification) {
                    Alert.alert('Test Error', 'No email found for verification.');
                    return;
                  }

                  // Prompt user for the password they used during signup
                  Alert.prompt(
                    'Enter Signup Password',
                    'Please enter the password you used during signup to test verification:',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel'
                      },
                      {
                        text: 'Test',
                        onPress: async (password) => {
                          if (!password) {
                            Alert.alert('Error', 'Password is required');
                            return;
                          }

                          try {
                            console.log('Attempting to sign in with provided password...');
                            
                            const { data, error } = await supabase.auth.signInWithPassword({
                              email: emailForVerification,
                              password: password
                            });

                            if (error) {
                              console.log('Sign-in failed:', error.message);
                              Alert.alert('Test Failed', 'Invalid password or user not found');
                            } else {
                              console.log('User signed in successfully:', data.user?.email);
                              setEmailForVerification(null);
                              router.replace('/(tabs)');
                            }
                          } catch (error: any) {
                            console.error('Test error:', error);
                            Alert.alert('Test Error', error.message);
                          }
                        }
                      }
                    ],
                    'secure-text'
                  );

                } catch (error: any) {
                  console.error('Test verification error:', error);
                  Alert.alert('Test Error', error.message);
                }
              }}
            >
              <Text style={styles.testButtonText}>🧪 Test with Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={[styles.helpText, { color: subtitleColor }]}>
            Didn't receive the email? Check your spam folder or try resending.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  backText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Fonts.sizes['3xl'],
    fontFamily: Fonts.avenir.heavy,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Fonts.sizes.lg,
    fontFamily: Fonts.avenir.medium,
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    fontSize: Fonts.sizes.lg,
    fontFamily: Fonts.avenir.heavy,
    marginBottom: 16,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.regular,
    marginBottom: 48,
    textAlign: 'center',
    lineHeight: Fonts.sizes.base * Fonts.lineHeights.normal,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.heavy,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: Fonts.sizes.xl,
    fontFamily: Fonts.avenir.heavy,
    textAlign: 'center',
    letterSpacing: 8,
  },
  statusText: {
    flex: 1,
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.regular,
    textAlign: 'center',
    lineHeight: Fonts.sizes.base * Fonts.lineHeights.normal,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  verifyButtonText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.heavy,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
    textDecorationLine: 'underline',
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.regular,
    textAlign: 'center',
    lineHeight: Fonts.sizes.sm * Fonts.lineHeights.normal,
  },
  testContainer: {
    marginTop: 20,
    alignItems: 'center',
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
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.medium,
  },
});
