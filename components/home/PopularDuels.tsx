// components/home/PopularDuels.tsx
import { ThemedText } from '@/components/ThemedText';
import { Image, TouchableOpacity, View } from 'react-native';
import { popularDuelsStyles } from '../styles/popularDuels';

export function PopularDuels() {
  return (
    <View style={popularDuelsStyles.container}>
      <ThemedText style={popularDuelsStyles.title}>Popular Duels</ThemedText>
      
      <View style={popularDuelsStyles.duelCard}>
        <View style={popularDuelsStyles.cardContent}>
          <View style={popularDuelsStyles.leftSection}>
            <ThemedText style={popularDuelsStyles.duelTitle}>PSG WINNER</ThemedText>
            <ThemedText style={popularDuelsStyles.participants}>1655 participants</ThemedText>
            <ThemedText style={popularDuelsStyles.prizePot}>Pot $ 19,433</ThemedText>
          </View>
          
          <View style={popularDuelsStyles.rightSection}>
            <View style={popularDuelsStyles.teamsContainer}>
              <View style={popularDuelsStyles.teamLogoContainer}>
                <Image 
                  source={require('@/assets/images/logo-chelsea.png')}
                  style={popularDuelsStyles.teamLogo}
                  resizeMode="cover"
                />
              </View>
              
              <ThemedText style={popularDuelsStyles.vs}>VS</ThemedText>
              
              <View style={popularDuelsStyles.teamLogoContainer}>
                <Image 
                  source={require('@/assets/images/psg-logo.png')}
                  style={popularDuelsStyles.teamLogo}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={popularDuelsStyles.voteButton} activeOpacity={0.8}>
          <ThemedText style={popularDuelsStyles.voteButtonText}>Vote in this duel {'>'}</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={popularDuelsStyles.dotsContainer}>
        <View style={[popularDuelsStyles.dot, popularDuelsStyles.activeDot]} />
        <View style={popularDuelsStyles.dot} />
        <View style={popularDuelsStyles.dot} />
      </View>
    </View>
  );
}