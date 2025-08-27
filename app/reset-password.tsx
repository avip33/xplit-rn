import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getSupabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
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

type Stage = 'waitingLink' | 'form' | 'success';

function parseFragment(url: string | null) {
  if (!url) return null;
  const hash = url.includes('#') ? url.split('#')[1] : '';
  if (!hash) return null;
  const params = Object.fromEntries(
    hash.split('&').map(kv => {
      const [k, v] = kv.split('=');
      return [decodeURIComponent(k), decodeURIComponent(v ?? '')];
    })
  );
  if (!params['access_token']) return null;
  return {
    access_token: params['access_token'] as string,
    refresh_token: (params['refresh_token'] as string) || '',
  };
}

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [stage, setStage] = useState<Stage>('waitingLink');
  const [error, setError] = useState<string | null>(null);

  const processedRef = useRef(false);
  const router = useRouter();

  // theme
  const backgroundColor = useThemeColor({}, 'background') as string;
  const isDarkTheme = backgroundColor === '#0a0a0a' || backgroundColor === Colors.dark.background;
  const titleColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const subtitleColor = isDarkTheme ? '#E6E6E6' : '#666666';
  const inputBackgroundColor = isDarkTheme ? Colors.dark.neutral[500] : Colors.light.neutral[200];
  const inputTextColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const inputBorderColor = isDarkTheme ? Colors.dark.neutral[400] : Colors.light.neutral[400];

  // 👇 expo-router parses query params for us (PKCE path)
  const params = useLocalSearchParams<{ token?: string | string[]; code?: string | string[] }>();
  const pick = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

  // Handle deep link: PKCE first (query params), then legacy fragment
  useEffect(() => {
    let sub: { remove: () => void } | null = null;

    const tryPkce = async (codeOrToken: string) => {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.exchangeCodeForSession(codeOrToken);
      if (error) throw error;
      setStage('form'); // session is active, show form
    };

    const tryFragment = async (url: string | null) => {
      const frag = parseFragment(url);
      if (!frag) return false;
      const supabase = await getSupabase();
      const { error } = await supabase.auth.setSession({
        access_token: frag.access_token,
        refresh_token: frag.refresh_token ?? '',
      });
      if (error) throw error;
      setStage('form');
      return true;
    };

    const handleUrl = async (url: string | null) => {
      if (processedRef.current) return;
      try {
        // 1) Prefer PKCE query param on the incoming URL
        if (url) {
          const { queryParams } = Linking.parse(url);
          const pkce = (queryParams?.token as string) || (queryParams?.code as string);
          if (pkce) {
            processedRef.current = true;
            await tryPkce(pkce);
            return;
          }
        }
        // 2) Fall back to fragment style
        const ok = await tryFragment(url);
        if (ok) {
          processedRef.current = true;
          return;
        }
        // If neither present, keep waitingLink stage
      } catch (e: any) {
        processedRef.current = true;
        setError(e?.message ?? 'Could not open reset link.');
      }
    };

    // Fast path: if expo-router already gave us ?token or ?code, do it now
    const firstParam = pick(params.token) || pick(params.code);
    if (firstParam && !processedRef.current) {
      processedRef.current = true;
      tryPkce(firstParam).catch((e) => setError(e?.message ?? 'Could not open reset link.'));
    }

    // Cold start + warm start
    Linking.getInitialURL().then(handleUrl);
    sub = Linking.addEventListener('url', (ev) => handleUrl(ev.url));

    return () => sub?.remove?.();
  }, [params.token, params.code]);

  // validators
  const validatePassword = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&_-]{8,}$/.test(pwd);
  const validateConfirmPassword = (cp: string) => cp === password && cp.length > 0;

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setIsPasswordValid(text.length === 0 ? true : validatePassword(text));
    if (confirmPassword.length > 0) setIsConfirmPasswordValid(validateConfirmPassword(confirmPassword));
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setIsConfirmPasswordValid(text.length === 0 ? true : validateConfirmPassword(text));
  };

  const handleResetPassword = async () => {
    if (!validatePassword(password)) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.'
      );
      return;
    }
    if (!validateConfirmPassword(confirmPassword)) {
      Alert.alert("Passwords Don't Match", 'Please make sure both passwords match.');
      return;
    }

    setIsResetting(true);
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStage('success');

      // Optional: sign out so they must log in with the new password
      // await supabase.auth.signOut();

      setTimeout(() => router.replace('/login'), 2500);
    } catch (e: any) {
      Alert.alert('Reset Error', e?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackToLogin = () => router.replace('/login');

  // --- UI ---

  if (stage === 'waitingLink') {
    return (
      <View style={styles.center}>
        <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
        {!error ? (
          <>
            <Text style={styles.waitingTitle}>Opening secure reset link…</Text>
            <Text style={styles.waitingText}>If nothing happens, open the reset email again.</Text>
          </>
        ) : (
          <>
            <Text style={[styles.waitingTitle, { color: '#FF3B30' }]}>{error}</Text>
            <TouchableOpacity onPress={() => router.replace('/forgot-password')}>
              <Text style={[styles.waitingText, { textDecorationLine: 'underline', color: Colors.primary }]}>
                Try again
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  if (stage === 'success') {
    return (
      <KeyboardAvoidingView style={[styles.container, { backgroundColor }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.successContainer}>
            <View style={[styles.successIconContainer, { backgroundColor: inputBackgroundColor }]}>
              <Icon name="checkmark" size={48} color={Colors.primary} />
            </View>
            <Text style={[styles.successTitle, { color: titleColor }]}>Password Reset Successfully</Text>
            <Text style={[styles.successSubtitle, { color: subtitleColor }]}>
              Your password has been updated. You can now sign in with your new password.
            </Text>
            <TouchableOpacity onPress={handleBackToLogin} style={styles.backToLoginButton}>
              <Text style={[styles.backToLoginText, { color: '#333' }]}>Continue to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // stage === 'form'
  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
          <Icon name="arrowLeft" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: titleColor }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>Enter your new password below</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: subtitleColor }]}>NEW PASSWORD</Text>
          <View style={[styles.inputWrapper, { backgroundColor: inputBackgroundColor, borderColor: isPasswordValid ? inputBorderColor : '#FF6B6B' }]}>
            <TextInput
              style={[styles.input, { color: inputTextColor }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter new password"
              placeholderTextColor={isDarkTheme ? '#787979' : '#999999'}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onChange={e => {
                const text = (e.nativeEvent?.text ?? password);
                setPassword(text);
                setIsPasswordValid(text.length === 0 ? true : validatePassword(text));
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eyeOff' : 'eye'} size={20} />
            </TouchableOpacity>
          </View>
          {!isPasswordValid && password.length > 0 && (
            <Text style={styles.errorText}>Password must be at least 8 characters with uppercase, lowercase, and number</Text>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: subtitleColor }]}>CONFIRM PASSWORD</Text>
          <View style={[styles.inputWrapper, { backgroundColor: inputBackgroundColor, borderColor: isConfirmPasswordValid ? inputBorderColor : '#FF6B6B' }]}>
            <TextInput
              style={[styles.input, { color: inputTextColor }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={isDarkTheme ? '#787979' : '#999999'}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onChange={e => {
                const text = (e.nativeEvent?.text ?? confirmPassword);
                setConfirmPassword(text);
                setIsConfirmPasswordValid(text.length === 0 ? true : text === password);
              }}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon name={showConfirmPassword ? 'eyeOff' : 'eye'} size={20} />
            </TouchableOpacity>
          </View>
          {!isConfirmPasswordValid && confirmPassword.length > 0 && <Text style={styles.errorText}>Passwords don't match</Text>}
        </View>

        <TouchableOpacity onPress={handleResetPassword} style={[styles.resetButton, { opacity: isResetting ? 0.6 : 1 }]} disabled={isResetting}>
          <Text style={styles.resetButtonText}>{isResetting ? 'Updating...' : 'Update Password'}</Text>
          <Icon name="arrowRight" size={16} color="#333" />
        </TouchableOpacity>

        <View style={styles.backToLoginContainer}>
          <Text style={[styles.backToLoginPromptText, { color: subtitleColor }]}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={[styles.backToLoginLinkText, { color: Colors.primary }]}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  waitingTitle: { fontSize: Fonts.sizes['2xl'], fontFamily: Fonts.avenir.heavy, textAlign: 'center' },
  waitingText: { fontSize: Fonts.sizes.base, fontFamily: Fonts.avenir.medium, textAlign: 'center', marginTop: 8 },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  backButton: { padding: 8 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },
  title: { fontSize: Fonts.sizes['4xl'], fontFamily: Fonts.avenir.heavy, marginBottom: 8 },
  subtitle: { fontSize: Fonts.sizes.lg, fontFamily: Fonts.avenir.medium, marginBottom: 48, lineHeight: 24 },
  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.avenir.heavy, marginBottom: 8, textTransform: 'uppercase' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderRadius: 12, borderWidth: 1 },
  input: { flex: 1, fontSize: Fonts.sizes.base, fontFamily: Fonts.avenir.regular, marginRight: 12 },
  errorText: { fontSize: Fonts.sizes.sm, fontFamily: Fonts.avenir.regular, color: '#FF6B6B', marginTop: 8, marginLeft: 4 },
  resetButton: { backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, marginBottom: 32, gap: 8 },
  resetButtonText: { fontSize: Fonts.sizes.base, fontFamily: Fonts.avenir.heavy, color: '#333' },
  backToLoginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  backToLoginPromptText: { fontSize: Fonts.sizes.base, fontFamily: Fonts.avenir.regular },
  backToLoginLinkText: { fontSize: Fonts.sizes.base, fontFamily: Fonts.avenir.medium, textDecorationLine: 'underline' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  successIconContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 32, backgroundColor: '#F2F2F2' },
  successTitle: { fontSize: Fonts.sizes['3xl'], fontFamily: Fonts.avenir.heavy, marginBottom: 16, textAlign: 'center' },
  successSubtitle: { fontSize: Fonts.sizes.base, fontFamily: Fonts.avenir.medium, textAlign: 'center', lineHeight: 24, marginBottom: 32, paddingHorizontal: 20 },
  backToLoginButton: { backgroundColor: Colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12 },
  backToLoginText: { fontSize: Fonts.sizes.base, fontFamily: Fonts.avenir.heavy, color: '#333' },
});
