// components/styles/common.ts
import { StyleSheet } from 'react-native';
import { borderRadius, colors, spacing, typography } from './designSystem';

export const commonStyles = StyleSheet.create({
  // Layout containers
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['4xl'],
  },
  
  // Typography
  heading1: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    lineHeight: typography.sizes['3xl'] * typography.lineHeights.tight,
    letterSpacing: -0.5,
  },
  heading2: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    lineHeight: typography.sizes['2xl'] * typography.lineHeights.tight,
    letterSpacing: -0.3,
  },
  heading3: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  bodyLarge: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.normal,
    color: colors.text.secondary,
    lineHeight: typography.sizes.lg * typography.lineHeights.normal,
  },
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
    color: colors.text.secondary,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  caption: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    color: colors.text.tertiary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  
  // Cards with modern styling
  card: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.surface.elevated,
    ...colors.shadows.soft,
  },
  cardElevated: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.surface.elevated,
    ...colors.shadows.elevated,
  },
  
  // Modern buttons with elegant corners
  buttonPrimary: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg, // Changed from full to lg for modern look
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadows.soft,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg, // Changed from full to lg
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.accent.primary,
  },
  buttonPressed: {
    backgroundColor: colors.surface.pressed,
    opacity: 0.9,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  
  // Interactive elements
  touchableOpacity: {
    opacity: 1,
  },
  
  // Modern carousel dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background.tertiary,
    opacity: 0.5,
  },
  activeDot: {
    backgroundColor: colors.accent.primary,
    width: 20,
    opacity: 1,
  },
});