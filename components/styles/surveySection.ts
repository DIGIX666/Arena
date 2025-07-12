// components/styles/surveySection.ts
import { StyleSheet } from 'react-native';
import { borderRadius, colors, spacing, typography } from './designSystem';

export const surveySectionStyles = StyleSheet.create({
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
  surveyCard: {
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...colors.shadows.elevated,
    borderWidth: 1,
    borderColor: colors.surface.elevated,
  },
  imageBackground: {
    width: '100%',
    height: 220,
    justifyContent: 'space-between',
  },
  imageStyle: {
    borderRadius: borderRadius['2xl'],
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.blur,
  },
  badge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.accent.gradient.teal[0],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    zIndex: 2,
    ...colors.shadows.soft,
  },
  badgeText: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.5,
  },
  textContent: {
    position: 'absolute',
    top: '50%',
    left: spacing.lg,
    right: spacing.lg,
    transform: [{ translateY: -25 }],
    zIndex: 2,
  },
  mainText: {
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bottomRight: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    zIndex: 2,
  },
  answerButton: {
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  answerButtonPressed: {
    backgroundColor: colors.surface.pressed,
    opacity: 0.9,
  },
  answerText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
});