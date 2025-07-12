import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../services/AuthService';
import WalletService from '../services/WalletService';
import { useRouter } from 'expo-router';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signup: (email: string, pass: string, username: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Charger le token au démarrage
  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await AsyncStorage.getItem('token');
        setToken(stored);
      } catch (error) {
        console.error('❌ Erreur lors du chargement du token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

  const signup = async (email: string, pass: string, username: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Génération du wallet...');
      const { address, keyEnc } = await WalletService.generateKeypair(pass);
      console.log('✅ Wallet généré, adresse:', address);
      
      console.log('📡 Inscription API...');
      const jwt = await AuthService.signup(email, pass, username, address, keyEnc);
      console.log('✅ Inscription API réussie');
      
      setToken(jwt);
      await AsyncStorage.setItem('token', jwt);
      await AsyncStorage.setItem('walletAddress', address);
      await AsyncStorage.setItem('keyEnc', keyEnc);
      await AsyncStorage.setItem('password', pass);
      
      console.log('✅ Données sauvegardées en local');
      // Ne pas rediriger ici, laisser le NavigationHandler s'en occuper
    } catch (error) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      console.log('📡 Connexion API...');
      const jwt = await AuthService.login(email, pass);
      console.log('✅ Connexion API réussie');
      
      setToken(jwt);
      await AsyncStorage.setItem('token', jwt);
      
      console.log('📡 Récupération du profil...');
      const { chzAddress } = await AuthService.getProfile();
      console.log('✅ Profil récupéré, adresse:', chzAddress);
      
      if (chzAddress) await AsyncStorage.setItem('walletAddress', chzAddress);
      
      console.log('📡 Téléchargement de la clé...');
      const keyEnc = await AuthService.downloadKey();
      if (keyEnc) {
        await AsyncStorage.setItem('keyEnc', keyEnc);
        await AsyncStorage.setItem('password', pass);
        console.log('✅ Clé sauvegardée');
      }
      
      // Ne pas rediriger ici, laisser le NavigationHandler s'en occuper
    } catch (error) {
      console.error('❌ Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.clear();
    // Ne pas rediriger ici, laisser le NavigationHandler s'en occuper
  };

  const value: AuthContextType = {
    token,
    isAuthenticated: !!token,
    isLoading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}