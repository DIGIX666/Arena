// components/styles/theme.ts
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base theme configuration
export const theme = {
  // Colors - Single source of truth
  colors: {
    primary: '#0D1117',
    secondary: '#161B22',
    tertiary: '#21262D',
    surface: {
      elevated: 'rgba(255, 255, 255, 0.08)',
      pressed: 'rgba(255, 255, 255, 0.12)',
      glass: 'rgba(255, 255, 255, 0.06)',
      overlay: 'rgba(0, 0, 0, 0.4)',
    },
    text: {
      primary: '#F0F6FC',
      secondary: '#B1BAC4',
      tertiary: '#8B949E',
    },
    accent: {
      primary: '#58A6FF',
      success: '#3FB950',
      warning: '#D29922',
      danger: '#F85149',
    },
    gradients: {
      primary: ['#58A6FF', '#4C9EF8'],
      teal: ['#39D0D8', '#2DD4DA'],
    },
  },

  // Typography system
  typography: {
    sizes: {
      xs: 11,
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 34,
    },
    weights: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      heavy: '800' as const,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
    },
  },

  // Consistent spacing scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
  },

  // Consistent border radius
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 20,
    full: 9999,
  },

  // Standardized shadows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 10,
    },
    glow: {
      shadowColor: '#58A6FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
  },

  // Screen dimensions
  dimensions: {
    screenWidth,
    screenHeight,
    isSmallScreen: screenWidth < 375,
    cardWidth: screenWidth - 40,
  },
};

export type Theme = typeof theme;