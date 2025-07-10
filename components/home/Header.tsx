// components/home/Header.tsx
import { ThemedText } from '@/components/ThemedText';
import { spacing } from '@/utils/responsive';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

export function Header({ userName = "user777" }: { userName?: string }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* BETFI Logo */}
          <View style={styles.logoContainer}>
            <ThemedText style={styles.logo}>BETFI</ThemedText>
          </View>
          
          {/* User Profile & Button */}
          <View style={styles.rightSection}>
            <View style={styles.userInfo}>
              <View style={styles.profileIcon}>
                <ThemedText style={styles.profileText}>👤</ThemedText>
              </View>
              <ThemedText style={styles.userName}>
                {userName}
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.createButton} activeOpacity={0.8}>
              <ThemedText style={styles.createButtonText}>
                + Create Your Duel
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#151B23',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    backgroundColor: '#151B23',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    minHeight: 80,
    paddingTop: spacing.md,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  profileText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.8)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 25,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});