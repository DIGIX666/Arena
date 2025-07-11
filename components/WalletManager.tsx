import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Clipboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function WalletManager() {
  const {
    address,
    chzBalance,
    arenaTokenBalance,
    isLoading,
    hasWallet,
    createWallet,
    importWallet,
    refreshBalances,
    buyTokens,
    transferTokens,
    sendChz,
    deleteWallet,
    getMnemonic,
  } = useWallet();

  const [showImport, setShowImport] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferType, setTransferType] = useState<'chz' | 'arena'>('arena');
  const [buyAmount, setBuyAmount] = useState('');

  const handleCreateWallet = async () => {
    try {
      console.log('🔄 Création du wallet en cours...');
      const result = await createWallet();
      console.log('✅ Wallet créé avec succès:', result.address);
      Alert.alert(
        'Wallet créé!',
        `Votre wallet a été créé avec succès.\n\nAdresse: ${result.address}\n\n⚠️ IMPORTANT: Sauvegardez votre phrase mnémonique de manière sécurisée:\n\n${result.mnemonic}`,
        [
          {
            text: 'Copier la phrase',
            onPress: () => Clipboard.setString(result.mnemonic),
          },
          { text: 'OK' },
        ]
      );
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du wallet:', error);
      Alert.alert('Erreur', `Impossible de créer le wallet: ${error.message || error}`);
    }
  };

  const handleImportWallet = async () => {
    if (!importMnemonic.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une phrase mnémonique');
      return;
    }

    try {
      await importWallet(importMnemonic.trim());
      setImportMnemonic('');
      setShowImport(false);
      Alert.alert('Succès', 'Wallet importé avec succès!');
    } catch (error) {
      Alert.alert('Erreur', 'Phrase mnémonique invalide');
    }
  };

  const handleBuyTokens = async () => {
    if (!buyAmount || isNaN(Number(buyAmount)) || Number(buyAmount) <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide');
      return;
    }

    try {
      const txHash = await buyTokens(buyAmount);
      setBuyAmount('');
      Alert.alert(
        'Transaction envoyée',
        `Votre achat a été envoyé!\nHash: ${txHash}`,
        [
          {
            text: 'Copier hash',
            onPress: () => Clipboard.setString(txHash),
          },
          { text: 'OK' },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'achat');
    }
  };

  const handleTransfer = async () => {
    if (!transferAddress.trim() || !transferAmount || isNaN(Number(transferAmount)) || Number(transferAmount) <= 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs correctement');
      return;
    }

    try {
      const txHash = transferType === 'chz' 
        ? await sendChz(transferAddress.trim(), transferAmount)
        : await transferTokens(transferAddress.trim(), transferAmount);
        
      setTransferAddress('');
      setTransferAmount('');
      setShowTransfer(false);
      
      Alert.alert(
        'Transaction envoyée',
        `Votre transfert a été envoyé!\nHash: ${txHash}`,
        [
          {
            text: 'Copier hash',
            onPress: () => Clipboard.setString(txHash),
          },
          { text: 'OK' },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur lors du transfert');
    }
  };

  const handleShowMnemonic = async () => {
    try {
      const mnemonic = await getMnemonic();
      if (mnemonic) {
        Alert.alert(
          'Phrase mnémonique',
          mnemonic,
          [
            {
              text: 'Copier',
              onPress: () => Clipboard.setString(mnemonic),
            },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer la phrase mnémonique');
    }
  };

  const handleDeleteWallet = () => {
    Alert.alert(
      'Supprimer le wallet',
      'Êtes-vous sûr de vouloir supprimer votre wallet? Cette action est irréversible!',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: deleteWallet,
        },
      ]
    );
  };

  const copyAddress = () => {
    if (address) {
      Clipboard.setString(address);
      Alert.alert('Copié', 'Adresse copiée dans le presse-papiers');
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText>Chargement...</ThemedText>
      </ThemedView>
    );
  }

  if (!hasWallet) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Configuration du Wallet</ThemedText>
        
        <TouchableOpacity style={styles.button} onPress={handleCreateWallet}>
          <Text style={styles.buttonText}>Créer un nouveau wallet</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => setShowImport(true)}
        >
          <Text style={styles.secondaryButtonText}>Importer un wallet existant</Text>
        </TouchableOpacity>

        {showImport && (
          <View style={styles.importContainer}>
            <ThemedText style={styles.label}>Phrase mnémonique:</ThemedText>
            <TextInput
              style={styles.textInput}
              value={importMnemonic}
              onChangeText={setImportMnemonic}
              placeholder="Saisissez votre phrase mnémonique de 12 mots"
              multiline
              numberOfLines={3}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.smallButton]} 
                onPress={handleImportWallet}
              >
                <Text style={styles.buttonText}>Importer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.smallButton, styles.secondaryButton]} 
                onPress={() => setShowImport(false)}
              >
                <Text style={styles.secondaryButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.walletInfo}>
        <ThemedText style={styles.title}>Mon Wallet</ThemedText>
        
        <TouchableOpacity onPress={copyAddress} style={styles.addressContainer}>
          <ThemedText style={styles.addressLabel}>Adresse:</ThemedText>
          <ThemedText style={styles.address}>
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.balanceContainer}>
          <ThemedText style={styles.balanceLabel}>Soldes:</ThemedText>
          <ThemedText style={styles.balance}>CHZ: {parseFloat(chzBalance).toFixed(4)}</ThemedText>
          <ThemedText style={styles.balance}>ARENA: {parseFloat(arenaTokenBalance).toFixed(2)}</ThemedText>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={refreshBalances}>
          <Text style={styles.buttonText}>Actualiser</Text>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Acheter des tokens ARENA</ThemedText>
        <TextInput
          style={styles.textInput}
          value={buyAmount}
          onChangeText={setBuyAmount}
          placeholder="Montant de tokens à acheter"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleBuyTokens}>
          <Text style={styles.buttonText}>Acheter</Text>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Transférer</ThemedText>
        
        <View style={styles.transferTypeContainer}>
          <TouchableOpacity
            style={[styles.transferTypeButton, transferType === 'arena' && styles.activeTransferType]}
            onPress={() => setTransferType('arena')}
          >
            <Text style={transferType === 'arena' ? styles.activeTransferTypeText : styles.transferTypeText}>
              ARENA
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.transferTypeButton, transferType === 'chz' && styles.activeTransferType]}
            onPress={() => setTransferType('chz')}
          >
            <Text style={transferType === 'chz' ? styles.activeTransferTypeText : styles.transferTypeText}>
              CHZ
            </Text>
          </TouchableOpacity>
        </View>

        {!showTransfer ? (
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setShowTransfer(true)}
          >
            <Text style={styles.buttonText}>Envoyer {transferType.toUpperCase()}</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <TextInput
              style={styles.textInput}
              value={transferAddress}
              onChangeText={setTransferAddress}
              placeholder="Adresse de destination"
            />
            <TextInput
              style={styles.textInput}
              value={transferAmount}
              onChangeText={setTransferAmount}
              placeholder="Montant"
              keyboardType="numeric"
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.smallButton]} 
                onPress={handleTransfer}
              >
                <Text style={styles.buttonText}>Envoyer</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.smallButton, styles.secondaryButton]} 
                onPress={() => setShowTransfer(false)}
              >
                <Text style={styles.secondaryButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Paramètres</ThemedText>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={handleShowMnemonic}
        >
          <Text style={styles.secondaryButtonText}>Afficher la phrase mnémonique</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]} 
          onPress={handleDeleteWallet}
        >
          <Text style={styles.buttonText}>Supprimer le wallet</Text>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  walletInfo: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  addressContainer: {
    marginBottom: 15,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  address: {
    fontSize: 16,
    fontFamily: 'monospace',
    backgroundColor: '#e9ecef',
    padding: 10,
    borderRadius: 8,
  },
  balanceContainer: {
    marginBottom: 15,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  balance: {
    fontSize: 16,
    marginBottom: 5,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  refreshButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  importContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  smallButton: {
    flex: 1,
  },
  transferTypeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  transferTypeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  activeTransferType: {
    backgroundColor: '#007AFF',
  },
  transferTypeText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  activeTransferTypeText: {
    color: 'white',
    fontWeight: '600',
  },
});
