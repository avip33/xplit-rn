import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Toast, { BaseToast, ErrorToast, ToastConfig } from 'react-native-toast-message';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useColorScheme } from '../../hooks/useColorScheme';

const { width } = Dimensions.get('window');

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={[styles.baseToast, styles.successToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={[styles.baseToast, styles.errorToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={[styles.baseToast, styles.infoToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
  warning: (props) => (
    <BaseToast
      {...props}
      style={[styles.baseToast, styles.warningToast]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
    />
  ),
};

const styles = StyleSheet.create({
  baseToast: {
    width: width - 32,
    marginHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  successToast: {
    backgroundColor: Colors.light.neutral[100],
    borderLeftColor: '#10B981', // Green
  },
  errorToast: {
    backgroundColor: Colors.light.neutral[100],
    borderLeftColor: '#EF4444', // Red
  },
  infoToast: {
    backgroundColor: Colors.light.neutral[100],
    borderLeftColor: '#3B82F6', // Blue
  },
  warningToast: {
    backgroundColor: Colors.light.neutral[100],
    borderLeftColor: '#F59E0B', // Amber
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text1: {
    fontFamily: Fonts.avenir.medium,
    fontSize: Fonts.sizes.base,
    color: Colors.light.text,
    marginBottom: 4,
  },
  text2: {
    fontFamily: Fonts.avenir.regular,
    fontSize: Fonts.sizes.sm,
    color: Colors.light.neutral[500],
    lineHeight: Fonts.sizes.sm * Fonts.lineHeights.normal,
  },
});

// Dark mode styles
const darkStyles = StyleSheet.create({
  baseToast: {
    width: width - 32,
    marginHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successToast: {
    backgroundColor: Colors.dark.neutral[500],
    borderLeftColor: '#10B981', // Green
  },
  errorToast: {
    backgroundColor: Colors.dark.neutral[500],
    borderLeftColor: '#EF4444', // Red
  },
  infoToast: {
    backgroundColor: Colors.dark.neutral[500],
    borderLeftColor: '#3B82F6', // Blue
  },
  warningToast: {
    backgroundColor: Colors.dark.neutral[500],
    borderLeftColor: '#F59E0B', // Amber
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  text1: {
    fontFamily: Fonts.avenir.medium,
    fontSize: Fonts.sizes.base,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  text2: {
    fontFamily: Fonts.avenir.regular,
    fontSize: Fonts.sizes.sm,
    color: Colors.dark.neutral[300],
    lineHeight: Fonts.sizes.sm * Fonts.lineHeights.normal,
  },
});

export const CustomToast: React.FC = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const currentStyles = isDark ? darkStyles : styles;

  const toastConfigWithTheme: ToastConfig = {
    success: (props) => (
      <BaseToast
        {...props}
        style={[currentStyles.baseToast, currentStyles.successToast]}
        contentContainerStyle={currentStyles.contentContainer}
        text1Style={currentStyles.text1}
        text2Style={currentStyles.text2}
      />
    ),
    error: (props) => (
      <ErrorToast
        {...props}
        style={[currentStyles.baseToast, currentStyles.errorToast]}
        contentContainerStyle={currentStyles.contentContainer}
        text1Style={currentStyles.text1}
        text2Style={currentStyles.text2}
      />
    ),
    info: (props) => (
      <BaseToast
        {...props}
        style={[currentStyles.baseToast, currentStyles.infoToast]}
        contentContainerStyle={currentStyles.contentContainer}
        text1Style={currentStyles.text1}
        text2Style={currentStyles.text2}
      />
    ),
    warning: (props) => (
      <BaseToast
        {...props}
        style={[currentStyles.baseToast, currentStyles.warningToast]}
        contentContainerStyle={currentStyles.contentContainer}
        text1Style={currentStyles.text1}
        text2Style={currentStyles.text2}
      />
    ),
  };

  return <Toast config={toastConfigWithTheme} />;
};

// Utility functions for easy toast usage
export const showToast = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },
  error: (title: string, message?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 5000,
      autoHide: true,
      topOffset: 60,
    });
  },
  info: (title: string, message?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },
  warning: (title: string, message?: string) => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },
};

export default CustomToast;
