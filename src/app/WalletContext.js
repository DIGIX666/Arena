'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

// Configuration pour Chiliz Testnet Spicy
const CHILIZ_TESTNET_CONFIG = {
  chainId: '0x15B32',
  chainName: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    name: 'CHZ',
    symbol: 'CHZ',
    decimals: 18,
  },
  rpcUrls: ['https://spicy-rpc.chiliz.com', 'https://chiliz-spicy.publicnode.com'],
  blockExplorerUrls: ['https://testnet.chiliscan.com'],
};

const CONTRACT_ADDRESS = '0xe607676A9a98F55752d579DB7da0e8D776955CE9';

// ABI du contrat UserProfile
const CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "_username", "type": "string"}],
    "name": "createProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_userAddress", "type": "address"}],
    "name": "getProfile",
    "outputs": [{"components": [{"internalType": "string", "name": "username", "type": "string"}, {"internalType": "address", "name": "userAddress", "type": "address"}, {"internalType": "uint256", "name": "createdAt", "type": "uint256"}, {"internalType": "bool", "name": "exists", "type": "bool"}], "internalType": "struct UserProfile.Profile", "name": "", "type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_userAddress", "type": "address"}],
    "name": "hasProfile",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_userAddress", "type": "address"}],
    "name": "getUsername",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return chainId === CHILIZ_TESTNET_CONFIG.chainId;
    }
    return false;
  };

  const switchToChilizNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHILIZ_TESTNET_CONFIG.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CHILIZ_TESTNET_CONFIG],
          });
        } catch (addError) {
          console.error('Erreur lors de l\'ajout du réseau:', addError);
          throw addError;
        }
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask n\'est pas installé !');
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        await switchToChilizNetwork();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAddress(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
  };

  const checkProfile = async (userAddress) => {
    if (!contract) return false;
    try {
      return await contract.hasProfile(userAddress);
    } catch (error) {
      console.error('Erreur lors de la vérification du profil:', error);
      return false;
    }
  };

  const getUsername = async (userAddress) => {
    if (!contract) return null;
    try {
      return await contract.getUsername(userAddress);
    } catch (error) {
      console.error('Erreur lors de la récupération du nom d\'utilisateur:', error);
      return null;
    }
  };

  const createProfile = async (username) => {
    if (!contract) throw new Error('Contrat non initialisé');
    try {
      const tx = await contract.createProfile(username, {
        gasLimit: 500000 // Increase gas limit
      });
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Erreur lors de la création du profil:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Seulement configurer les gestionnaires d'événements, pas de vérification automatique
    if (window.ethereum) {
      // Gestionnaire pour les changements de comptes
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (isConnected) {
          // Seulement mettre à jour l'adresse si déjà connecté
          setAddress(accounts[0]);
        }
      };

      // Gestionnaire pour les changements de réseau
      const handleChainChanged = () => {
        if (isConnected) {
          window.location.reload();
        }
      };

      // Ajouter les event listeners
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Nettoyage des event listeners
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [isConnected]);

  return (
    <WalletContext.Provider
      value={{
        address,
        provider,
        signer,
        contract,
        isConnected,
        isLoading,
        connectWallet,
        disconnectWallet,
        checkProfile,
        getUsername,
        createProfile,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};