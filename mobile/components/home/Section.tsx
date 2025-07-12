import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StyleSheet, View } from 'react-native';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  showImage?: boolean;
}

export function Section({ title, children, showImage = false }: SectionProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
      
      {showImage && (
        <View style={styles.imageContainer}>
          <ThemedText style={styles.imagePlaceholder}>Section Image</ThemedText>
        </View>
      )}
      
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    marginBottom: 12,
  },
  imageContainer: {
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholder: {
    opacity: 0.7,
  },
});