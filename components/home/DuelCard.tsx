import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { fontSizes, isSmallDevice, spacing } from '@/utils/responsive';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface DuelCardProps {
  title: string;
  participants: number;
  prizePot: string;
  team1: string;
  team2: string;
}

export function DuelCard({ title, participants, prizePot, team1, team2 }: DuelCardProps) {
  return (
    <ThemedView style={styles.card}>
      <View style={styles.cardContent}>
        {/* Left side - Info */}
        <View style={styles.leftSection}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.participants}>
            {participants.toLocaleString()} participants
          </ThemedText>
          <ThemedText style={styles.prizePot}>
            {prizePot}
          </ThemedText>
        </View>
        
        {/* Right side - Teams */}
        <View style={styles.rightSection}>
          <View style={styles.teamsContainer}>
            <View style={styles.teamLogo}>
              <ThemedText style={styles.teamText}>{team1}</ThemedText>
            </View>
            <ThemedText style={styles.vs}>VS</ThemedText>
            <View style={styles.teamLogo}>
              <ThemedText style={styles.teamText}>{team2}</ThemedText>
            </View>
          </View>
        </View>
      </View>
      
      {/* Vote button */}
      <TouchableOpacity style={styles.voteButton} activeOpacity={0.8}>
        <ThemedText style={styles.voteButtonText}>Vote in this duel {'>'}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    minHeight: 60,
  },
  leftSection: {
    flex: 1,
    paddingRight: spacing.md,
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: spacing.xs,
  },
  participants: {
    fontSize: fontSizes.sm,
    color: '#cccccc',
    marginBottom: spacing.xs,
  },
  prizePot: {
    fontSize: fontSizes.lg,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: isSmallDevice ? 35 : 40,
    height: isSmallDevice ? 35 : 40,
    borderRadius: isSmallDevice ? 17.5 : 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    color: 'white',
  },
  vs: {
    fontSize: fontSizes.xs,
    color: '#cccccc',
    marginHorizontal: spacing.sm,
    fontWeight: 'bold',
  },
  voteButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  voteButtonText: {
    color: '#007AFF',
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});