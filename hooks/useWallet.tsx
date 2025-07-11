import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { web3Service } from '../services/web3Service';

interface WalletContextType {
  address: string | null;
  chzBalance: string;
  arenaTokenBalance: string;
  isLoading: boolean;
  hasWallet: boolean;
  createWallet: () => Promise<{ address: string; mnemonic: string }>;
  importWallet: (mnemonic: string) => Promise<string>;
  loadWallet: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  buyTokens: (amount: string) => Promise<string>;
  transferTokens: (toAddress: string, amount: string) => Promise<string>;
  sendChz: (toAddress: string, amount: string) => Promise<string>;
  deleteWallet: () => Promise<void>;
  getMnemonic: () => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [chzBalance, setChzBalance] = useState<string>('0');
  const [arenaTokenBalance, setArenaTokenBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasWallet, setHasWallet] = useState<boolean>(false);

  const loadWallet = async () => {
    setIsLoading(true);
    try {
      const walletAddress = await web3Service.loadWallet();
      if (walletAddress) {
        setAddress(walletAddress);
        setHasWallet(true);
        await refreshBalances();
      } else {
        const walletExists = await web3Service.hasWallet();
        setHasWallet(walletExists);
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalances = async () => {
    if (!address) return;
    
    try {
      const [chz, arena] = await Promise.all([
        web3Service.getChzBalance(address),
        web3Service.getArenaTokenBalance(address)
      ]);
      
      setChzBalance(chz);
      setArenaTokenBalance(arena);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  const createWallet = async () => {
    setIsLoading(true);
    try {
      const result = await web3Service.createWallet();
      setAddress(result.address);
      setHasWallet(true);
      await refreshBalances();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const importWallet = async (mnemonic: string) => {
    setIsLoading(true);
    try {
      const walletAddress = await web3Service.importWallet(mnemonic);
      setAddress(walletAddress);
      setHasWallet(true);
      await refreshBalances();
      return walletAddress;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const buyTokens = async (amount: string) => {
    if (!address) throw new Error('No wallet connected');
    
    try {
      const txHash = await web3Service.buyArenaTokens(amount);
      // Rafraîchir les soldes après la transaction
      setTimeout(() => refreshBalances(), 3000);
      return txHash;
    } catch (error) {
      throw error;
    }
  };

  const transferTokens = async (toAddress: string, amount: string) => {
    if (!address) throw new Error('No wallet connected');
    
    try {
      const txHash = await web3Service.transferArenaTokens(toAddress, amount);
      // Rafraîchir les soldes après la transaction
      setTimeout(() => refreshBalances(), 3000);
      return txHash;
    } catch (error) {
      throw error;
    }
  };

  const sendChz = async (toAddress: string, amount: string) => {
    if (!address) throw new Error('No wallet connected');
    
    try {
      const txHash = await web3Service.sendChz(toAddress, amount);
      // Rafraîchir les soldes après la transaction
      setTimeout(() => refreshBalances(), 3000);
      return txHash;
    } catch (error) {
      throw error;
    }
  };

  const deleteWallet = async () => {
    await web3Service.deleteWallet();
    setAddress(null);
    setChzBalance('0');
    setArenaTokenBalance('0');
    setHasWallet(false);
  };

  const getMnemonic = async () => {
    return await web3Service.getMnemonic();
  };

  useEffect(() => {
    loadWallet();
  }, []);

  useEffect(() => {
    if (address) {
      const interval = setInterval(refreshBalances, 30000); // Rafraîchir toutes les 30 secondes
      return () => clearInterval(interval);
    }
  }, [address]);

  const value: WalletContextType = {
    address,
    chzBalance,
    arenaTokenBalance,
    isLoading,
    hasWallet,
    createWallet,
    importWallet,
    loadWallet,
    refreshBalances,
    buyTokens,
    transferTokens,
    sendChz,
    deleteWallet,
    getMnemonic,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
