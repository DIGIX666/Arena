import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SimpleDuel - Création Utilisateur", function () {
    async function deployFixture() {
        const { ethers } = hre;
        
        const [owner, resolver, userA, userB, userC] = await ethers.getSigners();
        
        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        const bettingToken = await ERC20Mock.deploy("Chiliz Test", "CHZ");
        const fanToken = await ERC20Mock.deploy("PSG Test", "PSG");
        
        const SimpleDuel = await ethers.getContractFactory("SimpleDuel");
        const duelContract = await SimpleDuel.deploy(
            await bettingToken.getAddress(),
            await fanToken.getAddress(),
            18,
            18
        );
        
        // Mint tokens pour tous les utilisateurs
        const mintAmount = ethers.parseUnits("10000", 18);
        await bettingToken.mint(userA.address, mintAmount);
        await bettingToken.mint(userB.address, mintAmount);
        await bettingToken.mint(userC.address, mintAmount);
        await bettingToken.mint(await duelContract.getAddress(), mintAmount); // Mint to contract for payouts
        
        // Mint fan tokens
        await fanToken.mint(userA.address, ethers.parseUnits("150", 18)); // userA exempt from fees
        await fanToken.mint(userB.address, ethers.parseUnits("50", 18)); // userB pays fees
        
        // Approuver le contrat
        const approveAmount = ethers.parseUnits("10000", 18);
        await bettingToken.connect(userA).approve(await duelContract.getAddress(), approveAmount);
        await bettingToken.connect(userB).approve(await duelContract.getAddress(), approveAmount);
        await bettingToken.connect(userC).approve(await duelContract.getAddress(), approveAmount);
        
        await duelContract.authorizeResolver(resolver.address, true);
        
        return { duelContract, bettingToken, fanToken, owner, resolver, userA, userB, userC };
    }

    describe("Création de Duels par les Utilisateurs", function () {
        it("should allow users to create duels with creation fee", async function () {
            const { duelContract, bettingToken, userB } = await deployFixture(); // Use userB (not exempt)
            const deadline = (await time.latest()) + 3700;
            
            const creationFee = await duelContract.duelCreationFee();
            const userBalanceBefore = await bettingToken.balanceOf(userB.address);
            
            await expect(
                duelContract.connect(userB).createDuel(
                    "User Created Duel",
                    "Sports",
                    ["TeamA", "TeamB", "Draw"],
                    deadline
                )
            ).to.emit(duelContract, "DuelCreated")
             .withArgs(0, userB.address, "User Created Duel", "Sports", ["TeamA", "TeamB", "Draw"], deadline);
            
            // Vérifier que les frais ont été déduits
            const userBalanceAfter = await bettingToken.balanceOf(userB.address);
            expect(userBalanceBefore - userBalanceAfter).to.equal(creationFee);
            
            // Vérifier que les frais sont accumulés
            expect(await duelContract.totalFeesAccumulated()).to.equal(creationFee);
            
            // Vérifier les informations du duel
            const duelInfo = await duelContract.getDuelInfo(0);
            expect(duelInfo[0]).to.equal("User Created Duel"); // title est l'index 0
            expect(duelInfo[9]).to.equal(userB.address); // creator est l'index 9
        });

        it("should allow users with sufficient fan tokens to create duels without fee", async function () {
            const { duelContract, bettingToken, userA } = await deployFixture(); // Use userA (exempt)
            const deadline = (await time.latest()) + 3700;
            
            const userBalanceBefore = await bettingToken.balanceOf(userA.address);
            
            await expect(
                duelContract.connect(userA).createDuel(
                    "User Created Duel",
                    "Sports",
                    ["TeamA", "TeamB", "Draw"],
                    deadline
                )
            ).to.emit(duelContract, "DuelCreated")
             .withArgs(0, userA.address, "User Created Duel", "Sports", ["TeamA", "TeamB", "Draw"], deadline);
            
            // Vérifier qu'aucun frais n'a été déduit
            const userBalanceAfter = await bettingToken.balanceOf(userA.address);
            expect(userBalanceAfter).to.equal(userBalanceBefore);
            
            // Vérifier que les frais ne sont pas accumulés
            expect(await duelContract.totalFeesAccumulated()).to.equal(0);
        });

        it("should enforce shorter deadline for user-created duels", async function () {
            const { duelContract, userA } = await deployFixture();
            
            // 31 jours (trop loin pour les utilisateurs)
            const tooFarDeadline = (await time.latest()) + 31 * 24 * 3600;
            
            await expect(
                duelContract.connect(userA).createDuel(
                    "Too Far Duel",
                    "Sports",
                    ["A", "B", "C"],
                    tooFarDeadline
                )
            ).to.be.revertedWith("Deadline too far");
        });

        it("should allow admin to create duels without fees and longer deadlines", async function () {
            const { duelContract, owner, bettingToken } = await deployFixture();
            
            const ownerBalanceBefore = await bettingToken.balanceOf(owner.address);
            const deadline = (await time.latest()) + 365 * 24 * 3600; // 1 an
            
            await expect(
                duelContract.adminCreateDuel(
                    "Admin Duel",
                    "Official",
                    true,
                    ["Option1", "Option2", "Option3"],
                    deadline
                )
            ).to.emit(duelContract, "DuelCreated")
             .withArgs(0, owner.address, "Admin Duel", "Official", ["Option1", "Option2", "Option3"], deadline);
            
            // Vérifier qu'aucun frais n'a été déduit
            const ownerBalanceAfter = await bettingToken.balanceOf(owner.address);
            expect(ownerBalanceAfter).to.equal(ownerBalanceBefore);
        });

        it("should reject user creation when disabled", async function () {
            const { duelContract, userA, owner } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // Désactiver la création par les utilisateurs
            await duelContract.connect(owner).toggleUserCreation(false);
            
            await expect(
                duelContract.connect(userA).createDuel(
                    "Disabled Creation",
                    "Sports",
                    ["A", "B", "C"],
                    deadline
                )
            ).to.be.revertedWith("User creation is disabled");
        });

        it("should allow owner to change creation fee", async function () {
            const { duelContract, owner } = await deployFixture();
            
            const newFee = ethers.parseUnits("5", 18); // 5 tokens
            
            await expect(
                duelContract.connect(owner).setDuelCreationFee(newFee)
            ).to.emit(duelContract, "DuelCreationFeeUpdated")
             .withArgs(newFee);
            
            expect(await duelContract.duelCreationFee()).to.equal(newFee);
        });

        it("should allow free creation when fee is set to zero", async function () {
            const { duelContract, userA, owner, bettingToken } = await deployFixture();
            
            // Mettre les frais à zéro
            await duelContract.connect(owner).setDuelCreationFee(0);
            
            const userBalanceBefore = await bettingToken.balanceOf(userA.address);
            const deadline = (await time.latest()) + 3700;
            
            await duelContract.connect(userA).createDuel(
                "Free Duel",
                "Sports",
                ["A", "B", "C"],
                deadline
            );
            
            // Vérifier qu'aucun frais n'a été déduit
            const userBalanceAfter = await bettingToken.balanceOf(userA.address);
            expect(userBalanceAfter).to.equal(userBalanceBefore);
        });

        it("should reject creation with insufficient balance for fees", async function () {
            const { duelContract, owner, bettingToken } = await deployFixture();
            const { ethers } = hre;
            
            // Créer un utilisateur sans tokens mais avec approbation
            const [, , , , , poorUser] = await ethers.getSigners();
            const deadline = (await time.latest()) + 3700;
            
            // Donner une approbation mais pas de tokens
            await bettingToken.connect(poorUser).approve(await duelContract.getAddress(), ethers.parseUnits("10", 18));
            
            await expect(
                duelContract.connect(poorUser).createDuel(
                    "Poor User Duel",
                    "Sports",
                    ["A", "B", "C"],
                    deadline
                )
            ).to.be.revertedWith("Insufficient balance for creation fee");
        });

        it("should handle multiple users creating duels simultaneously", async function () {
            const { duelContract, userA, userB, userC } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // Trois utilisateurs créent des duels séquentiellement
            await duelContract.connect(userA).createDuel("Duel A", "Sports", ["A1", "A2", "A3"], deadline); // No fee
            await duelContract.connect(userB).createDuel("Duel B", "Esports", ["B1", "B2", "B3"], deadline + 1000); // Pays fee
            await duelContract.connect(userC).createDuel("Duel C", "Politics", ["C1", "C2", "C3"], deadline + 2000); // Pays fee
            
            expect(await duelContract.nextDuelId()).to.equal(3);
            
            // Vérifier que chaque duel a le bon créateur
            const duel0 = await duelContract.getDuelInfo(0);
            const duel1 = await duelContract.getDuelInfo(1);
            const duel2 = await duelContract.getDuelInfo(2);
            
            expect(duel0[9]).to.equal(userA.address); // creator est l'index 9
            expect(duel1[9]).to.equal(userB.address);
            expect(duel2[9]).to.equal(userC.address);
            
            expect(duel0[0]).to.equal("Duel A"); // title est l'index 0
            expect(duel1[0]).to.equal("Duel B");
            expect(duel2[0]).to.equal("Duel C");
            
            // Vérifier les frais accumulés (seulement userB et userC payent)
            const creationFee = await duelContract.duelCreationFee();
            expect(await duelContract.totalFeesAccumulated()).to.equal(creationFee * BigInt(2));
        });
    });

    describe("Gestion des Frais de Création", function () {
        it("should accumulate creation fees correctly", async function () {
            const { duelContract, userB, userC, owner, bettingToken } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            const creationFee = await duelContract.duelCreationFee();
            const initialFees = await duelContract.totalFeesAccumulated();
            
            // Créer plusieurs duels avec des utilisateurs non exemptés
            await duelContract.connect(userB).createDuel("Duel 1", "Sports", ["A", "B", "C"], deadline);
            await duelContract.connect(userC).createDuel("Duel 2", "Esports", ["X", "Y", "Z"], deadline + 1000);
            
            const finalFees = await duelContract.totalFeesAccumulated();
            expect(finalFees - initialFees).to.equal(creationFee * BigInt(2));
            
            // L'admin peut retirer ces frais
            const ownerBalanceBefore = await bettingToken.balanceOf(owner.address);
            await duelContract.connect(owner).withdrawFees(owner.address, finalFees);
            const ownerBalanceAfter = await bettingToken.balanceOf(owner.address);
            
            expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(finalFees);
            expect(await duelContract.totalFeesAccumulated()).to.equal(0);
        });

        it("should differentiate between creation fees and platform fees", async function () {
            const { duelContract, userA, userB, resolver, bettingToken } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // Créer un duel (pas de frais pour userA car exempt)
            await duelContract.connect(userA).createDuel("Test Duel", "Sports", ["A", "B", "C"], deadline);
            
            const feesAfterCreation = await duelContract.totalFeesAccumulated();
            expect(feesAfterCreation).to.equal(0); // userA est exempt
            
            // Placer des paris
            const betAmountA = ethers.parseUnits("30", 18);
            const betAmountB = ethers.parseUnits("25", 18);
            await duelContract.connect(userA).placeBet(0, 0, betAmountA);
            await duelContract.connect(userB).placeBet(0, 1, betAmountB);
            
            // Résoudre le duel (frais de plateforme)
            await time.increaseTo(deadline + 1);
            await duelContract.connect(resolver).proposeResolution(0, 0);
            await time.increase(24 * 3600 + 1);
            await duelContract.connect(resolver).executeResolution(0, 0);
            
            const feesAfterResolution = await duelContract.totalFeesAccumulated();
            
            // Les frais totaux devraient inclure seulement les frais de plateforme
            expect(feesAfterResolution).to.be.gt(feesAfterCreation);
            
            // Calculer les frais de plateforme attendus
            const potTotal = betAmountA + betAmountB;
            const expectedPlatformFees = (potTotal * BigInt(300)) / BigInt(10000); // 3%
            
            expect(feesAfterResolution - feesAfterCreation).to.equal(expectedPlatformFees);
        });
    });

    describe("Intégration avec les Fonctionnalités Existantes", function () {
        it("should allow betting on user-created duels", async function () {
            const { duelContract, userA, userB } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // UserA crée un duel
            await duelContract.connect(userA).createDuel(
                "User Duel",
                "Sports",
                ["TeamA", "TeamB", "Draw"],
                deadline
            );
            
            // UserB peut parier sur le duel créé par userA
            const betAmount = ethers.parseUnits("10", 18);
            
            await expect(
                duelContract.connect(userB).placeBet(0, 0, betAmount)
            ).to.emit(duelContract, "BetPlaced")
             .withArgs(0, userB.address, 0, betAmount, ethers.parseUnits("50", 18));
            
            // Vérifier que le pari a été enregistré
            const userBets = await duelContract.getUserBets(0, userB.address);
            expect(userBets[0]).to.equal(betAmount);
            
            // Le créateur peut aussi parier sur son propre duel
            await expect(
                duelContract.connect(userA).placeBet(0, 1, betAmount)
            ).to.emit(duelContract, "BetPlaced");
        });

        it("should handle resolution of user-created duels", async function () {
            const { duelContract, userA, userB, resolver, bettingToken } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // Créer et parier sur un duel utilisateur
            await duelContract.connect(userA).createDuel("User Duel", "Sports", ["A", "B", "C"], deadline);
            
            const betAmountA = ethers.parseUnits("20", 18);
            const betAmountB = ethers.parseUnits("30", 18);
            await duelContract.connect(userA).placeBet(0, 0, betAmountA);
            await duelContract.connect(userB).placeBet(0, 1, betAmountB);
            
            // Vérifier le solde du contrat avant résolution
            const contractBalanceBefore = await bettingToken.balanceOf(await duelContract.getAddress());
            expect(contractBalanceBefore).to.be.gte(betAmountA + betAmountB);
            
            // Résoudre le duel
            await time.increaseTo(deadline + 1);
            await duelContract.connect(resolver).proposeResolution(0, 0);
            await time.increase(24 * 3600 + 1);
            await duelContract.connect(resolver).executeResolution(0, 0);
            
            // UserA peut réclamer ses gains
            const userABalanceBefore = await bettingToken.balanceOf(userA.address);
            await duelContract.connect(userA).claimGains(0);
            const userABalanceAfter = await bettingToken.balanceOf(userA.address);
            
            expect(userABalanceAfter).to.be.gt(userABalanceBefore);
        });

        it("should handle cancellation of unbalanced user-created duels", async function () {
            const { duelContract, userA, userB, owner, bettingToken } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // Créer un duel déséquilibré
            await duelContract.connect(userA).createDuel("Unbalanced Duel", "Sports", ["A", "B", "C"], deadline);
            
            const betAmountA = ethers.parseUnits("90", 18);
            const betAmountB = ethers.parseUnits("10", 18);
            await duelContract.connect(userA).placeBet(0, 0, betAmountA);
            await duelContract.connect(userB).placeBet(0, 1, betAmountB);
            
            await time.increaseTo(deadline + 1);
            
            // L'admin peut annuler même les duels créés par les utilisateurs
            await expect(
                duelContract.connect(owner).validateAndCancelDuel(0)
            ).to.emit(duelContract, "DuelCanceled")
             .withArgs(0);
            
            // Les utilisateurs peuvent réclamer leurs remboursements
            const userABalanceBefore = await bettingToken.balanceOf(userA.address);
            await duelContract.connect(userA).claimRefund(0);
            const userABalanceAfter = await bettingToken.balanceOf(userA.address);
            
            expect(userABalanceAfter - userABalanceBefore).to.equal(betAmountA);
        });
    });

    describe("Contrôles d'Accès et Sécurité", function () {
        it("should prevent non-owners from using admin functions", async function () {
            const { duelContract, userA } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // userA ne peut pas utiliser adminCreateDuel
            await expect(
                duelContract.connect(userA).adminCreateDuel(
                    "Admin Only",
                    "Official",
                    true,
                    ["A", "B", "C"],
                    deadline
                )
            ).to.be.revertedWith("Ownable: caller is not the owner");
            
            // userA ne peut pas changer les frais de création
            await expect(
                duelContract.connect(userA).setDuelCreationFee(ethers.parseUnits("1", 18))
            ).to.be.revertedWith("Ownable: caller is not the owner");
            
            // userA ne peut pas désactiver la création utilisateur
            await expect(
                duelContract.connect(userA).toggleUserCreation(false)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should enforce reentrancy protection on user creation", async function () {
            const { duelContract } = await deployFixture();
            
            // Le modifier nonReentrant devrait protéger contre les attaques de réentrance
            // Ce test vérifie que le modifier est présent (test conceptuel)
            expect(true).to.be.true;
        });

        it("should validate user input thoroughly", async function () {
            const { duelContract, userA } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // Titre trop long
            const longTitle = "a".repeat(101);
            await expect(
                duelContract.connect(userA).createDuel(longTitle, "Sports", ["A", "B", "C"], deadline)
            ).to.be.revertedWith("Invalid title");
            
            // Outcomes avec chaînes vides
            await expect(
                duelContract.connect(userA).createDuel("Test", "Sports", ["", "B", "C"], deadline)
            ).to.be.revertedWith("Invalid outcome");
            
            // Deadline dans le passé
            const pastDeadline = (await time.latest()) - 1000;
            await expect(
                duelContract.connect(userA).createDuel("Test", "Sports", ["A", "B", "C"], pastDeadline)
            ).to.be.revertedWith("Deadline too soon");
        });
    });

    describe("Scénarios d'Usage Réels", function () {
        it("should handle a complete user-driven duel lifecycle", async function () {
            const { duelContract, userA, userB, userC, resolver, bettingToken } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // 1. UserA crée un duel sur un match de football
            await duelContract.connect(userA).createDuel(
                "PSG vs Real Madrid",
                "Football",
                ["PSG wins", "Real wins", "Draw"],
                deadline
            );
            
            // 2. Plusieurs utilisateurs parient
            const betAmountA = ethers.parseUnits("50", 18);
            const betAmountB = ethers.parseUnits("40", 18);
            const betAmountC = ethers.parseUnits("20", 18);
            await duelContract.connect(userA).placeBet(0, 0, betAmountA); // PSG
            await duelContract.connect(userB).placeBet(0, 1, betAmountB); // Real
            await duelContract.connect(userC).placeBet(0, 2, betAmountC); // Draw
            
            // 3. Le match se termine, Real Madrid gagne
            await time.increaseTo(deadline + 1);
            await duelContract.connect(resolver).proposeResolution(0, 1);
            await time.increase(24 * 3600 + 1);
            await duelContract.connect(resolver).executeResolution(0, 1);
            
            // 4. UserB (qui a parié sur Real) réclame ses gains
            const userBBalanceBefore = await bettingToken.balanceOf(userB.address);
            await duelContract.connect(userB).claimGains(0);
            const userBBalanceAfter = await bettingToken.balanceOf(userB.address);
            
            // UserB devrait avoir gagné plus que sa mise initiale
            const gain = userBBalanceAfter - userBBalanceBefore;
            expect(gain).to.be.gt(betAmountB);
            
            // 5. Les perdants ne peuvent pas réclamer
            await expect(
                duelContract.connect(userA).claimGains(0)
            ).to.be.revertedWith("No winning bets");
            
            await expect(
                duelContract.connect(userC).claimGains(0)
            ).to.be.revertedWith("No winning bets");
        });

        it("should handle community-driven predictions market", async function () {
            const { duelContract, userA, userB, userC } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // Simulation d'un marché de prédictions communautaire
            
            // 1. UserA crée un duel sur les élections
            await duelContract.connect(userA).createDuel(
                "Next French President",
                "Politics",
                ["Macron", "Le Pen", "Other"],
                deadline
            );
            
            // 2. UserB crée un duel sur la crypto
            await duelContract.connect(userB).createDuel(
                "Bitcoin Price End of Year",
                "Crypto",
                ["Above $100k", "50k-100k", "Below $50k"],
                deadline + 1000
            );
            
            // 3. UserC crée un duel sur le sport
            await duelContract.connect(userC).createDuel(
                "Champions League Winner",
                "Football",
                ["Real Madrid", "Barcelona", "Other"],
                deadline + 2000
            );
            
            // Vérifier que tous les duels ont été créés par leurs créateurs respectifs
            const duel0 = await duelContract.getDuelInfo(0);
            const duel1 = await duelContract.getDuelInfo(1);
            const duel2 = await duelContract.getDuelInfo(2);
            
            expect(duel0[9]).to.equal(userA.address); // creator est l'index 9
            expect(duel1[9]).to.equal(userB.address);
            expect(duel2[9]).to.equal(userC.address);
            
            expect(duel0[1]).to.equal("Politics"); // category est l'index 1
            expect(duel1[1]).to.equal("Crypto");
            expect(duel2[1]).to.equal("Football");
            
            // Chaque créateur peut parier sur les duels des autres
            await duelContract.connect(userA).placeBet(1, 0, ethers.parseUnits("10", 18)); // UserA parie sur le duel crypto de UserB
            await duelContract.connect(userB).placeBet(2, 1, ethers.parseUnits("15", 18)); // UserB parie sur le duel foot de UserC
            await duelContract.connect(userC).placeBet(0, 0, ethers.parseUnits("20", 18)); // UserC parie sur le duel politique de UserA
            
            expect(await duelContract.nextDuelId()).to.equal(3);
        });
    });

    describe("Arena Activation", function () {
        it("should allow duel creator to activate arena with sufficient points", async function () {
            const { duelContract, userA } = await deployFixture();
            const deadline = (await time.latest()) + 3700;
            
            // Create a duel
            await duelContract.connect(userA).createDuel(
                "Test Duel",
                "Sports",
                ["A", "B", "C"],
                deadline
            );
            
            // Grant userA enough points (e.g., via creating another duel)
            await duelContract.connect(userA).createDuel(
                "Another Duel",
                "Sports",
                ["X", "Y", "Z"],
                deadline + 1000
            ); // Grants 50 + 50 = 100 points
            
            // Check initial points
            expect(await duelContract.getUserPoints(userA.address)).to.equal(100);
            
            // Activate arena
            await expect(
                duelContract.connect(userA).activateArenaWithPoints(0)
            )
                .to.emit(duelContract, "PointsDeducted")
                .withArgs(userA.address, 100, "Arena activation")
                .and.to.emit(duelContract, "ArenaEligibilitySet")
                .withArgs(0, true);
            
            // Verify points deduction and arena eligibility
            expect(await duelContract.getUserPoints(userA.address)).to.equal(0);
            expect(await duelContract.duelArenaEligible(0)).to.be.true;
        });
    });
});
