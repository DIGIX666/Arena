// components/home/TopCashPrize.tsx
import { ThemedText } from '@/components/ThemedText';
import { spacing } from '@/utils/responsive';
import { StyleSheet, View } from 'react-native';

export function TopCashPrize() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Top Cash Prize Arenas</ThemedText>
      
      <View style={styles.prizeCard}>
        <ThemedText style={styles.cardTitle}>Champions Leagues</ThemedText>
        <ThemedText style={styles.prizeAmount}>$ 26,000</ThemedText>
      </View>
      
      {/* Carousel dots */}
      <View style={styles.dotsContainer}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: '#4299E1', // Blue color like in image
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