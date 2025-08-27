import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getSupabase } from '@/lib/supabase';
import { useUI } from '@/stores/ui';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
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
  
  const router = useRouter();
  const { emailForVerification, setEmailForVerification } = useUI();

  // Theme-aware colors
  const backgroundColor = useThemeColor({}, 'background') as string;
  const isDarkTheme = backgroundColor === Colors.dark.background;
  
  const titleColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const subtitleColor = isDarkTheme ? '#E6E6E6' : '#666666';
  const inputBackgroundColor = isDarkTheme ? Colors.dark.neutral[500] : Colors.light.neutral[200];
  const inputTextColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const inputBorderColor = isDarkTheme ? Colors.dark.neutral[400] : Colors.light.neutral[400];

  // Simple redirect if no email stored
  useEffect(() => {
    if (!emailForVerification) {
      router.replace('/signup');
    }
  }, [emailForVerification, router]);

  // Don't render anything if no email is stored
  if (!emailForVerification) {
    return null;
  }

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailForVerification!,
        options: { emailRedirectTo: 'xplit://callback' }
      });
      
      if (error) throw error;
      
      Alert.alert('Email Resent', 'A new verification email has been sent to your inbox.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };



  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />
      


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

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={[styles.helpText, { color: subtitleColor }]}>
            Didn't receive the email? Check your spam folder or try resending.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={handleResendCode} disabled={isResending}>
            <Text style={[styles.actionText, { color: Colors.primary }]}>
              {isResending ? 'Resending...' : 'Resend Email'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
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
    alignItems: 'center',
    marginTop: 32,
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
