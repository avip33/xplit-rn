import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useAuth } from '@/hooks/useAuth';
import { useCreateProfile } from '@/hooks/useProfile';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useToast } from '@/hooks/useToast';
import { useUI } from '@/stores/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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

export default function ProfileSetup() {
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isCheckingHandle, setIsCheckingHandle] = useState(false);
  const [handleError, setHandleError] = useState('');
  
  const router = useRouter();
  const { user } = useAuth();
  const { setIsLoading, setProfileExists } = useUI();
  const createProfile = useCreateProfile();
  const toast = useToast();

  // Theme-aware colors
  const backgroundColor = useThemeColor({}, 'background') as string;
  const isDarkTheme = backgroundColor === Colors.dark.background;
  
  const titleColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const descriptionColor = isDarkTheme ? '#E6E6E6' : '#666666';
  const inputBackgroundColor = isDarkTheme ? '#2A2A2A' : '#F5F5F5';
  const inputTextColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const placeholderColor = isDarkTheme ? '#999999' : '#999999';

  // Handle validation
  const validateHandle = (value: string) => {
    const handleRegex = /^[a-z0-9._-]{2,30}$/;
    if (!handleRegex.test(value)) {
      return 'Handle must be 2-30 characters, lowercase letters, numbers, dots, underscores, or hyphens only';
    }
    return '';
  };

  const handleHandleChange = (value: string) => {
    const lowerValue = value.toLowerCase();
    setHandle(lowerValue);
    setHandleError('');
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Authentication Error', 'User not authenticated');
      return;
    }

    // Validate inputs
    const handleValidationError = validateHandle(handle);
    if (handleValidationError) {
      setHandleError(handleValidationError);
      return;
    }

    if (!displayName.trim()) {
      toast.error('Validation Error', 'Please enter a display name');
      return;
    }

    setIsLoading(true);
    try {
      await createProfile.mutateAsync({
        handle: handle.trim(),
        displayName: displayName.trim()
      });
      
      toast.success('Profile Created!', 'Your profile has been successfully created.');
      setProfileExists(true);
      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error: any) {
      // Handle all possible handle-related errors
      const errorMessage = error.message?.toLowerCase() || '';
      const errorCode = error.code || '';
      
      const isHandleTaken = 
        error.message === 'Handle is taken' ||
        errorMessage.includes('handle') && errorMessage.includes('taken') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('duplicate key') ||
        errorMessage.includes('unique constraint') ||
        errorCode === '23505' || // PostgreSQL unique constraint violation
        errorMessage.includes('violates unique constraint');
      
      if (isHandleTaken) {
        setHandleError('This handle is already taken. Please choose another one.');
      } else {
        // For other errors, show a generic user-friendly message
        toast.error('Profile Creation Failed', 'Unable to create profile. Please try again.');
        console.error('Profile creation error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: titleColor }]}>Create Your Profile</Text>
          <Text style={[styles.description, { color: descriptionColor }]}>
            Choose a unique handle and display name to get started
          </Text>
        </View>

        <View style={styles.form}>
          {/* Handle Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: titleColor }]}>Handle</Text>
            <View style={[styles.inputContainer, { backgroundColor: inputBackgroundColor }]}>
              <Text style={[styles.handlePrefix, { color: descriptionColor }]}>@</Text>
              <TextInput
                style={[styles.input, { color: inputTextColor }]}
                value={handle}
                onChangeText={handleHandleChange}
                placeholder="your-handle"
                placeholderTextColor={placeholderColor}
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={30}
                editable={!isCheckingHandle}
              />
            </View>
            {handleError ? (
              <Text style={styles.errorText}>{handleError}</Text>
            ) : (
              <Text style={[styles.helperText, { color: descriptionColor }]}>
                This will be your unique identifier and cannot be changed later
              </Text>
            )}
          </View>

          {/* Display Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: titleColor }]}>Display Name</Text>
            <TextInput
              style={[styles.input, styles.fullInput, { 
                backgroundColor: inputBackgroundColor,
                color: inputTextColor 
              }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your Name"
              placeholderTextColor={placeholderColor}
              autoCapitalize="words"
              maxLength={50}
            />
            <Text style={[styles.helperText, { color: descriptionColor }]}>
              This is how others will see your name
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[
              styles.submitButton,
              (!handle.trim() || !displayName.trim() || isCheckingHandle) && styles.submitButtonDisabled
            ]}
            disabled={!handle.trim() || !displayName.trim() || isCheckingHandle}
          >
            <Text style={styles.submitButtonText}>
              {createProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
            </Text>
            {!createProfile.isPending && (
              <Icon name="arrowRight" size={16} color="#333" />
            )}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: Fonts.sizes['2xl'],
    fontFamily: Fonts.avenir.heavy,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
    textAlign: 'center',
    lineHeight: Fonts.sizes.base * Fonts.lineHeights.normal,
    maxWidth: 300,
  },
  form: {
    flex: 1,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.heavy,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  handlePrefix: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
  },
  fullInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.medium,
  },
  helperText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.avenir.medium,
  },
  footer: {
    marginTop: 40,
  },
  submitButton: {
    backgroundColor: '#FFCA62',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.heavy,
    color: '#333',
  },
});
