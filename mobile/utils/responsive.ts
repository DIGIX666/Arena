// utils/responsive.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Standard design dimensions
const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;

// Responsive scaling functions
export const scaleWidth = (size: number) => (width / DESIGN_WIDTH) * size;
export const scaleHeight = (size: number) => (height / DESIGN_HEIGHT) * size;
export const scaleFont = (size: number) => {
  const scale = Math.min(scaleWidth(size), scaleHeight(size));
  return Math.max(scale, size * 0.8); // Minimum scale to prevent too small text
};

// Device breakpoints
export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;

// Enhanced spacing system
export const spacing = {
  xs: Math.max(4, scaleWidth(4)),
  sm: Math.max(8, scaleWidth(8)),
  md: Math.max(12, scaleWidth(12)),
  lg: Math.max(16, scaleWidth(16)),
  xl: Math.max(20, scaleWidth(20)),
  xxl: Math.max(24, scaleWidth(24)),
  xxxl: Math.max(32, scaleWidth(32)),
};

// Enhanced font sizes - Added logo size
export const fontSizes = {
  xs: scaleFont(10),
  sm: scaleFont(12),
  md: scaleFont(14),
  lg: scaleFont(16),
  xl: scaleFont(18),
  xxl: scaleFont(20),
  title: scaleFont(24),
  largeTitle: scaleFont(28),
  logo: scaleFont(32), // Added missing logo size
};

// Border radius system
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};