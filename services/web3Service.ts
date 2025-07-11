import { ethers } from 'ethers';
import './polyfills';
import { secureStorage } from './secureStorage';

// Configuration du réseau Chiliz Testnet
export const CHILIZ_TESTNET_CONFIG = {
  chainId: '0x15B32', // 88882 en hexadécimal
  chainName: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    name: 'CHZ',
    symbol: 'CHZ',
    decimals: 18,
  },
  rpcUrls: ['https://spicy-rpc.chiliz.com/'],
  blockExplorerUrls: ['https://testnet.chiliscan.com/'],
};

export const RPC_URL = 'https://spicy-rpc.chiliz.com/';

// Adresses des contrats (à mettre à jour après déploiement)
export const CONTRACT_ADDRESSES = {
  ARENA_TOKEN: '', // À remplir après déploiement
  ARENA: '', // À remplir après déploiement
  FAN_TOKEN: '', // À remplir après déploiement
};

// ABI simplifiés (à compléter avec les vrais ABI après compilation)
export const ARENA_TOKEN_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function buyTokens(uint256 tokenAmount) payable',
  'function transferTokens(address to, uint256 amount)',
  'function tokenPrice() view returns (uint256)',
  'event TokensPurchased(address indexed buyer, uint256 amount, uint256 cost)',
  'event TokensTransferred(address indexed from, address indexed to, uint256 amount)',
];

export const ARENA_ABI = [
  'function createArena(string memory title, string[] memory outcomeNames, uint256 deadline)',
  'function placeBet(uint256 arenaId, uint256 outcomeId, uint256 amount)',
  'function claimGains(uint256 arenaId)',
  'function arenas(uint256) view returns (tuple(string title, string[] outcomeNames, uint256 potTotal, uint256 deadline, bool isResolved, uint256 winningOutcomeId))',
  'function betsPerOutcome(uint256 arenaId, uint256 outcomeId, address user) view returns (uint256)',
];

class Web3Service {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.HDNodeWallet | ethers.Wallet | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
  }

  // Créer un nouveau wallet
  async createWallet(): Promise<{ address: string; mnemonic: string }> {
    const wallet = ethers.Wallet.createRandom();
    const mnemonic = wallet.mnemonic?.phrase || '';
    
    // Sauvegarder de manière sécurisée
    await secureStorage.setItem('wallet_private_key', wallet.privateKey);
    await secureStorage.setItem('wallet_mnemonic', mnemonic);
    await secureStorage.setItem('wallet_address', wallet.address);
    
    this.signer = wallet.connect(this.provider);
    
    return {
      address: wallet.address,
      mnemonic: mnemonic,
    };
  }

  // Importer un wallet existant
  async importWallet(mnemonic: string): Promise<string> {
    try {
      const wallet = ethers.Wallet.fromPhrase(mnemonic);
      
      // Sauvegarder de manière sécurisée
      await secureStorage.setItem('wallet_private_key', wallet.privateKey);
      await secureStorage.setItem('wallet_mnemonic', mnemonic);
      await secureStorage.setItem('wallet_address', wallet.address);
      
      this.signer = wallet.connect(this.provider);
      
      return wallet.address;
    } catch (error) {
      throw new Error('Invalid mnemonic phrase');
    }
  }

  // Charger un wallet existant
  async loadWallet(): Promise<string | null> {
    try {
      const privateKey = await secureStorage.getItem('wallet_private_key');
      if (!privateKey) return null;

      const wallet = new ethers.Wallet(privateKey);
      this.signer = wallet.connect(this.provider);
      
      return wallet.address;
    } catch (error) {
      return null;
    }
  }

  // Obtenir l'adresse du wallet
  async getWalletAddress(): Promise<string | null> {
    return await secureStorage.getItem('wallet_address');
  }

  // Obtenir le solde CHZ
  async getChzBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  // Obtenir le solde de tokens ARENA
  async getArenaTokenBalance(address: string): Promise<string> {
    if (!CONTRACT_ADDRESSES.ARENA_TOKEN) return '0';
    
    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ARENA_TOKEN,
      ARENA_TOKEN_ABI,
      this.provider
    );
    
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  // Acheter des tokens ARENA
  async buyArenaTokens(tokenAmount: string): Promise<string> {
    if (!this.signer) throw new Error('Wallet not loaded');
    if (!CONTRACT_ADDRESSES.ARENA_TOKEN) throw new Error('Arena token contract not deployed');

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ARENA_TOKEN,
      ARENA_TOKEN_ABI,
      this.signer
    );

    const tokenPrice = await contract.tokenPrice();
    const cost = BigInt(ethers.parseEther(tokenAmount)) * tokenPrice / BigInt(10**18);

    const tx = await contract.buyTokens(ethers.parseEther(tokenAmount), {
      value: cost,
    });

    return tx.hash;
  }

  // Transférer des tokens ARENA à un autre utilisateur
  async transferArenaTokens(toAddress: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('Wallet not loaded');
    if (!CONTRACT_ADDRESSES.ARENA_TOKEN) throw new Error('Arena token contract not deployed');

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ARENA_TOKEN,
      ARENA_TOKEN_ABI,
      this.signer
    );

    const tx = await contract.transferTokens(toAddress, ethers.parseEther(amount));
    return tx.hash;
  }

  // Envoyer des CHZ à un autre utilisateur
  async sendChz(toAddress: string, amount: string): Promise<string> {
    if (!this.signer) throw new Error('Wallet not loaded');

    const tx = await this.signer.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount),
    });

    return tx.hash;
  }

  // Approuver les tokens pour le contrat Arena
  async approveArenaContract(amount: string): Promise<string> {
    if (!this.signer) throw new Error('Wallet not loaded');
    if (!CONTRACT_ADDRESSES.ARENA_TOKEN || !CONTRACT_ADDRESSES.ARENA) {
      throw new Error('Contracts not deployed');
    }

    const contract = new ethers.Contract(
      CONTRACT_ADDRESSES.ARENA_TOKEN,
      ARENA_TOKEN_ABI,
      this.signer
    );

    const tx = await contract.approve(CONTRACT_ADDRESSES.ARENA, ethers.parseEther(amount));
    return tx.hash;
  }

  // Supprimer le wallet
  async deleteWallet(): Promise<void> {
    await secureStorage.removeItem('wallet_private_key');
    await secureStorage.removeItem('wallet_mnemonic');
    await secureStorage.removeItem('wallet_address');
    this.signer = null;
  }

  // Vérifier si un wallet existe
  async hasWallet(): Promise<boolean> {
    const address = await secureStorage.getItem('wallet_address');
    return !!address;
  }

  // Obtenir la phrase mnémonique (pour backup)
  async getMnemonic(): Promise<string | null> {
    return await secureStorage.getItem('wallet_mnemonic');
  }
}

export const web3Service = new Web3Service();
