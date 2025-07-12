import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '../components/ui/button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import AuthService from '../services/AuthService';
import WalletService from '../services/WalletService';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signup } = useAuth();
  const router = useRouter();

  const checkUsername = async () => {
    const ok = await AuthService.verifyUsername(username);
    if (!ok) throw new Error('Ce pseudo est déjà pris.');
  };

  const handleSignup = async () => {
    setError(null);
    setLoading(true);

    try {
      await checkUsername();

      // 1. Inscription API et génération du wallet
      console.log('🚀 Début de l\'inscription...');
      await signup(email, password, username);
      console.log('✅ Inscription terminée');

      // 2. Attendre que les données soient bien sauvegardées
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Vérifier que l'adresse wallet est bien disponible
      const walletAddress = await AsyncStorage.getItem('walletAddress');
      if (!walletAddress) {
        throw new Error('Adresse wallet non trouvée après inscription');
      }
      console.log('✅ Adresse wallet confirmée:', walletAddress);

      // 4. Création des métadonnées
      const meta = {
        username,
        createdAt: new Date().toISOString(),
        version: '1.0'
      };

      // 5. Conversion en string pour l'enregistrement on-chain
      const metadataString = JSON.stringify(meta);
      console.log('📝 Métadonnées à enregistrer:', metadataString);

      // 6. Ecriture on-chain (après que le wallet soit sauvegardé)
      console.log('🔗 Enregistrement du profil on-chain...');
      await WalletService.setProfileOnChain(metadataString);
      console.log('✅ Profil enregistré on-chain avec succès');

      // 7. Sauvegarder les métadonnées localement aussi
      await AsyncStorage.setItem('profileCid', metadataString);
      await AsyncStorage.setItem('username', username);

      Alert.alert('Inscription réussie', 'Votre profil a été enregistré on-chain.');
      router.replace('/');
    } catch (e: any) {
      console.error('❌ Erreur lors de l\'inscription:', e);
      setError(e.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Inscription</Text>

      <Input
        placeholder="Pseudo"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
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
        <ActivityIndicator size="large" style={{ marginTop: 12 }} />
      ) : (
        <Button title="S'inscrire" onPress={handleSignup} />
      )}

      <Text
        onPress={() => router.push('/login')}
        style={{
          color: '#007AFF',
          textAlign: 'center',
          marginTop: 16,
        }}
      >
        Déjà inscrit ? Se connecter
      </Text>
    </View>
  );
}