// app/(tabs)/index.tsx - ScrollView Alternative
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/home/Header';
import { PopularDuels } from '@/components/home/PopularDuels';
import { SurveySection } from '@/components/home/SurveySection';
import { TopCashPrize } from '@/components/home/TopCashPrize';
import { theme } from '@/components/styles/theme';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet } from 'react-native';

const HomeScreen = React.memo(() => {
  return (
    <ThemedView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.primary} 
        translucent={false}
      />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        <Header userName="user777" />
        <SurveySection />
        <TopCashPrize />
        <PopularDuels />
      </ScrollView>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing['6xl'],
  },
});

export default HomeScreen;