// styles/popularDuels.ts
import { spacing } from '@/utils/responsive';
import { StyleSheet } from 'react-native';

export const popularDuelsStyles = StyleSheet.create({
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
  duelCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    minHeight: 80,
  },
  leftSection: {
    flex: 1,
    paddingRight: spacing.lg,
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  duelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  participants: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: spacing.xs,
  },
  prizePot: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  vs: {
    fontSize: 12,
    color: '#A0AEC0',
    marginHorizontal: spacing.md,
    fontWeight: '600',
  },
  voteButton: {
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
  voteButtonText: {
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