// components/home/SurveySection.tsx
import { ThemedText } from '@/components/ThemedText';
import { spacing } from '@/utils/responsive';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';

export function SurveySection() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Survey</ThemedText>
      
      <View style={styles.surveyCard}>
        <ImageBackground
          source={require('@/assets/images/pic1.jpg')} 
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
          
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>EARN 10 $PSG</ThemedText>
          </View>
          
          <View style={styles.textContent}>
            <ThemedText style={styles.mainText}>
              Win 10 $PSG TOKEN{'\n'}by taking this quiz
            </ThemedText>
          </View>
          
          <View style={styles.bottomRight}>
            <TouchableOpacity style={styles.answerButton} activeOpacity={0.8}>
              <ThemedText style={styles.answerText}>Answer {'>'}</ThemedText>
            </TouchableOpacity>
          </View>
        </ImageBackground>
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
  surveyCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    height: 180,
    justifyContent: 'space-between',
  },
  imageStyle: {
    borderRadius: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  badge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: '#007AFF',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    zIndex: 2,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  textContent: {
    position: 'absolute',
    top: '50%',
    left: spacing.lg,
    right: spacing.lg,
    transform: [{ translateY: -20 }],
    zIndex: 2,
  },
  mainText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomRight: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    zIndex: 2,
  },
  answerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});