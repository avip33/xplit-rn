import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getSupabase } from '@/lib/supabase';
import { useUI } from '@/stores/ui';
import { useRouter } from 'expo-router';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  
  const router = useRouter();
  const { signIn, isSigningIn } = useAuth();
  const { setEmailForVerification } = useUI();

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

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Function to check if user has a profile and route accordingly
  const checkUserProfileAndRoute = async () => {
    try {
      // Check if user has a profile
      const supabase = await getSupabase();
      const { data: hasProfile, error: profileError } = await supabase.rpc('user_has_profile');
      
      if (profileError) {
        console.error('Error checking user profile:', profileError);
        // If we can't check profile, assume they need to create one
        router.replace('/profile-setup');
        return;
      }
      
      if (hasProfile) {
        router.replace('/(tabs)');
      } else {
        router.replace('/profile-setup');
      }
    } catch (error) {
      console.error('Error in checkUserProfileAndRoute:', error);
      // Fallback to profile setup
      router.replace('/profile-setup');
    }
  };

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    if (password.length === 0) {
      Alert.alert('Password Required', 'Please enter your password.');
      return;
    }

    try {
      await signIn({ email, password });
      
      // Check if user has a profile and route accordingly
      checkUserProfileAndRoute();
    } catch (error: any) {
      // Handle specific Supabase errors
      const errorMessage = error.message?.toLowerCase() || '';
      
      if (errorMessage.includes('invalid login credentials') ||
          errorMessage.includes('invalid email or password')) {
        Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
      } else if (errorMessage.includes('email not confirmed') ||
                 errorMessage.includes('email not verified')) {
        Alert.alert('Email Not Verified', 'Please verify your email address before logging in.');
        setEmailForVerification(email);
        router.push('/verification');
      } else {
        Alert.alert('Login Error', error.message || 'Failed to log in. Please try again.');
      }
    }
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
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
        <TouchableOpacity onPress={handleSignup} style={styles.signupLink}>
          <Text style={[styles.signupText, { color: isDarkTheme? Colors.dark.text : Colors.light.text }]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: titleColor }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>Sign in to your Xplit account</Text>

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
              returnKeyType="next"
            />
            {isEmailValid && email.length > 0 && (
              <Icon name="checkmark" size={20} />
            )}
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: subtitleColor }]}>PASSWORD</Text>
          <View style={[
            styles.inputWrapper,
            { 
              backgroundColor: inputBackgroundColor,
              borderColor: inputBorderColor
            }
          ]}>
            <TextInput
              style={[styles.input, { color: inputTextColor }]}
              value={password}
              onChangeText={handlePasswordChange}
              placeholder="Enter your password"
              placeholderTextColor={isDarkTheme ? '#787979' : '#999999'}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Icon name={showPassword ? "eyeOff" : "eye"} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordContainer}>
          <Text style={[styles.forgotPasswordText, { color: Colors.primary }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity 
          onPress={handleLogin} 
          style={[styles.loginButton, { opacity: isSigningIn ? 0.6 : 1 }]}
          disabled={isSigningIn}
        >
          <Text style={styles.loginButtonText}>
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </Text>
          <Icon name="arrowRight" size={16} color="#333" />
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupPromptText, { color: subtitleColor }]}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={[styles.signupLinkText, { color: Colors.primary }]}>
              Sign Up
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
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  signupLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  signupText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
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
  },
  inputContainer: {
    marginBottom: 24,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.medium,
    textDecorationLine: 'underline',
  },
  loginButton: {
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
  loginButtonText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.heavy,
    color: '#333',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupPromptText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.regular,
  },
  signupLinkText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
    textDecorationLine: 'underline',
  },
});
