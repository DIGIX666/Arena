import hardhat from 'hardhat';
import fs from 'fs';

const { ethers } = hardhat;

async function main() {
  // Récupère le factory du contrat
  const Factory = await ethers.getContractFactory('UserProfile');

  // Déploie le contrat et attend la confirmation
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  // Récupère l’adresse déployée
  const address = contract.target; // ou await contract.getAddress()

  console.log('UserProfile deployed at:', address);

  // Enregistre l’adresse dans un JSON
  fs.writeFileSync(
    'deployed.json',
    JSON.stringify({ address }, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});