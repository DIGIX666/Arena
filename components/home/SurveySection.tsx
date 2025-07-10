// components/home/SurveySection.tsx
import { ThemedText } from '@/components/ThemedText';
import { ImageBackground, TouchableOpacity, View } from 'react-native';
import { surveySectionStyles } from '../styles/surveySection';

export function SurveySection() {
  return (
    <View style={surveySectionStyles.container}>
      <ThemedText style={surveySectionStyles.title}>Survey</ThemedText>
      
      <View style={surveySectionStyles.surveyCard}>
        <ImageBackground
          source={require('@/assets/images/pic1.jpg')} 
          style={surveySectionStyles.imageBackground}
          imageStyle={surveySectionStyles.imageStyle}
          resizeMode="cover"
        >
          <View style={surveySectionStyles.overlay} />
          
          <View style={surveySectionStyles.badge}>
            <ThemedText style={surveySectionStyles.badgeText}>EARN 10 $PSG</ThemedText>
          </View>
          
          <View style={surveySectionStyles.textContent}>
            <ThemedText style={surveySectionStyles.mainText}>
              Win 10 $PSG TOKEN{'\n'}by taking this quiz
            </ThemedText>
          </View>
          
          <View style={surveySectionStyles.bottomRight}>
            <TouchableOpacity style={surveySectionStyles.answerButton} activeOpacity={0.8}>
              <ThemedText style={surveySectionStyles.answerText}>Answer {'>'}</ThemedText>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}