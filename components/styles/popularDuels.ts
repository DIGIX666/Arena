// components/styles/popularDuels.ts
import { StyleSheet } from 'react-native';
import { borderRadius, colors, spacing, typography } from './designSystem';

export const popularDuelsStyles = StyleSheet.create({
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
  duelCard: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...colors.shadows.soft,
    borderWidth: 1,
    borderColor: colors.surface.elevated,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    minHeight: 70,
  },
  leftSection: {
    flex: 1.5,
    paddingRight: spacing.lg,
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  duelTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  participants: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  prizePot: {
    fontSize: typography.sizes.base,
    color: colors.accent.primary,
    fontWeight: typography.weights.semibold,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadows.subtle,
    borderWidth: 1,
    borderColor: colors.surface.elevated,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
  },
  vs: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginHorizontal: spacing.md,
    fontWeight: typography.weights.medium,
    backgroundColor: colors.background.glass,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  voteButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadows.soft,
  },
  voteButtonPressed: {
    backgroundColor: colors.surface.pressed,
    opacity: 0.9,
  },
  voteButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
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