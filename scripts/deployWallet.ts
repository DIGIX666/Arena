import fs from 'fs';
import { ethers } from "hardhat";
import path from 'path';

async function main() {
  console.log("🚀 Déploiement des contrats sur Chiliz Spicy Testnet...");

  // Déployer le token ARENA
  console.log("📦 Déploiement du token ARENA...");
  const ArenaToken = await ethers.getContractFactory("ArenaToken");
  const arenaToken = await ArenaToken.deploy();
  await arenaToken.waitForDeployment();
  const arenaTokenAddress = await arenaToken.getAddress();
  console.log(`✅ Token ARENA déployé à: ${arenaTokenAddress}`);

  // Déployer un token ERC20 mock pour les fan tokens (bonus)
  console.log("📦 Déploiement du Fan Token Mock...");
  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
  const fanToken = await ERC20Mock.deploy("Fan Token", "FAN", ethers.parseEther("1000000"));
  await fanToken.waitForDeployment();
  const fanTokenAddress = await fanToken.getAddress();
  console.log(`✅ Fan Token déployé à: ${fanTokenAddress}`);

  // Déployer le contrat Arena
  console.log("📦 Déploiement du contrat Arena...");
  const Arena = await ethers.getContractFactory("BetFiArenaV2");
  const arena = await Arena.deploy(arenaTokenAddress, fanTokenAddress);
  await arena.waitForDeployment();
  const arenaAddress = await arena.getAddress();
  console.log(`✅ Arena déployé à: ${arenaAddress}`);

  // Transférer des tokens au contrat Arena pour les ventes
  console.log("💰 Transfert de tokens vers le contrat Arena...");
  const transferAmount = ethers.parseEther("500000"); // 500k tokens
  await arenaToken.transfer(arenaAddress, transferAmount);
  console.log(`✅ ${ethers.formatEther(transferAmount)} tokens transférés vers Arena`);

  // Sauvegarder les adresses de contrats
  const contractAddresses = {
    ARENA_TOKEN: arenaTokenAddress,
    ARENA: arenaAddress,
    FAN_TOKEN: fanTokenAddress,
    NETWORK: "chiliz-spicy-testnet",
    DEPLOYED_AT: new Date().toISOString()
  };

  const contractsPath = path.join(__dirname, '..', 'services', 'contractAddresses.json');
  fs.writeFileSync(contractsPath, JSON.stringify(contractAddresses, null, 2));
  console.log(`📝 Adresses sauvegardées dans: ${contractsPath}`);

  // Mettre à jour le fichier web3Service.ts
  const web3ServicePath = path.join(__dirname, '..', 'services', 'web3Service.ts');
  let web3ServiceContent = fs.readFileSync(web3ServicePath, 'utf8');
  
  // Remplacer les adresses vides
  web3ServiceContent = web3ServiceContent.replace(
    /ARENA_TOKEN: '',/,
    `ARENA_TOKEN: '${arenaTokenAddress}',`
  );
  web3ServiceContent = web3ServiceContent.replace(
    /ARENA: '',/,
    `ARENA: '${arenaAddress}',`
  );
  web3ServiceContent = web3ServiceContent.replace(
    /FAN_TOKEN: '',/,
    `FAN_TOKEN: '${fanTokenAddress}',`
  );

  fs.writeFileSync(web3ServicePath, web3ServiceContent);
  console.log(`🔧 web3Service.ts mis à jour avec les nouvelles adresses`);

  console.log("\n🎉 Déploiement terminé avec succès!");
  console.log("\n📋 Résumé des contrats:");
  console.log(`   - Token ARENA: ${arenaTokenAddress}`);
  console.log(`   - Arena Contract: ${arenaAddress}`);
  console.log(`   - Fan Token: ${fanTokenAddress}`);
  console.log(`\n🔗 Explorateur: https://testnet.chiliscan.com/`);
  console.log(`\n💡 Vous pouvez maintenant utiliser votre DApp avec ces contrats!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur lors du déploiement:", error);
    process.exit(1);
  });
