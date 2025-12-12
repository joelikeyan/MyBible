import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label' | 'verse';
  color?: string; // Override color
  serif?: boolean; // Force serif for scripture
}

export const ThemedText = ({ style, variant = 'body', color, serif, ...props }: ThemedTextProps) => {
  const { theme } = useTheme();

  const getStyle = () => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'caption':
        return styles.caption;
      case 'label':
        return styles.label;
      case 'verse':
        return styles.verse;
      default:
        return styles.body;
    }
  };

  const fontFamily = serif ? 'Georgia' : undefined; // Simple fallback to Georgia for serif/Scripture feel

  return (
    <Text
      style={[
        getStyle(),
        { color: color || theme.text, fontFamily },
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    opacity: 0.7,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  verse: {
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '400',
  },
});
