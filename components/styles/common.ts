// styles/common.ts
import { spacing } from '@/utils/responsive';
import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    backgroundColor: '#151B23',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.lg,
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: 'rgba(66, 153, 225, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(66, 153, 225, 0.4)',
  },
  buttonText: {
    color: '#4299E1',
    fontSize: 14,
    fontWeight: '600',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A5568',
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#4299E1',
    width: 8,
    height: 8,
  },
});