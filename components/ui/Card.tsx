// components/ui/Card.tsx
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
  style?: ViewStyle;
}

export const Card = React.memo<CardProps>(({ children, variant = 'default', style }) => {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.colors.tertiary,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.surface.elevated,
  },
  default: {
    ...theme.shadows.sm,
  },
  elevated: {
    ...theme.shadows.md,
    backgroundColor: theme.colors.surface.glass,
  },
});