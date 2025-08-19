// constants/Fonts.ts
import { Platform } from 'react-native';

export const Fonts = {
  // Cross‑platform family mapping: Avenir (iOS) ↔ Lato (Android)
  avenir: {
    light: Platform.select({
      ios: 'Avenir-Light',
      android: 'Lato_300Light',
      default: 'Avenir-Light',
    }),
    regular: Platform.select({
      ios: 'Avenir',
      android: 'Lato_400Regular',
      default: 'Avenir',
    }),
    // Lato has no 500/“Medium”; 700 Bold is the closest visual weight
    medium: Platform.select({
      ios: 'Avenir-Medium',
      android: 'Lato_700Bold',
      default: 'Avenir-Medium',
    }),
    heavy: Platform.select({
      ios: 'Avenir-Heavy',
      android: 'Lato_900Black',
      default: 'Avenir-Heavy',
    }),
    black: Platform.select({
      ios: 'Avenir-Black',
      android: 'Lato_900Black',
      default: 'Avenir-Black',
    }),
  },

  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};
