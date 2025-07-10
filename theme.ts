export const theme = {
  colors: {
    primary: '#1a237e',
    secondary: '#3f51b5',
    background: '#0a0e27',
    gradientStart: '#1a237e',
    gradientEnd: '#0a0e27',
    accent: '#2196f3',
    success: '#4caf50',
    warning: '#ff9800',
    white: '#ffffff',
    gray: '#9e9e9e',
    lightGray: '#e0e0e0',
    darkGray: '#424242',
    text: '#ffffff',
    textSecondary: '#b0bec5',
  },
  fonts: {
    regular: 'System',
    bold: 'System',
    sizes: {
      small: 12,
      medium: 16,
      large: 20,
      xlarge: 24,
      xxlarge: 32,
      huge: 48,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    small: 8,
    medium: 16,
    large: 24,
    circle: 50,
  }
} as const;

export type Theme = typeof theme;
