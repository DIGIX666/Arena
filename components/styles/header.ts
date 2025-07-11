// components/styles/header.ts
import { StyleSheet } from 'react-native';
import { borderRadius, colors, spacing, typography } from './designSystem';

export const headerStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.background.primary,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 64,
  },
  logoContainer: {
    flex: 1,
    paddingRight: spacing.lg,
  },
  logoImage: {
    width: 140,
    height: 48,
    tintColor: colors.accent.primary,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.surface.elevated,
    ...colors.shadows.subtle,
  },
  profileIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  profileText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  userName: {
    color: colors.text.primary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  createButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadows.soft,
  },
  createButtonPressed: {
    backgroundColor: colors.surface.pressed,
    opacity: 0.9,
  },
  createButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
});