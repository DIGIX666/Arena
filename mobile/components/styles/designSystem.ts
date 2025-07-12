// components/styles/designSystem.ts
export const colors = {
  background: {
    primary: '#0D1117', // Rich dark navy
    secondary: '#161B22', // Slightly lighter navy
    tertiary: '#21262D', // Card backgrounds
    glass: 'rgba(255, 255, 255, 0.06)', // Subtle glass effect
    blur: 'rgba(13, 17, 23, 0.85)', // Backdrop blur
  },
  text: {
    primary: '#F0F6FC', // Crisp white
    secondary: '#B1BAC4', // Muted text
    tertiary: '#8B949E', // Supporting text
    accent: '#58A6FF', // iOS blue accent
  },
  accent: {
    primary: '#58A6FF', // iOS blue
    secondary: '#A5A5FF', // Soft purple
    success: '#3FB950', // Modern green
    warning: '#D29922', // Warm amber
    danger: '#F85149', // Vibrant red
    gradient: {
      blue: ['#58A6FF', '#4C9EF8'],
      purple: ['#A5A5FF', '#9A9BFF'],
      teal: ['#39D0D8', '#2DD4DA'],
    },
  },
  surface: {
    elevated: 'rgba(255, 255, 255, 0.08)',
    pressed: 'rgba(255, 255, 255, 0.12)',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  shadows: {
    subtle: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    glow: {
      shadowColor: '#58A6FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 10,
    },
  },
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 41,
  },
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
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
};

export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};