import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export const GlassCard = ({ children, style, intensity = 20 }: GlassCardProps) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme.border, backgroundColor: theme.cardBackground }, style]}>
      {Platform.OS !== 'web' ? (
        <BlurView intensity={intensity} tint={theme.isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      ) : null}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    // On web, backdropFilter can be used in style if supported, or just fallback to opacity
  },
  content: {
    zIndex: 1,
  },
});
