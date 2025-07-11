# 💰 Système de Wallet Arena

Ce guide vous explique comment utiliser le système de wallet intégré dans votre DApp Arena pour le testnet Chiliz.

## 🚀 Fonctionnalités

- ✅ Création et importation de wallets
- ✅ Gestion sécurisée des clés privées
- ✅ Achat de tokens ARENA avec CHZ
- ✅ Transfert de tokens entre utilisateurs
- ✅ Envoi de CHZ natif
- ✅ Interface utilisateur intuitive
- ✅ Backup et restauration via phrase mnémonique

## 📋 Prérequis

1. **Node.js** et **npm** installés
2. **Expo CLI** configuré
3. **Testnet CHZ** dans votre wallet pour les transactions
4. **Clé privée** dans le fichier `.env` pour les déploiements

## 🔧 Installation et Configuration

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer le fichier .env
Créez un fichier `.env` à la racine du projet :
```env
SPICY_PRIVATE_KEY=votre_clé_privée_ici
```

### 3. Compiler les contrats
```bash
npm run compile:contracts
```

### 4. Déployer les contrats sur le testnet
```bash
npm run deploy:wallet
```

Cette commande va :
- Déployer le token ARENA (ERC20)
- Déployer le contrat Arena (paris)
- Déployer un Fan Token mock
- Mettre à jour automatiquement les adresses dans `web3Service.ts`

## 📱 Utilisation du Wallet

### Première utilisation

1. **Lancer l'application**
   ```bash
   npm start
   ```

2. **Aller dans l'onglet Wallet**
   - L'application détectera qu'aucun wallet n'existe
   - Vous pouvez soit créer un nouveau wallet, soit importer un existant

3. **Créer un nouveau wallet**
   - Appuyez sur "Créer un nouveau wallet"
   - **IMPORTANT** : Sauvegardez immédiatement la phrase mnémonique affichée
   - Cette phrase est nécessaire pour restaurer votre wallet

### Fonctionnalités principales

#### 🏦 Gestion des soldes
- **CHZ** : La crypto native du testnet Chiliz
- **ARENA** : Tokens de votre plateforme

#### 💳 Acheter des tokens ARENA
1. Saisissez le montant de tokens souhaité
2. Appuyez sur "Acheter"
3. La transaction sera automatiquement calculée et envoyée

#### 📤 Transférer des fonds
1. Choisissez le type (CHZ ou ARENA)
2. Saisissez l'adresse de destination
3. Indiquez le montant
4. Confirmez le transfert

#### 🔄 Actualiser les soldes
- Utilisez le bouton "Actualiser" pour mettre à jour vos soldes
- Les soldes se mettent à jour automatiquement toutes les 30 secondes

## 🛡️ Sécurité

### Sauvegarde du wallet
- **Phrase mnémonique** : Sauvegardez-la dans un endroit sûr et hors ligne
- **Ne partagez jamais** votre phrase mnémonique avec qui que ce soit
- La phrase mnémonique permet de restaurer votre wallet sur n'importe quel appareil

### Stockage sécurisé
- Les clés privées sont stockées de manière chiffrée dans le keychain du système
- Utilisation d'expo-secure-store pour la sécurité maximale
- Aucune donnée sensible n'est stockée en plain text

## 🔗 Configuration réseau

### Testnet Chiliz Spicy
- **RPC URL** : https://spicy-rpc.chiliz.com/
- **Chain ID** : 88882
- **Explorer** : https://testnet.chiliscan.com/

### Obtenir des CHZ de test
Vous pouvez obtenir des CHZ de test via le faucet Chiliz (si disponible) ou demander à quelqu'un qui possède déjà des CHZ testnet.

## 🧪 Tests et développement

### Structure des contrats
```
contracts/
├── Arena.sol           # Contrat principal des paris
├── ArenaToken.sol      # Token ERC20 ARENA
├── ArenaNft.sol        # NFTs (si utilisés)
└── mocks/
    └── ERC20Mock.sol   # Token mock pour les tests
```

### Services Web3
```
services/
├── web3Service.ts           # Service principal Web3
└── contractAddresses.json   # Adresses des contrats déployés
```

### Composants React Native
```
components/
└── WalletManager.tsx   # Interface principale du wallet

hooks/
└── useWallet.tsx       # Hook React pour la gestion du wallet
```

## 📞 Intégration avec Arena

Le wallet est automatiquement intégré avec votre système de paris :

1. **Approuver les tokens** avant de parier
2. **Placer des paris** avec vos tokens ARENA
3. **Récupérer les gains** directement dans votre wallet

## 🆘 Dépannage

### Problèmes courants

1. **Transaction échoue**
   - Vérifiez votre solde CHZ pour payer les frais de gas
   - Assurez-vous que les contrats sont déployés

2. **Wallet ne se charge pas**
   - Vérifiez votre connexion internet
   - Redémarrez l'application

3. **Soldes incorrects**
   - Appuyez sur "Actualiser"
   - Vérifiez que vous êtes sur le bon réseau

### Support
Pour toute question ou problème, vérifiez :
1. Les logs de la console pour les erreurs
2. L'explorateur de blocs pour vérifier les transactions
3. Votre solde CHZ pour les frais de gas

## 🔄 Mises à jour

Pour mettre à jour les contrats :
1. Modifiez les contrats Solidity
2. Recompilez : `npm run compile:contracts`
3. Redéployez : `npm run deploy:wallet`
4. Les adresses seront automatiquement mises à jour

---

🎉 **Félicitations !** Votre système de wallet est maintenant opérationnel sur le testnet Chiliz !
