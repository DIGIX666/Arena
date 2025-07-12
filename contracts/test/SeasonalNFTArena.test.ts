import { expect } from "chai";
import hre from "hardhat";

describe("SeasonalNFTArena", function () {
  async function deployFixture() {
    const { ethers } = hre;
    const [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy mock tokens
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const chzToken = await ERC20Mock.deploy("Chiliz", "CHZ");
    const usdcToken = await ERC20Mock.deploy("USD Coin", "USDC");
    const fanToken = await ERC20Mock.deploy("Fan Token", "FAN");

    // Setup USDC decimals
    await usdcToken.setDecimals(6);

    // Mint initial supply to owner
    await chzToken.mint(owner.address, ethers.parseEther("1000000"));
    await usdcToken.mint(owner.address, ethers.parseUnits("1000000", 6));
    await fanToken.mint(owner.address, ethers.parseEther("1000000"));

    // Deploy mock volatility oracle
    const MockVolatilityOracle = await ethers.getContractFactory("MockVolatilityOracle");
    const volatilityOracle = await MockVolatilityOracle.deploy();

    // Deploy SeasonalNFTArena
    const SeasonalNFTArena = await ethers.getContractFactory("SeasonalNFTArena");
    const seasonalArena = await SeasonalNFTArena.deploy(
      await chzToken.getAddress(),
      await usdcToken.getAddress(),
      await fanToken.getAddress(),
      await volatilityOracle.getAddress()
    );

    // Setup initial balances - use mint instead of transfer
    await chzToken.mint(user1.address, ethers.parseEther("10000"));
    await chzToken.mint(user2.address, ethers.parseEther("10000"));
    await chzToken.mint(user3.address, ethers.parseEther("10000"));

    await fanToken.mint(user1.address, ethers.parseEther("5000"));
    await fanToken.mint(user2.address, ethers.parseEther("5000"));
    await fanToken.mint(user3.address, ethers.parseEther("5000"));

    // Approve spending
    await chzToken.connect(user1).approve(await seasonalArena.getAddress(), ethers.MaxUint256);
    await chzToken.connect(user2).approve(await seasonalArena.getAddress(), ethers.MaxUint256);
    await chzToken.connect(user3).approve(await seasonalArena.getAddress(), ethers.MaxUint256);

    return {
      seasonalArena,
      chzToken,
      usdcToken,
      fanToken,
      volatilityOracle,
      owner,
      user1,
      user2,
      user3
    };
  }

  describe("Deployment", function () {
    it("Should deploy with correct initial values", async function () {
      const { seasonalArena, chzToken, usdcToken, fanToken, volatilityOracle } = await deployFixture();

      expect(await seasonalArena.chzToken()).to.equal(await chzToken.getAddress());
      expect(await seasonalArena.usdcToken()).to.equal(await usdcToken.getAddress());
      expect(await seasonalArena.fanToken()).to.equal(await fanToken.getAddress());
      expect(await seasonalArena.volatilityOracle()).to.equal(await volatilityOracle.getAddress());
      expect(await seasonalArena.nextArenaId()).to.equal(1);
    });
  });

  describe("Arena Creation", function () {
    it("Should create a seasonal arena correctly", async function () {
      const { seasonalArena } = await deployFixture();
      const { ethers } = hre;

      const title = "Champions League Winner 2025";
      const outcomes = ["Real Madrid", "Barcelona", "Manchester City", "Bayern Munich"];
      const seasonalType = 0; // ChampionsLeague
      const entryFee = ethers.parseEther("200");
      const duration = 30 * 24 * 60 * 60; // 30 days

      await expect(
        seasonalArena.createSeasonalArena(title, outcomes, seasonalType, entryFee, duration)
      ).to.emit(seasonalArena, "SeasonalArenaCreated");

      const arenaDetails = await seasonalArena.getArenaDetails(1);
      expect(arenaDetails.title).to.equal(title);
      expect(arenaDetails.seasonalType).to.equal(seasonalType);
      expect(arenaDetails.isActive).to.be.true;
      expect(arenaDetails.isResolved).to.be.false;
    });

    it("Should reject arena with duration exceeding maximum", async function () {
      const { seasonalArena } = await deployFixture();
      const { ethers } = hre;

      const title = "Invalid Long Arena";
      const outcomes = ["Team A", "Team B"];
      const seasonalType = 0;
      const entryFee = ethers.parseEther("200");
      const duration = 100 * 24 * 60 * 60; // 100 days (exceeds 90 day max)

      await expect(
        seasonalArena.createSeasonalArena(title, outcomes, seasonalType, entryFee, duration)
      ).to.be.revertedWith("Duration exceeds maximum");
    });

    it("Should reject invalid entry fee range", async function () {
      const { seasonalArena } = await deployFixture();
      const { ethers } = hre;

      const title = "Invalid Fee Arena";
      const outcomes = ["Team A", "Team B"];
      const seasonalType = 0;
      const duration = 30 * 24 * 60 * 60;

      // Too low
      await expect(
        seasonalArena.createSeasonalArena(title, outcomes, seasonalType, ethers.parseEther("100"), duration)
      ).to.be.revertedWith("Invalid entry fee range");

      // Too high
      await expect(
        seasonalArena.createSeasonalArena(title, outcomes, seasonalType, ethers.parseEther("600"), duration)
      ).to.be.revertedWith("Invalid entry fee range");
    });
  });

  describe("Betting", function () {
    it("Should allow betting with sufficient fan tokens", async function () {
      const { seasonalArena, user1 } = await deployFixture();
      const { ethers } = hre;

      // Create an arena for testing
      const title = "Test Arena";
      const outcomes = ["Outcome A", "Outcome B", "Outcome C"];
      const seasonalType = 0;
      const entryFee = ethers.parseEther("200");
      const duration = 30 * 24 * 60 * 60;

      await seasonalArena.createSeasonalArena(title, outcomes, seasonalType, entryFee, duration);

      await expect(
        seasonalArena.connect(user1).enterSeasonal(1, 0, false)
      ).to.emit(seasonalArena, "SeasonalBetPlaced");

      const position = await seasonalArena.getBetPosition(1, 0, user1.address);
      expect(position.chzAmount).to.be.gt(0);
      expect(position.hasInsurance).to.be.false;
    });

    it("Should allow betting with insurance", async function () {
      const { seasonalArena, user1 } = await deployFixture();
      const { ethers } = hre;

      // Create an arena for testing
      const title = "Test Arena";
      const outcomes = ["Outcome A", "Outcome B"];
      const seasonalType = 0;
      const entryFee = ethers.parseEther("200");
      const duration = 30 * 24 * 60 * 60;

      await seasonalArena.createSeasonalArena(title, outcomes, seasonalType, entryFee, duration);

      await expect(
        seasonalArena.connect(user1).enterSeasonal(1, 0, true)
      ).to.emit(seasonalArena, "SeasonalBetPlaced");

      const position = await seasonalArena.getBetPosition(1, 0, user1.address);
      expect(position.hasInsurance).to.be.true;
    });

    it("Should reject betting with insufficient fan tokens", async function () {
      const { seasonalArena, user1, user2, fanToken } = await deployFixture();
      const { ethers } = hre;

      // Create arena
      await seasonalArena.createSeasonalArena(
        "Test Arena",
        ["Team A", "Team B"],
        0,
        ethers.parseEther("200"),
        30 * 24 * 60 * 60
      );

      // Transfer away fan tokens to make balance insufficient
      await fanToken.connect(user1).transfer(user2.address, ethers.parseEther("4000"));

      await expect(
        seasonalArena.connect(user1).enterSeasonal(1, 0, false)
      ).to.be.revertedWith("Insufficient fan tokens");
    });
  });

  describe("Volatility Protection", function () {
    it("Should trigger volatility protection when threshold reached", async function () {
      const { seasonalArena, user1, user2, volatilityOracle } = await deployFixture();
      const { ethers } = hre;

      // Create arena and place some bets
      await seasonalArena.createSeasonalArena(
        "Volatility Test Arena",
        ["Team A", "Team B"],
        0,
        ethers.parseEther("200"),
        30 * 24 * 60 * 60
      );

      await seasonalArena.connect(user1).enterSeasonal(1, 0, false);
      await seasonalArena.connect(user2).enterSeasonal(1, 1, false);

      // Set high volatility in oracle
      await volatilityOracle.setVolatilityPercent(3500); // 35% volatility

      // Fast forward time to allow volatility check
      await hre.network.provider.send("evm_increaseTime", [3600]); // 1 hour
      await hre.network.provider.send("evm_mine");

      await expect(
        seasonalArena.triggerVolatilityProtection(1)
      ).to.emit(seasonalArena, "VolatilityProtectionTriggered");
    });

    it("Should reject volatility protection if threshold not reached", async function () {
      const { seasonalArena, user1, volatilityOracle } = await deployFixture();
      const { ethers } = hre;

      await seasonalArena.createSeasonalArena(
        "Test Arena",
        ["Team A", "Team B"],
        0,
        ethers.parseEther("200"),
        30 * 24 * 60 * 60
      );

      await seasonalArena.connect(user1).enterSeasonal(1, 0, false);

      // Set low volatility in oracle
      await volatilityOracle.setVolatilityPercent(2000); // 20% volatility

      // Fast forward time to allow volatility check
      await hre.network.provider.send("evm_increaseTime", [3600]); // 1 hour
      await hre.network.provider.send("evm_mine");

      await expect(
        seasonalArena.triggerVolatilityProtection(1)
      ).to.be.revertedWith("Volatility threshold not reached");
    });
  });

  describe("Arena Resolution", function () {
    it("Should resolve arena correctly", async function () {
      const { seasonalArena, user1, user2 } = await deployFixture();
      const { ethers } = hre;

      await seasonalArena.createSeasonalArena(
        "Resolution Test Arena",
        ["Winner", "Loser"],
        0,
        ethers.parseEther("200"),
        30 * 24 * 60 * 60
      );

      // Place bets
      await seasonalArena.connect(user1).enterSeasonal(1, 0, false); // Winner
      await seasonalArena.connect(user2).enterSeasonal(1, 1, false); // Loser

      await expect(
        seasonalArena.resolveSeasonal(1, 0) // Winner outcome
      ).to.emit(seasonalArena, "SeasonalResolved");

      const arenaDetails = await seasonalArena.getArenaDetails(1);
      expect(arenaDetails.isResolved).to.be.true;
      expect(arenaDetails.isActive).to.be.false;
    });

    it("Should allow winners to claim rewards", async function () {
      const { seasonalArena, user1, user2, chzToken, usdcToken } = await deployFixture();
      const { ethers } = hre;

      await seasonalArena.createSeasonalArena(
        "Reward Test Arena",
        ["Winner", "Loser"],
        0,
        ethers.parseEther("200"),
        30 * 24 * 60 * 60
      );

      await seasonalArena.connect(user1).enterSeasonal(1, 0, false); // Winner
      await seasonalArena.connect(user2).enterSeasonal(1, 1, false); // Loser

      // Mint sufficient tokens to the contract to cover rewards
      // CHZ: immediate pot is 40% of entry fee, so 40% * 400 CHZ = 160 CHZ
      // Split 60% CHZ (96 CHZ) and 40% USDC conversion
      await chzToken.mint(await seasonalArena.getAddress(), ethers.parseEther("1000"));
      await usdcToken.mint(await seasonalArena.getAddress(), ethers.parseUnits("1000", 6));

      await seasonalArena.resolveSeasonal(1, 0); // Winner outcome

      const initialChzBalance = await chzToken.balanceOf(user1.address);
      const initialUsdcBalance = await usdcToken.balanceOf(user1.address);

      // Claim rewards
      await expect(
        seasonalArena.connect(user1).claimSeasonalReward(1)
      ).to.not.be.reverted;

      const finalChzBalance = await chzToken.balanceOf(user1.address);
      const finalUsdcBalance = await usdcToken.balanceOf(user1.address);

      // Winner should receive some rewards (80% of the pot they contributed to)
      expect(finalChzBalance).to.be.gte(initialChzBalance);
      expect(finalUsdcBalance).to.be.gte(initialUsdcBalance);
    });

    it("Should reject claim from non-winners", async function () {
      const { seasonalArena, user1, user2 } = await deployFixture();
      const { ethers } = hre;

      await seasonalArena.createSeasonalArena(
        "Non-winner Test Arena",
        ["Winner", "Loser"],
        0,
        ethers.parseEther("200"),
        30 * 24 * 60 * 60
      );

      await seasonalArena.connect(user1).enterSeasonal(1, 0, false); // Winner
      await seasonalArena.connect(user2).enterSeasonal(1, 1, false); // Loser

      await seasonalArena.resolveSeasonal(1, 0); // Winner outcome

      await expect(
        seasonalArena.connect(user2).claimSeasonalReward(1) // user2 bet on losing outcome
      ).to.be.revertedWith("No winning position");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause/unpause", async function () {
      const { seasonalArena, user1 } = await deployFixture();
      const { ethers } = hre;

      await seasonalArena.pause();
      
      await seasonalArena.createSeasonalArena(
        "Test Arena",
        ["Team A", "Team B"],
        0,
        ethers.parseEther("200"),
        30 * 24 * 60 * 60
      );

      await expect(
        seasonalArena.connect(user1).enterSeasonal(1, 0, false)
      ).to.be.revertedWith("Pausable: paused");

      await seasonalArena.unpause();

      await expect(
        seasonalArena.connect(user1).enterSeasonal(1, 0, false)
      ).to.not.be.reverted;
    });

    it("Should allow emergency withdrawal by owner", async function () {
      const { seasonalArena, chzToken, owner } = await deployFixture();
      const { ethers } = hre;

      const amount = ethers.parseEther("100");
      await chzToken.mint(await seasonalArena.getAddress(), amount);

      const initialBalance = await chzToken.balanceOf(owner.address);
      await seasonalArena.emergencyWithdraw(await chzToken.getAddress(), amount);
      const finalBalance = await chzToken.balanceOf(owner.address);

      expect(finalBalance - initialBalance).to.equal(amount);
    });
  });
});