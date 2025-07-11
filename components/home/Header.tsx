// components/home/Header.tsx
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { Animated, Image, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { headerStyles } from '../styles/header';

export function Header({ userName = "user777" }: { userName?: string }) {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleCreateDuel = () => {
    // Button press animation
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
    <SafeAreaView style={headerStyles.safeArea}>
      <View style={headerStyles.header}>
        <View style={headerStyles.headerContent}>
          <View style={headerStyles.logoContainer}>
            <Image 
              source={require('@/assets/images/ARENA-logo.png')}
              style={headerStyles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <View style={headerStyles.rightSection}>
            <View style={headerStyles.userInfo}>
              <View style={headerStyles.profileIcon}>
                <ThemedText style={headerStyles.profileText}>👤</ThemedText>
              </View>
              <ThemedText style={headerStyles.userName}>
                {userName}
              </ThemedText>
            </View>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity 
                style={headerStyles.createButton} 
                activeOpacity={0.8}
                onPress={handleCreateDuel}
              >
                <ThemedText style={headerStyles.createButtonText}>
                  + Create Your Duel
                </ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}