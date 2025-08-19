/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1E1F20', // Dark Jungle Green
    background: '#FFFFFF', // White
    tint: tintColorLight,
    icon: '#787979', // Sonic Silver
    tabIconDefault: '#787979', // Sonic Silver
    tabIconSelected: tintColorLight,
    primary: '#FFCA62',
    // Neutral palette
    neutral: {
      100: '#FFFFFF', // White
      200: '#F9F9F9', // White smoke
      300: '#F0F0F0', // Isabelline
      400: '#E0E0E0', // Platinum
      500: '#787979', // Sonic Silver
      600: '#1E1F20', // Dark Jungle Green
    },
  },
  dark: {
    text: '#FFFFFF', // White
    background: '#141415', // Licorice
    tint: tintColorDark,
    icon: '#E6E6E6', // Platinum E6
    tabIconDefault: '#787979', // Sonic Silver
    tabIconSelected: tintColorDark,
    primary: '#FFCA62',
    // Neutral palette
    neutral: {
      100: '#FFFFFF', // White
      200: '#E6E6E6', // Platinum E6
      300: '#787979', // Sonic Silver
      400: '#313133', // Jet
      500: '#212122', // Raisin Black
      600: '#1B1B1C', // Eerie Black
      700: '#141415', // Licorice
    },
  },
  primary: '#FFCA62',
};
