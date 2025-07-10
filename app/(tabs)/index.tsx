import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Welcome to Arena!
      </ThemedText>
      
      {/* Add your profile image here */}
      <Image 
        source={require('@/assets/images/profile.png')} // Replace with your image name
        style={styles.profileImage}
      />
      
      <ThemedText style={styles.subtitle}>
        Your app is ready to build!
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginVertical: 20,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
  },
});