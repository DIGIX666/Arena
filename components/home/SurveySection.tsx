// components/home/SurveySection.tsx
import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import { Animated, ImageBackground, StyleSheet, View } from 'react-native';
import { theme } from '../styles/theme';
import { Button } from '../ui/button';
import { Typography } from '../ui/Typography';

export const SurveySection = React.memo(() => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleAnswerPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    router.push('/(tabs)/explore');
  };

  return (
    <View style={styles.container}>
      <Typography variant="h2" style={styles.title}>
        🎯 Survey
      </Typography>
      
      <View style={styles.card}>
        <ImageBackground
          source={require('@/assets/images/pic1.jpg')}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
        >
          <View style={styles.overlay} />
          
          <View style={styles.badge}>
            <Typography variant="caption" color="primary" style={styles.badgeText}>
              💰 EARN 10 $PSG
            </Typography>
          </View>
          
          <View style={styles.textContent}>
            <Typography variant="h3" color="primary" style={styles.mainText}>
              🏆 Win 10 $PSG TOKEN{'\n'}by taking this quiz
            </Typography>
          </View>
          
          <View style={styles.buttonContainer}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Button
                title="Answer ⚡"
                onPress={handleAnswerPress}
                size="sm"
              />
            </Animated.View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
});

SurveySection.displayName = 'SurveySection';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing['4xl'],
  },
  title: {
    marginBottom: theme.spacing['2xl'],
  },
  card: {
    borderRadius: theme.radius['2xl'],
    overflow: 'hidden',
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.surface.elevated,
  },
  imageBackground: {
    width: '100%',
    height: 200,
    justifyContent: 'space-between',
  },
  imageStyle: {
    borderRadius: theme.radius['2xl'],
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 17, 23, 0.7)',
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    backgroundColor: theme.colors.gradients.teal[0],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    zIndex: 2,
  },
  badgeText: {
    letterSpacing: 0.5,
  },
  textContent: {
    position: 'absolute',
    top: '50%',
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    transform: [{ translateY: -25 }],
    zIndex: 2,
  },
  mainText: {
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 2,
  },
});