import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { useColorScheme } from '../hooks/useColorScheme';
import { useToast } from '../hooks/useToast';

export const ToastExample: React.FC = () => {
  const toast = useToast();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleShowSuccess = () => {
    toast.success('Success!', 'Your action was completed successfully.');
  };

  const handleShowError = () => {
    toast.error('Error!', 'Something went wrong. Please try again.');
  };

  const handleShowInfo = () => {
    toast.info('Info', 'Here is some important information for you.');
  };

  const handleShowWarning = () => {
    toast.warning('Warning!', 'Please be careful with this action.');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.dark.background : Colors.light.background }]}>
      <Text style={[styles.title, { color: isDark ? Colors.dark.text : Colors.light.text }]}>
        Toast Examples
      </Text>
      
      <TouchableOpacity style={[styles.button, styles.successButton]} onPress={handleShowSuccess}>
        <Text style={styles.buttonText}>Show Success Toast</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={handleShowError}>
        <Text style={styles.buttonText}>Show Error Toast</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={handleShowInfo}>
        <Text style={styles.buttonText}>Show Info Toast</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={handleShowWarning}>
        <Text style={styles.buttonText}>Show Warning Toast</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.avenir.heavy,
    fontSize: Fonts.sizes['2xl'],
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  infoButton: {
    backgroundColor: '#3B82F6',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  buttonText: {
    fontFamily: Fonts.avenir.medium,
    fontSize: Fonts.sizes.base,
    color: '#FFFFFF',
  },
});
