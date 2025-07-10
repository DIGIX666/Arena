// app/(tabs)/index.tsx
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/home/Header';
import { PopularDuels } from '@/components/home/PopularDuels';
import { SurveySection } from '@/components/home/SurveySection';
import { TopCashPrize } from '@/components/home/TopCashPrize';
import { spacing } from '@/utils/responsive';
import { ScrollView, StatusBar, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#151B23" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <Header userName="user777" />
        <SurveySection />
        <TopCashPrize />
        <PopularDuels />
        <ThemedView style={styles.bottomPadding} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#151B23', // Dark blue background like in image
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#151B23',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  bottomPadding: {
    height: spacing.xxxl,
    backgroundColor: '#151B23',
  },
});