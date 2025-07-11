// components/home/Header.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../styles/theme';
import { Button } from '../ui/button';
import { Typography } from '../ui/Typography';

interface HeaderProps {
  userName: string;
}

export const Header = React.memo<HeaderProps>(({ userName }) => {
  const handleCreatePress = () => {
    // Handle create action
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Typography variant="h2" color="accent">
            Arena
          </Typography>
        </View>
        
        <View style={styles.rightSection}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Typography variant="caption" color="primary">
                {userName.charAt(0).toUpperCase()}
              </Typography>
            </View>
            <Typography variant="caption" color="primary">
              {userName}
            </Typography>
          </View>
          
          <Button
            title="Create"
            onPress={handleCreatePress}
            size="sm"
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing['2xl'],
    backgroundColor: theme.colors.primary,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
  },
  logoContainer: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.tertiary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});