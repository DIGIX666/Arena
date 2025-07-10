// styles/topCashPrize.ts
import { spacing } from '@/utils/responsive';
import { StyleSheet } from 'react-native';

export const topCashPrizeStyles = StyleSheet.create({
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
  prizeCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    minHeight: 160,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: '#A0AEC0',
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontWeight: '500',
  },
  prizeAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4299E1',
    textAlign: 'center',
    letterSpacing: 1,
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