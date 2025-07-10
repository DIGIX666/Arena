// components/home/TopCashPrize.tsx
import { ThemedText } from '@/components/ThemedText';
import { View } from 'react-native';
import { topCashPrizeStyles } from '../styles/topCashPrize';

export function TopCashPrize() {
  return (
    <View style={topCashPrizeStyles.container}>
      <ThemedText style={topCashPrizeStyles.title}>Top Cash Prize Arenas</ThemedText>
      
      <View style={topCashPrizeStyles.prizeCard}>
        <ThemedText style={topCashPrizeStyles.cardTitle}>Champions Leagues</ThemedText>
        <ThemedText style={topCashPrizeStyles.prizeAmount}>$ 26,000</ThemedText>
      </View>
      
      <View style={topCashPrizeStyles.dotsContainer}>
        <View style={topCashPrizeStyles.dot} />
        <View style={[topCashPrizeStyles.dot, topCashPrizeStyles.activeDot]} />
        <View style={topCashPrizeStyles.dot} />
      </View>
    </View>
  );
}