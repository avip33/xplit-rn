import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ForgotPasswordContent />
    </>
  );
}

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const router = useRouter();
  const { resetPassword, isResettingPassword } = useAuth();

  // Theme-aware colors
  const backgroundColor = useThemeColor({}, 'background') as string;
  const isDarkTheme = backgroundColor === Colors.dark.background;
  
  const titleColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const subtitleColor = isDarkTheme ? '#E6E6E6' : '#666666';
  const inputBackgroundColor = isDarkTheme ? Colors.dark.neutral[500] : Colors.light.neutral[200];
  const inputTextColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const inputBorderColor = isDarkTheme ? Colors.dark.neutral[400] : Colors.light.neutral[400];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text.length > 0) {
      setIsEmailValid(validateEmail(text));
    } else {
      setIsEmailValid(true);
    }
  };

  const handleResetPassword = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      await resetPassword({ email });
      setIsSubmitted(true);
    } catch (error: any) {
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('user not found')) {
        Alert.alert('User Not Found', 'No account found with this email address.');
      } else {
        Alert.alert('Reset Error', error.message || 'Failed to send reset email. Please try again.');
      }
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  const handleResendEmail = () => {
    setIsSubmitted(false);
    setEmail('');
  };

  if (isSubmitted) {
    return (
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />
        


        {/* Success Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successContainer}>
                       <View style={[styles.successIconContainer, { backgroundColor: inputBackgroundColor }]}>
             <Icon name="checkmark" size={48} color={Colors.primary} />
           </View>
            
            <Text style={[styles.successTitle, { color: titleColor }]}>
              Check Your Email
            </Text>
            
            <Text style={[styles.successSubtitle, { color: subtitleColor }]}>
              We've sent a password reset link to:
            </Text>
            
            <Text style={[styles.emailText, { color: Colors.primary }]}>
              {email}
            </Text>
            
            <Text style={[styles.instructionsText, { color: subtitleColor }]}>
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </Text>

            <TouchableOpacity 
              onPress={handleResendEmail} 
              style={styles.resendButton}
            >
              <Text style={[styles.resendButtonText, { color: Colors.primary }]}>
                Resend Email
              </Text>
            </TouchableOpacity>

                         <TouchableOpacity 
               onPress={handleBackToLogin} 
             >
               <Text style={[styles.backToLoginText, { color: subtitleColor }]}>
                 Back to Login
               </Text>
             </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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
        <Text style={[styles.title, { color: titleColor }]}>Forgot Password</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          Enter your email address and we'll send you a link to reset your password
        </Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: subtitleColor }]}>EMAIL</Text>
          <View style={[
            styles.inputWrapper,
            { 
              backgroundColor: inputBackgroundColor,
              borderColor: isEmailValid ? inputBorderColor : '#FF6B6B'
            }
          ]}>
            <TextInput
              style={[styles.input, { color: inputTextColor }]}
              value={email}
              onChangeText={handleEmailChange}
              placeholder="Enter your email"
              placeholderTextColor={isDarkTheme ? '#787979' : '#999999'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            {isEmailValid && email.length > 0 && (
              <Icon name="checkmark" size={20} />
            )}
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity 
          onPress={handleResetPassword} 
          style={[styles.resetButton, { opacity: isResettingPassword ? 0.6 : 1 }]}
          disabled={isResettingPassword}
        >
          <Text style={styles.resetButtonText}>
            {isResettingPassword ? 'Sending...' : 'Send Reset Link'}
          </Text>
          <Icon name="arrowRight" size={16} color="#333" />
        </TouchableOpacity>

        {/* Back to Login */}
        <View style={styles.backToLoginContainer}>
          <Text style={[styles.backToLoginPromptText, { color: subtitleColor }]}>
            Remember your password?{' '}
          </Text>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={[styles.backToLoginLinkText, { color: Colors.primary }]}>
              Back to Login
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
    paddingTop: 140,
    paddingBottom: 40,
    flexGrow: 1,
  },
  title: {
    fontSize: Fonts.sizes['4xl'],
    fontFamily: Fonts.avenir.heavy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Fonts.sizes.lg,
    fontFamily: Fonts.avenir.medium,
    marginBottom: 48,
    lineHeight: 24,
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
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.regular,
    marginRight: 12,
  },
  resetButton: {
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
  resetButtonText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.heavy,
    color: '#333',
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginPromptText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.regular,
  },
  backToLoginLinkText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
    textDecorationLine: 'underline',
  },
  // Success state styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: Fonts.sizes['3xl'],
    fontFamily: Fonts.avenir.heavy,
    marginBottom: 16,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.heavy,
    marginBottom: 24,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
    textDecorationLine: 'underline',
  },
  backToLoginText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
  },
});
