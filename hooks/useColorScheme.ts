import { useThemeContext } from './useThemeContext';

export function useColorScheme() {
  const { theme } = useThemeContext();
  return theme;
}
