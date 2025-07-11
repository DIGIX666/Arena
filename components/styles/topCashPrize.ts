// components/styles/topCashPrize.ts
import { StyleSheet } from 'react-native';
import { borderRadius, colors, spacing, typography } from './designSystem';

export const topCashPrizeStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing['4xl'],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    marginBottom: spacing['2xl'],
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  carouselContainer: {
    height: 200,
  },
  prizeCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing['3xl'],
    marginHorizontal: spacing.sm,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surface.elevated,
    ...colors.shadows.elevated,
  },
  activeCard: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.background.glass,
    ...colors.shadows.glow,
  },
  leagueTitle: {
    fontSize: typography.sizes.lg,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  prizeAmount: {
    fontSize: typography.sizes['4xl'],
    color: colors.accent.primary,
    fontWeight: typography.weights.heavy,
    textAlign: 'center',
    letterSpacing: -1,
  },
  prizeLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    fontWeight: typography.weights.medium,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.lg,
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