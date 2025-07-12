import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../hooks/useAuth';

// Composant pour gérer la navigation selon l'état d'auth
function NavigationHandler() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const onAuthPages = segments[0] === 'login' || segments[0] === 'signup';

    if (isAuthenticated) {
      // Utilisateur connecté
      if (segments.length === 0 || onAuthPages) {
        // Rediriger vers la page d'accueil
        router.replace('/(tabs)');
      }
    } else {
      // Utilisateur non connecté
      if (inTabsGroup || segments.length === 0) {
        // Rediriger vers la page de connexion
        router.replace('/login');
      }
    }
  }, [isAuthenticated, segments, isLoading, router]);

  // Afficher un écran de chargement pendant la vérification
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationHandler />
    </AuthProvider>
  );
}