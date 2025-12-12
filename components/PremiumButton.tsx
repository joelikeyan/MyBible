import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: React.ReactNode;
  loading?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const PremiumButton = ({ title, onPress, style, variant = 'primary', icon, loading }: PremiumButtonProps) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getColors = () => {
    if (variant === 'primary') return [theme.accent, '#A08020']; // Gold Gradient
    if (variant === 'secondary') return [theme.cardBackground, theme.cardBackground];
    return ['transparent', 'transparent'];
  };

  return (
    <AnimatedTouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading}
      style={[
        styles.container,
        variant === 'outline' && { borderWidth: 1, borderColor: theme.accent },
        style,
        animatedStyle
      ]}
    >
      <LinearGradient
        colors={getColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {loading ? (
          <ActivityIndicator color={theme.text} />
        ) : (
          <>
            {icon}
            <ThemedText
              variant="label"
              style={[
                styles.text,
                { color: variant === 'primary' ? '#000' : theme.text },
                icon ? { marginLeft: 8 } : {}
              ]}
            >
              {title}
            </ThemedText>
          </>
        )}
      </LinearGradient>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 50,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
