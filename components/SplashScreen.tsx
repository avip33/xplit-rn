// app/splash.tsx (or wherever this screen lives)
import { Fonts } from '@/constants/Fonts';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function SplashScreen() {
  const router = useRouter();

  // Persist animated values across renders
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Respect users who prefer reduced motion
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion
    );
    return () => sub?.remove?.();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      // Snap to end state without animation
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    } else {
      // Animate the splash screen
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Navigate to onboarding after 2.5s
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, reduceMotion, router]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#007AFF" />
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Xplit</Text>
          <Text style={styles.tagline}>Split expenses, not friendships</Text>
        </View>

        <View style={styles.loadingContainer}>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: Fonts.sizes['5xl'],
    fontFamily: Fonts.avenir.black, // iOS: Avenir-Black, Android: Lato_900Black
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium, // iOS: Avenir-Medium, Android: Lato_700Bold
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.7 },
  dot3: { opacity: 1 },
});
