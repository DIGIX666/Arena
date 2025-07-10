import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Arena", function () {
async function deployFixture() {
    const {ethers} = hre;
    
    const [owner, userA, userB] = await ethers.getSigners();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const bettingToken = await ERC20Mock.deploy("Chiliz Test", "CHZ");
    const fanToken = await ERC20Mock.deploy("PSG Test", "PSG");

    const BetFiArenaV2 = await ethers.getContractFactory("BetFiArenaV2");
    const arenaContract = await BetFiArenaV2.deploy(await bettingToken.getAddress(), await fanToken.getAddress());

    // Mint tokens with 18 decimals
    await bettingToken.mint(userA.address, ethers.parseUnits("1000", 18));
    await bettingToken.mint(userB.address, ethers.parseUnits("1000", 18));
    await fanToken.mint(userA.address, ethers.parseUnits("500", 18)); // Use 18 decimals

    // Approve the contract to spend tokens
    await bettingToken.connect(userA).approve(await arenaContract.getAddress(), ethers.parseUnits("1000", 18));
    await bettingToken.connect(userB).approve(await arenaContract.getAddress(), ethers.parseUnits("1000", 18));
    
    return { arenaContract, bettingToken, fanToken, owner, userA, userB };
}

it("should allow users to bet and a winner to claim correct gains with bonus", async function () {
    const { arenaContract, bettingToken, fanToken, userA, userB } = await deployFixture();
    const deadline = (await time.latest()) + 3600;

    // 1. Création de l'arène
    await arenaContract.createArena("Vainqueur", ["EquipeA", "EquipeB"], deadline);

    // 2. Paris (montants réduits pour moins de coût)
    await arenaContract.connect(userA).placeBet(0, 0, ethers.parseUnits("10", 18));
    await arenaContract.connect(userB).placeBet(0, 1, ethers.parseUnits("20", 18));

    // 3. Résolution
    await time.increaseTo(deadline + 1);
    await arenaContract.resolveArena(0, 0);

    // 4. Calcul du gain attendu pour userA
    const potTotal = ethers.parseUnits("30", 18);
    const potNet = (potTotal * BigInt(96)) / BigInt(100); // 28.8 * 10^18
    const winningPool = ethers.parseUnits("10", 18);
    const userABet = ethers.parseUnits("10", 18);
    const baseGain = (userABet * potNet) / winningPool; // 28.8 * 10^18
    
    // Puisque userA gagne seul, il reçoit tout le pot net (pas de bonus car pas de surplus)
    const expectedFinalGain = baseGain; // 28.8 * 10^18

    // 5. Vérification
    await expect(
        arenaContract.connect(userA).claimGains(0)
    ).to.changeTokenBalances(bettingToken, [userA, arenaContract], [expectedFinalGain, -expectedFinalGain]);

    // Vérifier qu'un perdant ne peut pas réclamer
    await expect(arenaContract.connect(userB).claimGains(0)).to.be.revertedWith("You have no winning bets or have already claimed");
});
});
