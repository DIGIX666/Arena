// components/home/Header.tsx
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView, TouchableOpacity, View } from 'react-native';
import { headerStyles } from '../styles/header';

export function Header({ userName = "user777" }: { userName?: string }) {
  return (
    <SafeAreaView style={headerStyles.safeArea}>
      <View style={headerStyles.header}>
        <View style={headerStyles.headerContent}>
          <View style={headerStyles.logoContainer}>
            <ThemedText style={headerStyles.logo}>BETFI</ThemedText>
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
            <TouchableOpacity style={headerStyles.createButton} activeOpacity={0.8}>
              <ThemedText style={headerStyles.createButtonText}>
                + Create Your Duel
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}