// components/ui/Typography.tsx
import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { theme } from '../styles/theme';
import { typography } from '../styles/typography';

type TypographyVariant = 
  | 'hero' | 'h1' | 'h2' | 'h3' | 'h4'
  | 'large' | 'body' | 'small' | 'caption'
  | 'button' | 'tab' | 'badge';

type ColorVariant = 'primary' | 'secondary' | 'tertiary' | 'accent' | 'white';

interface TypographyProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: ColorVariant;
  weight?: keyof typeof typography.weights;
  style?: TextStyle;
  numberOfLines?: number;
}

export const Typography = React.memo<TypographyProps>(({
  children,
  variant = 'body',
  color = 'primary',
  weight,
  style,
  numberOfLines,
}) => {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        styles[color],
        weight && { fontWeight: typography.weights[weight] },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
});

Typography.displayName = 'Typography';

const styles = StyleSheet.create({
  base: {
    fontFamily: typography.fonts.secondary,
  },
  
  // Heading variants (use primary font)
  hero: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.black,
    lineHeight: typography.sizes.hero * typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h1: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.h1,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.h1 * typography.lineHeights.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  h2: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.h2,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.sizes.h2 * typography.lineHeights.tight,
  },
  h3: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.h3,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.sizes.h3 * typography.lineHeights.normal,
  },
  h4: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.h4,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.h4 * typography.lineHeights.normal,
  },
  
  // Body text variants (use secondary font)
  large: {
    fontSize: typography.sizes.large,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.large * typography.lineHeights.relaxed,
  },
  body: {
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.body * typography.lineHeights.relaxed,
  },
  small: {
    fontSize: typography.sizes.small,
    fontWeight: typography.weights.regular,
    lineHeight: typography.sizes.small * typography.lineHeights.normal,
  },
  caption: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.caption * typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  
  // UI element variants
  button: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.button,
    fontWeight: typography.weights.semibold,
    lineHeight: typography.sizes.button * typography.lineHeights.normal,
  },
  tab: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.tab,
    fontWeight: typography.weights.medium,
    lineHeight: typography.sizes.tab * typography.lineHeights.normal,
  },
  badge: {
    fontFamily: typography.fonts.primary,
    fontSize: typography.sizes.badge,
    fontWeight: typography.weights.bold,
    lineHeight: typography.sizes.badge * typography.lineHeights.normal,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  
  // Color variants
  primary: {
    color: theme.colors.text.primary,
  },
  secondary: {
    color: theme.colors.text.secondary,
  },
  tertiary: {
    color: theme.colors.text.tertiary,
  },
  accent: {
    color: theme.colors.accent.primary,
  },
  white: {
    color: '#FFFFFF',
  },
});