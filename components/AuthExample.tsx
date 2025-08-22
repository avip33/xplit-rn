import { useAuth, useSignIn, useSignOut, useSignUp } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useUI } from '@/stores/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function AuthExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Auth hooks
  const { data: user, isLoading: authLoading } = useAuth();
  const signIn = useSignIn();
  const signUp = useSignUp();
  const signOut = useSignOut();
  const router = useRouter();

  // Profile hooks
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id || undefined);
  const updateProfile = useUpdateProfile();

  // UI state
  const { isLoading, theme } = useUI();

  const handleSignIn = async () => {
    try {
      await signIn.mutateAsync({ email, password });
      Alert.alert('Success', 'Signed in successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp.mutateAsync({ email, password });
      Alert.alert('Success', 'Account created! Please check your email.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut.mutateAsync();
      Alert.alert('Success', 'Signed out successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to login page after signout
            router.replace('/login');
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: { full_name: fullName }
      });
      Alert.alert('Success', 'Profile updated!');
      setFullName('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth & Profile Example</Text>
      
      {!user ? (
        // Sign in/up form
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // User profile
        <View style={styles.profile}>
          <Text style={styles.subtitle}>Welcome, {user?.email || 'User'}!</Text>
          
          {profile && (
            <View style={styles.profileInfo}>
              <Text>Full Name: {profile.full_name || 'Not set'}</Text>
              <Text>Created: {new Date(profile.created_at).toLocaleDateString()}</Text>
            </View>
          )}
          
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Update full name"
              value={fullName}
              onChangeText={setFullName}
            />
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleUpdateProfile}
              disabled={updateProfile.isPending}
            >
              <Text style={styles.buttonText}>
                {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing out...' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <Text style={styles.themeInfo}>Current theme: {theme}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  profile: {
    flex: 1,
  },
  profileInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  themeInfo: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});
