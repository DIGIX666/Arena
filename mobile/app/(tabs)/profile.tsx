import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WalletService from '../../services/WalletService';
import { useAuth } from '../../hooks/useAuth';

export default function Profile() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cid, setCid] = useState<string | null>(null);
  const [updated, setUpdated] = useState<number | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      console.log('✅ loadProfile START');
      try {
        setLoading(true);

        const storedAddress = await AsyncStorage.getItem('walletAddress');
        console.log('ℹ️ storedAddress:', storedAddress);

        if (!storedAddress) {
          Alert.alert('Erreur', 'Aucune adresse de wallet trouvée. Veuillez vous connecter.');
          setLoading(false);
          return;
        }

        setAddress(storedAddress);

        // DEBUG: Attendre un peu pour la propagation blockchain
        console.log('⏱️ Attente 2 secondes pour la propagation...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // DEBUG: Vérifier toutes les données AsyncStorage
        const allKeys = await AsyncStorage.getAllKeys();
        const allData = await AsyncStorage.multiGet(allKeys);
        console.log('📱 Toutes les données AsyncStorage:', allData);

        console.log('🔍 Appel getProfileOnChain avec adresse:', storedAddress);
        const { cid, updated } = await WalletService.getProfileOnChain(storedAddress);
        console.log('✅ getProfileOnChain RESULT - cid:', cid, 'updated:', updated);

        setCid(cid);
        setUpdated(updated);
        
        // Essayer de parser les métadonnées si cid existe
        if (cid && cid.trim() !== '') {
          try {
            const parsedMetadata = JSON.parse(cid);
            console.log('📝 Métadonnées parsées:', parsedMetadata);
            setMetadata(parsedMetadata);
          } catch (parseError) {
            console.log('⚠️ Le CID n\'est pas du JSON, gardé tel quel');
            setMetadata(null);
          }
        }
        
        setSuccess(true);
      } catch (error) {
        console.error('❌ Erreur loadProfile:', error);
        console.error('❌ Stack trace:', (error as Error).stack);
        Alert.alert('Erreur', (error as Error).message);
      } finally {
        setLoading(false);
        console.log('✅ loadProfile FINISH');
      }
    };

    loadProfile();
  }, []);

  // DEBUG: Fonction pour forcer le rechargement
  const forceReload = async () => {
    console.log('🔄 Force reload...');
    setLoading(true);
    setCid(null);
    setUpdated(null);
    setSuccess(false);
    setMetadata(null);
    
    try {
      const storedAddress = await AsyncStorage.getItem('walletAddress');
      if (storedAddress) {
        const { cid, updated } = await WalletService.getProfileOnChain(storedAddress);
        console.log('🔄 Force reload result - cid:', cid, 'updated:', updated);
        setCid(cid);
        setUpdated(updated);
        setSuccess(true);
      }
    } catch (error) {
      console.error('❌ Erreur force reload:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    console.log('🕒 Rendu: loading...');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Chargement du profil...</Text>
      </View>
    );
  }

  if (!address) {
    console.log('⚠️ Rendu: aucune adresse');
    return (
      <View style={styles.container}>
        <Text>Aucune adresse trouvée. Veuillez vous reconnecter.</Text>
        <Button title="Déconnexion" color="red" onPress={logout} />
      </View>
    );
  }

  console.log('✅ Rendu final');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {success && (
        <Text style={styles.success}>
          ✅ Profil récupéré depuis la blockchain Chiliz.
        </Text>
      )}
      <Text style={styles.label}>Adresse Chiliz :</Text>
      <Text style={styles.value}>{address}</Text>

      <Text style={styles.label}>CID du profil :</Text>
      <Text style={styles.value}>{cid && cid.trim() !== '' ? cid : 'Aucun profil enregistré on-chain.'}</Text>

      {metadata && (
        <>
          <Text style={styles.label}>Nom d'utilisateur :</Text>
          <Text style={styles.value}>{metadata.username || 'Non défini'}</Text>
          
          <Text style={styles.label}>Créé le :</Text>
          <Text style={styles.value}>
            {metadata.createdAt ? new Date(metadata.createdAt).toLocaleString() : 'Non défini'}
          </Text>
          
          <Text style={styles.label}>Version :</Text>
          <Text style={styles.value}>{metadata.version || 'Non définie'}</Text>
        </>
      )}

      <Text style={styles.label}>Dernière mise à jour :</Text>
      <Text style={styles.value}>
        {updated && updated > 0 ? new Date(updated * 1000).toLocaleString() : 'Jamais'}
      </Text>

      <View style={styles.buttons}>
        <Button title="🔄 Recharger" onPress={forceReload} />
      </View>

      <View style={styles.buttons}>
        <Button title="Télécharger la clé privée" onPress={() => WalletService.downloadPrivateKey()} />
      </View>

      <View style={styles.buttons}>
        <Button title="Déconnexion" color="red" onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center', flexGrow: 1 },
  label: { fontWeight: 'bold', marginTop: 12 },
  value: { marginTop: 4, fontSize: 16 },
  success: { color: 'green', fontWeight: 'bold', marginBottom: 10 },
  buttons: { marginTop: 20 },
});