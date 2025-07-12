// app/login.tsx

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../components/ui/button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import WalletService from '../services/WalletService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);

      // Lire le profil on-chain APRÈS la connexion
      console.log('🔍 Vérification du profil on-chain...');
      const storedAddress = await AsyncStorage.getItem('walletAddress');
      if (storedAddress) {
        try {
          // Attendre un peu pour s'assurer que les données sont bien sauvegardées
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { cid, updated } = await WalletService.getProfileOnChain(storedAddress);
          console.log('📋 Profil on-chain récupéré - cid:', cid, 'updated:', updated);
          
          if (cid && cid.trim() !== '') {
            await AsyncStorage.setItem('profileCid', cid);
            console.log('✅ Profil on-chain sauvegardé localement');
            
            // Essayer de parser les métadonnées
            try {
              const metadata = JSON.parse(cid);
              console.log('📝 Métadonnées parsées:', metadata);
              if (metadata.username) {
                await AsyncStorage.setItem('username', metadata.username);
              }
            } catch (parseError) {
              console.log('⚠️ Le CID n\'est pas du JSON valide, gardé tel quel');
            }
          } else {
            console.log('ℹ️ Aucun profil on-chain trouvé pour cet utilisateur');
          }
        } catch (profileError) {
          console.log('⚠️ Erreur lors de la récupération du profil on-chain:', profileError);
          // On ne bloque pas la connexion si le profil on-chain n'est pas disponible
        }
      }

      router.replace('/');
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Connexion</Text>

      <Input
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        placeholder="Mot de passe"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && (
        <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
      )}

      {loading ? (
        <ActivityIndicator size="large" style={{ marginVertical: 12 }} />
      ) : (
        <Button title="Se connecter" onPress={handleLogin} />
      )}

      <TouchableOpacity
        onPress={() => router.push('/signup')}
        style={{ marginTop: 16 }}
      >
        <Text style={{ color: '#007AFF', textAlign: 'center' }}>
          Pas encore de compte ? S'inscrire
        </Text>
      </TouchableOpacity>
    </View>
  );
}