import hre from "hardhat";

async function main() {
      const {ethers} = hre;

  const [deployer] = await ethers.getSigners();
  console.log("Déploiement des contrats avec le compte :", deployer.address);
  console.log("----------------------------------------------------");

  // 1. Déployer les Faux Tokens ERC20 pour le test
  const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
  
  const bettingToken = await ERC20Mock.deploy("Test CHZ", "TCHZ");
  await bettingToken.waitForDeployment();
  const bettingTokenAddress = await bettingToken.getAddress();
  console.log(`✅ Token de Pari (TCHZ) déployé à l'adresse : ${bettingTokenAddress}`);

  const fanToken = await ERC20Mock.deploy("Test PSG", "TPSG");
  await fanToken.waitForDeployment();
  const fanTokenAddress = await fanToken.getAddress();
  console.log(`✅ Fan Token (TPSG) déployé à l'adresse : ${fanTokenAddress}`);
  
  console.log("----------------------------------------------------");

  // 2. Déployer le contrat BetFiArenaV2 avec les adresses des tokens
  const BetFiArenaV2 = await ethers.getContractFactory("BetFiArenaV2");
  const arenaContract = await BetFiArenaV2.deploy(bettingTokenAddress, fanTokenAddress);
  await arenaContract.waitForDeployment();
  const arenaAddress = await arenaContract.getAddress();
  console.log(`✅ Contrat BetFiArenaV2 déployé à l'adresse : ${arenaAddress}`);

  console.log("----------------------------------------------------");

  // 3. Déployer le contrat ArenaNFT
  const ArenaNFT = await ethers.getContractFactory("ArenaNFT");
  // Le constructeur de ArenaNFT prend le nom, le symbole, et l'adresse du signataire (on utilise le déployeur pour le test)
  const nftContract = await ArenaNFT.deploy("BetFi Exclusive NFT", "BFE", deployer.address);
  await nftContract.waitForDeployment();
  const nftArenaAddress = await nftContract.getAddress();
  console.log(`✅ Contrat ArenaNFT déployé à l'adresse : ${nftArenaAddress}`);
  console.log("----------------------------------------------------");

  // 4. Distribuer des tokens de test (montants réduits pour économiser)
  const mintAmount = ethers.parseEther("100"); // 100 tokens au lieu de plus
  await bettingToken.mint(deployer.address, mintAmount);
  await fanToken.mint(deployer.address, mintAmount);
  console.log(`✅ Tokens distribués: ${ethers.formatEther(mintAmount)} de chaque`);
  
  console.log("🎉 Tous les contrats ont été déployés !");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
