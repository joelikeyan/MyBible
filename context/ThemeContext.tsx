import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ColorValue } from 'react-native';

export type ThemeType = 'classicDark' | 'parchment' | 'celestial' | 'cleanWhite';

export interface ThemeColors {
  background: ColorValue;
  cardBackground: ColorValue; // Usually used with glass effect
  text: ColorValue;
  textSecondary: ColorValue;
  accent: ColorValue; // Gold/Primary
  border: ColorValue;
  navigationBar: ColorValue;
  tabIconActive: ColorValue;
  tabIconInactive: ColorValue;
  inputBackground: ColorValue;
  success: ColorValue;
  isDark: boolean;
}

const themes: Record<ThemeType, ThemeColors> = {
  classicDark: {
    background: '#121212',
    cardBackground: 'rgba(30, 30, 30, 0.7)',
    text: '#E0E0E0',
    textSecondary: '#A0A0A0',
    accent: '#D4AF37', // Gold
    border: 'rgba(255, 255, 255, 0.1)',
    navigationBar: '#1A1A1A',
    tabIconActive: '#D4AF37',
    tabIconInactive: '#666666',
    inputBackground: 'rgba(255, 255, 255, 0.1)',
    success: '#4CAF50',
    isDark: true,
  },
  parchment: {
    background: '#F5E6CA', // Parchment color
    cardBackground: 'rgba(255, 250, 240, 0.6)',
    text: '#3E2723',
    textSecondary: '#5D4037',
    accent: '#8D6E63', // Antique Brown
    border: 'rgba(62, 39, 35, 0.1)',
    navigationBar: '#EFE0C0',
    tabIconActive: '#3E2723',
    tabIconInactive: '#8D6E63',
    inputBackground: 'rgba(62, 39, 35, 0.05)',
    success: '#388E3C',
    isDark: false,
  },
  celestial: {
    background: '#1A0B2E', // Deep Purple
    cardBackground: 'rgba(45, 20, 80, 0.6)',
    text: '#E6E6FA', // Lavender
    textSecondary: '#B39DDB',
    accent: '#FFD700', // Gold
    border: 'rgba(255, 255, 255, 0.15)',
    navigationBar: '#130822',
    tabIconActive: '#FFD700',
    tabIconInactive: '#7B68EE',
    inputBackground: 'rgba(255, 255, 255, 0.1)',
    success: '#00E676',
    isDark: true,
  },
  cleanWhite: {
    background: '#FFFFFF',
    cardBackground: 'rgba(245, 245, 245, 0.8)',
    text: '#212121',
    textSecondary: '#757575',
    accent: '#1976D2', // Modern Blue
    border: 'rgba(0, 0, 0, 0.05)',
    navigationBar: '#F5F5F5',
    tabIconActive: '#1976D2',
    tabIconInactive: '#BDBDBD',
    inputBackground: '#F0F0F0',
    success: '#2E7D32',
    isDark: false,
  },
};

interface ThemeContextType {
  theme: ThemeColors;
  themeType: ThemeType;
  setTheme: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeType, setThemeType] = useState<ThemeType>('classicDark');

  const value = {
    theme: themes[themeType],
    themeType,
    setTheme: setThemeType,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
