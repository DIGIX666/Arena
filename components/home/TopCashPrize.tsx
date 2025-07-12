// components/home/TopCashPrize.tsx
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { theme } from '../styles/theme';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';

const CARD_WIDTH = theme.dimensions.cardWidth;

const prizeData = [
  { id: 1, league: 'Champions League', amount: '$ 26,000', label: 'Total Prize Pool' },
  { id: 2, league: 'Premier League', amount: '$ 18,500', label: 'Weekly Prize' },
  { id: 3, league: 'La Liga', amount: '$ 15,200', label: 'Monthly Reward' },
];

export const TopCashPrize = React.memo(() => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <Typography variant="h2" style={styles.title}>
        Top Cash Prize Arenas
      </Typography>
      
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={styles.scrollContent}
        >
          {prizeData.map((prize, index) => (
            <Card
              key={prize.id}
              variant={activeIndex === index ? 'elevated' : 'default'}
              style={Object.assign(
                {},
                styles.prizeCard,
                { width: CARD_WIDTH },
                activeIndex === index ? styles.activeCard : undefined
              )}
            >
              <Typography variant="body" color="secondary" style={styles.leagueTitle}>
                {prize.league}
              </Typography>
              <Typography variant="h1" color="accent" style={styles.prizeAmount}>
                {prize.amount}
              </Typography>
              <Typography variant="caption" color="tertiary" style={styles.prizeLabel}>
                {prize.label}
              </Typography>
            </Card>
          ))}
        </ScrollView>
      </View>

      <View style={styles.dotsContainer}>
        {prizeData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index && styles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
});

TopCashPrize.displayName = 'TopCashPrize';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing['4xl'],
  },
  title: {
    marginBottom: theme.spacing['2xl'],
  },
  carouselContainer: {
    height: 200,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  prizeCard: {
    marginHorizontal: theme.spacing.sm,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCard: {
    borderColor: theme.colors.accent.primary,
    ...theme.shadows.glow,
  },
  leagueTitle: {
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  prizeAmount: {
    textAlign: 'center',
    letterSpacing: -1,
  },
  prizeLabel: {
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.tertiary,
    opacity: 0.5,
  },
  activeDot: {
    backgroundColor: theme.colors.accent.primary,
    width: 20,
    opacity: 1,
  },
});