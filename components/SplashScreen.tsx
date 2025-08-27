// app/splash.tsx (or wherever this screen lives)
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useUI } from '../stores/ui';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { user, isInitialized, isLoading } = useAuth();
  const { onboardingDone } = useUI();
  
  // Animation values
  const logoScale = new Animated.Value(0.8);
  const logoOpacity = new Animated.Value(0);
  const textOpacity = new Animated.Value(0);
  const dotOpacity = new Animated.Value(0);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate text after logo
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate loading dots
    Animated.sequence([
      Animated.delay(800),
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Don't proceed if still loading or not initialized
    if (isLoading || !isInitialized) return;

    const checkUserProfileAndRoute = async () => {
      try {
        if (user) {
          // For now, just redirect to tabs if user is authenticated
          // We'll add profile checking later once the basic flow works
          router.replace('/(tabs)');
        } else {
          // User is not authenticated
          if (onboardingDone) {
            router.replace('/login');
          } else {
            router.replace('/onboarding');
          }
        }
      } catch (error) {
        console.error('Error in routing logic:', error);
        // Fallback routing
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/onboarding');
        }
      }
    };

    // Add a small delay to show the splash screen
    const timer = setTimeout(checkUserProfileAndRoute, 2000);

    return () => clearTimeout(timer);
  }, [isInitialized, isLoading, user, onboardingDone, router]);

  return (
    <ThemedView style={styles.container}>
      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logo}>
          <ThemedText style={styles.logoText}>Xplit</ThemedText>
        </View>
      </Animated.View>

      {/* App Name */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
        <ThemedText style={styles.appName}>Welcome to Xplit</ThemedText>
        <ThemedText style={styles.tagline}>Split expenses with friends</ThemedText>
      </Animated.View>

      {/* Loading Dots */}
      <Animated.View style={[styles.loadingContainer, { opacity: dotOpacity }]}>
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </Animated.View>

      {/* Fallback loading indicator */}
      {isLoading && (
        <View style={styles.fallbackContainer}>
          <ThemedText style={styles.fallbackText}>Loading...</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#007AFF',
  },
  dot1: {
    animationDelay: '0ms',
  },
  dot2: {
    animationDelay: '200ms',
  },
  dot3: {
    animationDelay: '400ms',
  },
  fallbackContainer: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  fallbackText: {
    fontSize: 18,
    color: '#888',
  },
});
