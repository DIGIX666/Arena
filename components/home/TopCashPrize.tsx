// components/home/TopCashPrize.tsx
import { ThemedText } from '@/components/ThemedText';
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { topCashPrizeStyles } from '../styles/topCashPrize';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 80; // Account for padding

const prizeData = [
  {
    id: 1,
    league: 'Champions League',
    amount: '$ 26,000',
    label: 'Total Prize Pool',
  },
  {
    id: 2,
    league: 'Premier League',
    amount: '$ 18,500',
    label: 'Weekly Prize',
  },
  {
    id: 3,
    league: 'La Liga',
    amount: '$ 15,200',
    label: 'Monthly Reward',
  },
];

export function TopCashPrize() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={topCashPrizeStyles.container}>
      <ThemedText style={topCashPrizeStyles.title}>
        Top Cash Prize Arenas
      </ThemedText>
      
      <View style={topCashPrizeStyles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {prizeData.map((prize, index) => (
            <View
              key={prize.id}
              style={[
                topCashPrizeStyles.prizeCard,
                { width: CARD_WIDTH },
                activeIndex === index && topCashPrizeStyles.activeCard,
              ]}
            >
              <ThemedText style={topCashPrizeStyles.leagueTitle}>
                {prize.league}
              </ThemedText>
              <ThemedText style={topCashPrizeStyles.prizeAmount}>
                {prize.amount}
              </ThemedText>
              <ThemedText style={topCashPrizeStyles.prizeLabel}>
                {prize.label}
              </ThemedText>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Dots Indicator */}
      <View style={topCashPrizeStyles.dotsContainer}>
        {prizeData.map((_, index) => (
          <View
            key={index}
            style={[
              topCashPrizeStyles.dot,
              activeIndex === index && topCashPrizeStyles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}