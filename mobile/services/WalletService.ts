import 'react-native-get-random-values';
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as bip39 from 'bip39';
import CryptoJS from 'crypto-js';

// Point RPC testnet Chiliz
const RPC_URL = 'https://spicy-rpc.chiliz.com/';
const CONTRACT_ADDRESS = '0xEca7CE91002fe1d7b5FEEE2BdC38C40ca5ed01C5';

// ABI simplifié exemple
const ABI = [
  'function getProfile(address) view returns (string cid, uint256 updated)',
  'function setProfile(string)',
  'function setProfileFor(address user, string cid)'
];

// Récupération sécurisée de la clé privée - CORRECTION ICI
const SPICY_PRIVATE_KEY = "20bb95b9e238459676d44f9335d1d48d175b9fe041836e181f5d9e896df83a5f";

// Déclaration du provider AVANT le sponsorWallet
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Fonction pour créer le sponsorWallet de manière sécurisée
function getSponsorWallet(): ethers.Wallet {
  console.log('🔑 Vérification de la clé privée sponsor...');
  
  if (!SPICY_PRIVATE_KEY) {
    console.error('❌ SPICY_PRIVATE_KEY est vide');
    throw new Error('SPICY_PRIVATE_KEY not found in environment variables');
  }
  
  // Vérifier si la clé semble valide (doit être une vraie clé privée)
  if (SPICY_PRIVATE_KEY === '0xSPICY_PRIVATE_KEY' || SPICY_PRIVATE_KEY.length < 60) {
    console.error('❌ SPICY_PRIVATE_KEY semble être un placeholder:', SPICY_PRIVATE_KEY);
    throw new Error('SPICY_PRIVATE_KEY appears to be a placeholder value. Please set a real private key.');
  }
  
  console.log('✅ Clé privée sponsor trouvée, longueur:', SPICY_PRIVATE_KEY.length);
  
  try {
    // Ajouter le préfixe 0x si nécessaire
    const privateKey = SPICY_PRIVATE_KEY.startsWith('0x') ? SPICY_PRIVATE_KEY : `0x${SPICY_PRIVATE_KEY}`;
    console.log('🔧 Clé privée formatée:', privateKey.substring(0, 10) + '...');
    
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('✅ Wallet sponsor créé, adresse:', wallet.address);
    return wallet;
  } catch (error) {
    console.error('❌ Erreur lors de la création du wallet sponsor:', error);
    throw new Error('Invalid SPICY_PRIVATE_KEY format');
  }
}

export default class WalletService {
  /**
   * Génère une paire de clés et chiffre la clé privée avec le mot de passe
   */
  static async generateKeypair(password: string): Promise<{
    address: string;
    keyEnc: string;
  }> {
    const mnemonic = bip39.generateMnemonic();
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    const derivedKey = CryptoJS.PBKDF2(password, 'some_salt', {
      keySize: 256 / 32,
      iterations: 100000,
    });
    const keyEnc = CryptoJS.AES.encrypt(wallet.privateKey, derivedKey.toString()).toString();
    await AsyncStorage.setItem('walletAddress', wallet.address);
    await AsyncStorage.setItem('keyEnc', keyEnc);
    await AsyncStorage.setItem('password', password);
    return { address: wallet.address, keyEnc };
  }

  /**
   * Déchiffre la clé privée et retourne un Wallet ethers
   */
  static async decryptKey(): Promise<ethers.Wallet> {
    const keyEnc = await AsyncStorage.getItem('keyEnc');
    const password = await AsyncStorage.getItem('password');
    if (!keyEnc || !password) {
      throw new Error('Clé ou mot de passe manquant');
    }
    const derivedKey = CryptoJS.PBKDF2(password, 'some_salt', {
      keySize: 256 / 32,
      iterations: 100000,
    });
    const bytes = CryptoJS.AES.decrypt(keyEnc, derivedKey.toString());
    const privKey = bytes.toString(CryptoJS.enc.Utf8);
    return new ethers.Wallet(privKey, provider);
  }

  /**
   * Récupère le profil on-chain
   */
  static async getProfileOnChain(address?: string): Promise<{
    cid: string;
    updated: number;
  }> {
    if (!address) {
      address = await AsyncStorage.getItem('walletAddress');
      if (!address) throw new Error('Adresse du wallet non disponible');
    }
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const [cid, updated] = await contract.getProfile(address);
    return { cid, updated: Number(updated) };
  }

  /**
   * Met à jour le profil on-chain
   */
  static async setProfileOnChain(cid: string) {
    console.log('🔗 Début de setProfileOnChain...');
    
    // 1) On récupère d'abord l'adresse de l'utilisateur
    const userAddress = await AsyncStorage.getItem('walletAddress');
    if (!userAddress) {
      throw new Error('Adresse utilisateur non disponible');
    }
    console.log('👤 Adresse utilisateur:', userAddress);
    
    // 2) On crée l'instance du contrat avec le sponsorWallet
    const sponsorWallet = getSponsorWallet();
    console.log('💰 Wallet sponsor prêt');
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, sponsorWallet);
    console.log('📋 Contrat instancié');
    
    // 3) On envoie la tx en passant l'adresse cible
    console.log('📤 Envoi de la transaction...');
    const tx = await contract.setProfileFor(userAddress, cid);
    console.log('⏳ Transaction envoyée, hash:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmée');
    
    if (receipt.status !== 1) {
      throw new Error('La transaction on-chain a échoué');
    }
    
    // Optionnel : log du hash pour debug
    console.log('🎉 Profil on-chain mis à jour avec succès, tx hash =', tx.hash);
  }

  /**
   * Télécharger la clé privée en clair (⚠️)
   */
  static async downloadPrivateKey() {
    const wallet = await this.decryptKey();
    const content = wallet.privateKey;
    const path = `${FileSystem.documentDirectory}private-key.txt`;
    await FileSystem.writeAsStringAsync(path, content);
    await Sharing.shareAsync(path);
  }
}