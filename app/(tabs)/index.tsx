// app/(tabs)/index.tsx
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/home/Header';
import { PopularDuels } from '@/components/home/PopularDuels';
import { SurveySection } from '@/components/home/SurveySection';
import { TopCashPrize } from '@/components/home/TopCashPrize';
import { colors, spacing } from '@/components/styles';
import { ScrollView, StatusBar, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background.primary} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        decelerationRate="normal"
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
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing['6xl'],
  },
  bottomPadding: {
    height: spacing['6xl'],
    backgroundColor: colors.background.primary,
  },
});