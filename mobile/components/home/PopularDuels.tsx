// components/home/PopularDuels.tsx
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Image, TouchableOpacity, View } from 'react-native';
import { popularDuelsStyles } from '../styles/popularDuels'; // Import from styles folder

const duelsData = [
  {
    id: 1,
    title: 'PSG WINNER',
    participants: 1655,
    pot: 19433,
    team1: { name: 'Chelsea', logo: require('@/assets/images/logo-chelsea.png') },
    team2: { name: 'PSG', logo: require('@/assets/images/psg-logo.png') },
  },
  {
    id: 2,
    title: 'MADRID CLASH',
    participants: 2341,
    pot: 24567,
    team1: { name: 'Real Madrid', logo: require('@/assets/images/logo-chelsea.png') },
    team2: { name: 'Barcelona', logo: require('@/assets/images/psg-logo.png') },
  },
];

export function PopularDuels() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleVotePress = () => {
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
    
    // Navigate to explore tab (existing route)
    router.push('/(tabs)/explore');
  };

  const currentDuel = duelsData[currentIndex];

  return (
    <View style={popularDuelsStyles.container}>
      <ThemedText style={popularDuelsStyles.title}>⚔️ Popular Duels</ThemedText>
      
      <View style={popularDuelsStyles.duelCard}>
        <View style={popularDuelsStyles.cardContent}>
          <View style={popularDuelsStyles.leftSection}>
            <ThemedText style={popularDuelsStyles.duelTitle}>
              {currentDuel.title}
            </ThemedText>
            <ThemedText style={popularDuelsStyles.participants}>
              {currentDuel.participants.toLocaleString()} participants
            </ThemedText>
            <ThemedText style={popularDuelsStyles.prizePot}>
              Pot $ {currentDuel.pot.toLocaleString()}
            </ThemedText>
          </View>
          
          <View style={popularDuelsStyles.rightSection}>
            <View style={popularDuelsStyles.teamsContainer}>
              <View style={[popularDuelsStyles.teamLogoContainer, { zIndex: 1 }]}>
                <Image 
                  source={currentDuel.team1.logo}
                  style={popularDuelsStyles.teamLogo}
                  resizeMode="cover"
                />
              </View>
              
              <ThemedText style={popularDuelsStyles.vs}>VS</ThemedText>
              
              <View style={[popularDuelsStyles.teamLogoContainer, { zIndex: 2, marginLeft: -10 }]}>
                <Image 
                  source={currentDuel.team2.logo}
                  style={popularDuelsStyles.teamLogo}
                  resizeMode="cover"
                />
              </View>
            </View>
          </View>
        </View>
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={popularDuelsStyles.voteButton} 
            activeOpacity={0.8}
            onPress={handleVotePress}
          >
            <ThemedText style={popularDuelsStyles.voteButtonText}>
              Vote in this duel →
            </ThemedText>
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      <View style={popularDuelsStyles.dotsContainer}>
        {duelsData.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentIndex(index)}
            style={[
              popularDuelsStyles.dot,
              currentIndex === index && popularDuelsStyles.activeDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export default PopularDuels;