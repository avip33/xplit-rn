import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const [email, setEmail] = useState('lehieuds@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  
  const router = useRouter();

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

  const handleSignup = () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('Password Too Short', 'Password must be at least 8 characters long.');
      return;
    }

    // TODO: Integrate with Supabase
    console.log('Signup with:', { email, password });
    Alert.alert('Success', 'Account created successfully!');
    router.replace('/(tabs)');
  };

  const handleLogin = () => {
    // TODO: Navigate to login screen
    console.log('Navigate to login');
  };

  const handleTermsOfUse = () => {
    Linking.openURL('https://example.com/terms');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy');
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
        <TouchableOpacity onPress={handleLogin} style={styles.loginLink}>
          <Text style={[styles.loginText, { color: isDarkTheme? Colors.dark.text : Colors.light.text }]}>Log In</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: titleColor }]}>Signup</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>Welcome to Xplit!</Text>

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

        {/* Signup Button */}
        <TouchableOpacity onPress={handleSignup} style={styles.signupButton}>
          <Text style={styles.signupButtonText}>Join Xplit!</Text>
          <Icon name="arrowRight" size={16} color="#333" />
        </TouchableOpacity>

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text style={[styles.termsText, { color: subtitleColor }]}>
            By clicking Join Xplit, you are agreeing to the
          </Text>
          <View style={styles.linksContainer}>
            <Text style={[styles.linkText, { color: Colors.primary }]} onPress={handleTermsOfUse}>
              Terms of Use
            </Text>
            <Text style={[styles.termsText, { color: subtitleColor }]}> and the </Text>
            <Text style={[styles.linkText, { color: Colors.primary }]} onPress={handlePrivacyPolicy}>
              Privacy Policy
            </Text>
          </View>
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
    justifyContent: 'center',
  },
  loginLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loginText: {
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
  signupButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
    gap: 8,
  },
  signupButtonText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.heavy,
    color: '#333',
  },
  termsContainer: {
    alignItems: 'center',
  },
  linksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  termsText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.regular,
    textAlign: 'center',
    lineHeight: Fonts.sizes.sm * Fonts.lineHeights.normal,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontFamily: Fonts.avenir.medium,
  },
});
