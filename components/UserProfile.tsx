import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

interface UserProfileProps {
  username?: string;
  avatar?: ImageSourcePropType;
  xp?: number;
  balance?: string;
  currency?: string;
  nextLevelXP?: number;
  arenasInProgress?: number;
  duelsInProgress?: number;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  username = "USER777", 
  avatar, 
  xp = 3452, 
  balance = "4.433,43",
  currency = "CHZ",
  nextLevelXP = 7477,
  arenasInProgress = 5,
  duelsInProgress = 3
}) => {
  return (
    <LinearGradient
      colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
      style={styles.container}
    >
      {/* Header avec username */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>⚽ {username}</Text>
          <View style={styles.actionButtons}>
            <Text style={styles.depositButton}>Deposit +</Text>
            <Text style={styles.withdrawButton}>Withdraw -</Text>
          </View>
        </View>
      </View>

      {/* Avatar 3D */}
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={avatar} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>3D</Text>
          </View>
        )}
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        {/* XP Circle */}
        <View style={styles.xpSection}>
          <View style={styles.xpCircle}>
            <Text style={styles.xpValue}>{xp}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
          <Text style={styles.nextLevelText}>NEXT LEVEL IN</Text>
          <Text style={styles.nextLevelXP}>{nextLevelXP.toLocaleString()} XP</Text>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceValue}>${balance}</Text>
          <Text style={styles.balanceSubtext}>98 074,51 {currency}</Text>
          <View style={styles.trendLine} />
          <Text style={styles.viewStats}>View all stats {'>'}</Text>
        </View>
      </View>

      {/* Progress Cards */}
      <View style={styles.progressContainer}>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Arenas In progress</Text>
          <Text style={styles.progressNumber}>{arenasInProgress}</Text>
          <Text style={styles.viewAll}>View All {'>'}</Text>
        </View>
        
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Duels In progress</Text>
          <Text style={styles.progressNumber}>{duelsInProgress}</Text>
          <Text style={styles.viewAll}>View All {'>'}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.large,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  depositButton: {
    color: theme.colors.accent,
    fontSize: theme.fonts.sizes.medium,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    borderRadius: theme.borderRadius.small,
    textAlign: 'center',
  },
  withdrawButton: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.medium,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.white,
    borderRadius: theme.borderRadius.small,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  avatar: {
    width: 200,
    height: 300,
    resizeMode: 'contain',
  },
  avatarPlaceholder: {
    width: 200,
    height: 300,
    backgroundColor: theme.colors.darkGray,
    borderRadius: theme.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.huge,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  xpSection: {
    alignItems: 'center',
  },
  xpCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  xpValue: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.xlarge,
    fontWeight: 'bold',
  },
  xpLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.sizes.medium,
  },
  nextLevelText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.sizes.small,
    marginBottom: theme.spacing.xs,
  },
  nextLevelXP: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.medium,
    fontWeight: 'bold',
  },
  balanceSection: {
    alignItems: 'flex-end',
  },
  balanceValue: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.xlarge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  balanceSubtext: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.sizes.small,
    marginBottom: theme.spacing.sm,
  },
  trendLine: {
    width: 100,
    height: 20,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.sm,
  },
  viewStats: {
    color: theme.colors.accent,
    fontSize: theme.fonts.sizes.small,
    textDecorationLine: 'underline',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  progressCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  progressTitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.sizes.small,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  progressNumber: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.huge,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  viewAll: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.sizes.small,
  },
});

export default UserProfile;