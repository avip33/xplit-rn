import { Icon } from '@/components/ui/Icon';
import { Colors } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useUI } from '@/stores/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingScreen {
  title: string;
  description: string;
  image?: string; // We'll add images later
}

const onboardingScreens: OnboardingScreen[] = [
  {
    title: 'Split Bills Painlessly',
    description: 'Simply input an amount of money spent, select who participated in the expense and let the app do all work.',
  },
  {
    title: 'Create Groups',
    description: 'Organize your expenses by creating groups for different occasions - roommates, trips, events, and more.',
  },
  {
    title: 'Track & Settle',
    description: 'Keep track of who owes what and settle up with just a few taps. No more awkward money conversations.',
  },
];

export default function Onboarding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const { setOnboardingDone } = useUI();

  // Theme-aware colors
  const backgroundColor = useThemeColor({}, 'background') as string;
  const isDarkTheme = backgroundColor === Colors.dark.background;
  
  // Use appropriate text colors for better readability
  const titleColor = isDarkTheme ? '#FFFFFF' : '#333333';
  const descriptionColor = isDarkTheme ? '#E6E6E6' : '#666666';

  const handleNext = () => {
    if (currentIndex < onboardingScreens.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Mark onboarding as complete and navigate to signup screen
      setOnboardingDone(true);
      router.push('/signup');
    }
  };

  const handleSkip = () => {
    // Mark onboarding as complete and navigate to signup screen
    setOnboardingDone(true);
    router.push('/signup');
  };

  const handleLogin = () => {
    // Mark onboarding as complete and navigate to login screen
    setOnboardingDone(true);
    router.push('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} />
      
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        scrollEnabled={false}
        contentOffset={{ x: currentIndex * width, y: 0 }}
      >
        {onboardingScreens.map((screen, index) => (
          <View key={index} style={styles.screen}>
            {/* Background Image Area */}
            <View style={[styles.backgroundArea, { backgroundColor }]}>
              {index === 0 ? (
                <ImageBackground 
                  source={require('@/assets/images/onboarding/onboarding1.png')} 
                  style={styles.backgroundImage}
                  resizeMode="cover"
                >
                  {/* Login Button */}
                  <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Log In</Text>
                  </TouchableOpacity>
                </ImageBackground>
              ) : index === 1 ? (
                <ImageBackground 
                  source={require('@/assets/images/onboarding/onboarding2.png')} 
                  style={styles.backgroundImage}
                  resizeMode="cover"
                >
                  {/* Login Button */}
                  <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Log In</Text>
                  </TouchableOpacity>
                </ImageBackground>
              ) : index === 2 ? (
                <ImageBackground 
                  source={require('@/assets/images/onboarding/onboarding3.png')} 
                  style={styles.backgroundImage}
                  resizeMode="cover"
                >
                  {/* Login Button */}
                  <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Log In</Text>
                  </TouchableOpacity>
                </ImageBackground>
              ) : (
                <View style={styles.backgroundPlaceholder}>
                  <Text style={styles.backgroundPlaceholderText}>Background Image</Text>
                  
                  {/* Login Button */}
                  <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
                    <Text style={styles.loginButtonText}>Log In</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Curved Content Container */}
            <View style={[styles.curvedContainer, { backgroundColor }]}>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: titleColor }]}>{screen.title}</Text>
                <Text style={[styles.description, { color: descriptionColor }]}>{screen.description}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor }]}>
        <View style={styles.footerContent}>
          <View style={styles.pagination}>
            {onboardingScreens.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { backgroundColor: isDarkTheme ? '#787979' : '#ddd' },
                  index === currentIndex && { backgroundColor: isDarkTheme ? '#E6E6E6' : '#333' },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>
              {currentIndex === onboardingScreens.length - 1 ? 'Get Started!' : 'Next'}
            </Text>
            <Icon name="arrowRight" size={16} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    width,
    flex: 1,
  },
  backgroundArea: {
    height: height * 0.6,
    position: 'relative',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  backgroundPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  backgroundPlaceholderText: {
    color: '#fff',
    fontSize: 16,
  },
  loginButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
  },
  curvedContainer: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 30,
    marginTop: -50,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 300,
    alignSelf: 'center',
  },
  title: {
    fontSize: Fonts.sizes['3xl'],
    fontFamily: Fonts.avenir.heavy,
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.medium,
    textAlign: 'center',
    lineHeight: Fonts.sizes.base * Fonts.lineHeights.normal,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#FFCA62',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    fontSize: Fonts.sizes.base,
    fontFamily: Fonts.avenir.heavy,
    color: '#333',
  },
  arrowIcon: {
    fontSize: Fonts.sizes.base,
    color: '#333',
    marginLeft: 8,
  },
});
