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

  const usdcToken = await ERC20Mock.deploy("Test USDC", "TUSDC");
  await usdcToken.waitForDeployment();
  await usdcToken.setDecimals(6); // USDC has 6 decimals
  const usdcTokenAddress = await usdcToken.getAddress();
  console.log(`✅ USDC Token (TUSDC) déployé à l'adresse : ${usdcTokenAddress}`);
  
  console.log("----------------------------------------------------");

  // 2. Déployer le MockVolatilityOracle
  const MockVolatilityOracle = await ethers.getContractFactory("MockVolatilityOracle");
  const volatilityOracle = await MockVolatilityOracle.deploy();
  await volatilityOracle.waitForDeployment();
  const volatilityOracleAddress = await volatilityOracle.getAddress();
  console.log(`✅ MockVolatilityOracle déployé à l'adresse : ${volatilityOracleAddress}`);

  console.log("----------------------------------------------------");

  // 3. Déployer le contrat SimpleDuel
  const SimpleDuel = await ethers.getContractFactory("SimpleDuel");
  const simpleDuelContract = await SimpleDuel.deploy(bettingTokenAddress, fanTokenAddress, 18, 18);
  await simpleDuelContract.waitForDeployment();
  const simpleDuelAddress = await simpleDuelContract.getAddress();
  console.log(`✅ Contrat SimpleDuel déployé à l'adresse : ${simpleDuelAddress}`);

  console.log("----------------------------------------------------");

  // 4. Déployer le contrat SeasonalNFTArena
  const SeasonalNFTArena = await ethers.getContractFactory("SeasonalNFTArena");
  const seasonalArenaContract = await SeasonalNFTArena.deploy(
    bettingTokenAddress,   // _chzToken
    usdcTokenAddress,      // _usdcToken  
    fanTokenAddress,       // _fanToken
    volatilityOracleAddress // _volatilityOracle
  );
  await seasonalArenaContract.waitForDeployment();
  const seasonalArenaAddress = await seasonalArenaContract.getAddress();
  console.log(`✅ Contrat SeasonalNFTArena déployé à l'adresse : ${seasonalArenaAddress}`);

  console.log("----------------------------------------------------");

  // 5. Déployer le contrat ArenaNFT
  const ArenaNFT = await ethers.getContractFactory("ArenaNFT");
  // Le constructeur de ArenaNFT prend le nom, le symbole, et l'adresse du signataire (on utilise le déployeur pour le test)
  const nftContract = await ArenaNFT.deploy("BetFi Exclusive NFT", "BFE", deployer.address);
  await nftContract.waitForDeployment();
  const nftArenaAddress = await nftContract.getAddress();
  console.log(`✅ Contrat ArenaNFT déployé à l'adresse : ${nftArenaAddress}`);
  console.log("----------------------------------------------------");

  // 6. Distribuer des tokens de test (montants réduits pour économiser)
  const mintAmount = ethers.parseEther("100"); // 100 tokens au lieu de plus
  const usdcMintAmount = ethers.parseUnits("100", 6); // 100 USDC with 6 decimals
  await bettingToken.mint(deployer.address, mintAmount);
  await fanToken.mint(deployer.address, mintAmount);
  await usdcToken.mint(deployer.address, usdcMintAmount);
  console.log(`✅ Tokens distribués: ${ethers.formatEther(mintAmount)} CHZ/PSG, ${ethers.formatUnits(usdcMintAmount, 6)} USDC`);
  
  console.log("🎉 Tous les contrats ont été déployés !");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
