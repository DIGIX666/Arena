// app/_layout.tsx
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = 'dark'; // Force dark theme
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Custom dark theme
  const customDarkTheme = {
    ...DarkTheme,
   colors: {
      ...DarkTheme.colors,
      background: '#1a1a1a',
      card: '#2a2a2a',
      text: '#ECEDEE',
      primary: '#007AFF',
    },
  };

  return (
    <ThemeProvider value={customDarkTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
    </ThemeProvider>
  );
}