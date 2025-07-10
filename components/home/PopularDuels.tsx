// components/home/PopularDuels.tsx
import { ThemedText } from '@/components/ThemedText';
import { spacing } from '@/utils/responsive';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

export function PopularDuels() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Popular Duels</ThemedText>
      
      {/* Duel Card */}
      <View style={styles.duelCard}>
        <View style={styles.cardContent}>
          <View style={styles.leftSection}>
            <ThemedText style={styles.duelTitle}>PSG WINNER</ThemedText>
            <ThemedText style={styles.participants}>1655 participants</ThemedText>
            <ThemedText style={styles.prizePot}>Pot $ 19,433</ThemedText>
          </View>
          
          <View style={styles.rightSection}>
            <View style={styles.teamsContainer}>
              {/* Chelsea Logo */}
              <View style={styles.teamLogoContainer}>
                <Image 
                  source={require('@/assets/images/logo-chelsea.png')}
                  style={styles.teamLogo}
                  resizeMode="cover" // Changed from contain to cover
                />
              </View>
              
              <ThemedText style={styles.vs}>VS</ThemedText>
              
              {/* PSG Logo */}
              <View style={styles.teamLogoContainer}>
                <Image 
                  source={require('@/assets/images/psg-logo.png')}
                  style={styles.teamLogo}
                  resizeMode="cover" // Changed from contain to cover
                />
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.voteButton} activeOpacity={0.8}>
          <ThemedText style={styles.voteButtonText}>Vote in this duel {'>'}</ThemedText>
        </TouchableOpacity>
      </View>
      
      {/* Carousel dots */}
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
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
    overflow: 'hidden', // This ensures the image fills the circle
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  teamLogo: {
    width: 50, // Match container width
    height: 50, // Match container height
    borderRadius: 25, // Make the image itself circular
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