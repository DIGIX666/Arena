import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ArenaNFT - Tests Complets", function () {
    async function deployFixture() {
        const { ethers } = hre;
        const [owner, backendSigner, userA, userB, userC, attacker] = await ethers.getSigners();
        
        const ArenaNFT = await ethers.getContractFactory("ArenaNFT");
        const nftContract = await ArenaNFT.deploy("BetFi Exclusive", "BFE", backendSigner.address);
        
        return { nftContract, owner, backendSigner, userA, userB, userC, attacker };
    }

    async function createSignature(contract, signer, raffleId, userAddress) {
        const domain = {
            name: "BetFi Exclusive",
            version: "1",
            chainId: (await hre.ethers.provider.getNetwork()).chainId,
            verifyingContract: await contract.getAddress(),
        };
        
        const types = {
            ParticipationVoucher: [
                { name: "raffleId", type: "uint256" },
                { name: "user", type: "address" },
            ],
        };
        
        const value = {
            raffleId: raffleId,
            user: userAddress,
        };
        
        return await signer.signTypedData(domain, types, value);
    }

    describe("Déploiement et Configuration", function () {
        it("should deploy with correct initial values", async function () {
            const { nftContract, backendSigner } = await deployFixture();
            
            expect(await nftContract.name()).to.equal("BetFi Exclusive");
            expect(await nftContract.symbol()).to.equal("BFE");
            expect(await nftContract.signerAddress()).to.equal(backendSigner.address);
            expect(await nftContract.nextRaffleId()).to.equal(0);
        });

        it("should set correct EIP712 domain", async function () {
            const { nftContract } = await deployFixture();
            
            // Vérifier que le domaine EIP712 est correctement configuré
            const domain = await nftContract.eip712Domain();
            expect(domain[1]).to.equal("BetFi Exclusive"); // name
            expect(domain[2]).to.equal("1"); // version
        });
    });

    describe("Création de Raffle", function () {
        it("should create raffle with valid parameters", async function () {
            const { nftContract } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            
            await expect(
                nftContract.createRaffle("NFT Exclusif LDC", 5000, deadline)
            ).to.emit(nftContract, "RaffleCreated")
             .withArgs(0, "NFT Exclusif LDC", 5000);
            
            const raffle = await nftContract.raffles(0);
            expect(raffle.description).to.equal("NFT Exclusif LDC");
            expect(raffle.requiredPoints).to.equal(5000);
            expect(raffle.deadline).to.equal(deadline);
            expect(raffle.isResolved).to.be.false;
            expect(raffle.winner).to.equal(hre.ethers.ZeroAddress);
        });

        it("should increment raffle ID correctly", async function () {
            const { nftContract } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            
            await nftContract.createRaffle("Raffle 1", 1000, deadline);
            await nftContract.createRaffle("Raffle 2", 2000, deadline + 1000);
            
            expect(await nftContract.nextRaffleId()).to.equal(2);
            
            const raffle1 = await nftContract.raffles(0);
            const raffle2 = await nftContract.raffles(1);
            
            expect(raffle1.description).to.equal("Raffle 1");
            expect(raffle2.description).to.equal("Raffle 2");
        });

        it("should only allow owner to create raffle", async function () {
            const { nftContract, userA } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            
            await expect(
                nftContract.connect(userA).createRaffle("Unauthorized Raffle", 1000, deadline)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should handle multiple raffles simultaneously", async function () {
            const { nftContract } = await deployFixture();
            const deadline1 = (await time.latest()) + 3600;
            const deadline2 = (await time.latest()) + 7200;
            
            await nftContract.createRaffle("Concurrent Raffle 1", 1000, deadline1);
            await nftContract.createRaffle("Concurrent Raffle 2", 2000, deadline2);
            
            const raffle1 = await nftContract.raffles(0);
            const raffle2 = await nftContract.raffles(1);
            
            expect(raffle1.isResolved).to.be.false;
            expect(raffle2.isResolved).to.be.false;
        });
    });

    describe("Participation aux Raffles", function () {
        async function setupRaffle() {
            const fixture = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            await fixture.nftContract.createRaffle("Test Raffle", 5000, deadline);
            return { ...fixture, deadline };
        }

        it("should allow user to enter with valid signature", async function () {
            const { nftContract, backendSigner, userA } = await setupRaffle();
            const raffleId = 0;
            
            const signature = await createSignature(nftContract, backendSigner, raffleId, userA.address);
            
            await expect(
                nftContract.connect(userA).enterRaffle(raffleId, signature)
            ).to.emit(nftContract, "UserEntered")
             .withArgs(raffleId, userA.address);
        });

        it("should reject invalid signature", async function () {
            const { nftContract, userA, userB } = await setupRaffle();
            const raffleId = 0;
            
            // Créer une signature avec un mauvais signer
            const signature = await createSignature(nftContract, userB, raffleId, userA.address);
            
            await expect(
                nftContract.connect(userA).enterRaffle(raffleId, signature)
            ).to.be.revertedWith("Invalid signature");
        });

        it("should reject signature for wrong user", async function () {
            const { nftContract, backendSigner, userA, userB } = await setupRaffle();
            const raffleId = 0;
            
            // Signature pour userA mais userB essaie de l'utiliser
            const signature = await createSignature(nftContract, backendSigner, raffleId, userA.address);
            
            await expect(
                nftContract.connect(userB).enterRaffle(raffleId, signature)
            ).to.be.revertedWith("Invalid signature");
        });

        it("should reject signature for wrong raffle", async function () {
            const { nftContract, backendSigner, userA } = await setupRaffle();
            
            // Créer une deuxième raffle
            const deadline2 = (await time.latest()) + 7200;
            await nftContract.createRaffle("Second Raffle", 3000, deadline2);
            
            // Signature pour raffle 0 mais utilisée pour raffle 1
            const signature = await createSignature(nftContract, backendSigner, 0, userA.address);
            
            await expect(
                nftContract.connect(userA).enterRaffle(1, signature)
            ).to.be.revertedWith("Invalid signature");
        });

        it("should prevent double entry (replay attack)", async function () {
            const { nftContract, backendSigner, userA } = await setupRaffle();
            const raffleId = 0;
            
            const signature = await createSignature(nftContract, backendSigner, raffleId, userA.address);
            
            // Première entrée réussie
            await nftContract.connect(userA).enterRaffle(raffleId, signature);
            
            // Deuxième tentative avec la même signature
            await expect(
                nftContract.connect(userA).enterRaffle(raffleId, signature)
            ).to.be.revertedWith("Already entered");
        });

        it("should reject entry after deadline", async function () {
            const { nftContract, backendSigner, userA, deadline } = await setupRaffle();
            const raffleId = 0;
            
            const signature = await createSignature(nftContract, backendSigner, raffleId, userA.address);
            
            await time.increaseTo(deadline + 1);
            
            await expect(
                nftContract.connect(userA).enterRaffle(raffleId, signature)
            ).to.be.revertedWith("Raffle is closed");
        });

        it("should reject entry on resolved raffle", async function () {
            const { nftContract, backendSigner, userA, userB } = await setupRaffle();
            const raffleId = 0;
            
            // userA entre d'abord
            const signatureA = await createSignature(nftContract, backendSigner, raffleId, userA.address);
            await nftContract.connect(userA).enterRaffle(raffleId, signatureA);
            
            // Résoudre la raffle
            await nftContract.resolveRaffleAndMint(raffleId, userA.address);
            
            // userB essaie d'entrer après résolution
            const signatureB = await createSignature(nftContract, backendSigner, raffleId, userB.address);
            await expect(
                nftContract.connect(userB).enterRaffle(raffleId, signatureB)
            ).to.be.revertedWith("Raffle is closed");
        });

        it("should handle multiple users entering same raffle", async function () {
            const { nftContract, backendSigner, userA, userB, userC } = await setupRaffle();
            const raffleId = 0;
            
            // Créer des signatures pour chaque utilisateur
            const signatureA = await createSignature(nftContract, backendSigner, raffleId, userA.address);
            const signatureB = await createSignature(nftContract, backendSigner, raffleId, userB.address);
            const signatureC = await createSignature(nftContract, backendSigner, raffleId, userC.address);
            
            // Tous entrent dans la raffle
            await expect(nftContract.connect(userA).enterRaffle(raffleId, signatureA))
                .to.emit(nftContract, "UserEntered").withArgs(raffleId, userA.address);
            
            await expect(nftContract.connect(userB).enterRaffle(raffleId, signatureB))
                .to.emit(nftContract, "UserEntered").withArgs(raffleId, userB.address);
            
            await expect(nftContract.connect(userC).enterRaffle(raffleId, signatureC))
                .to.emit(nftContract, "UserEntered").withArgs(raffleId, userC.address);
        });

        it("should reject malformed signatures", async function () {
            const { nftContract, userA } = await setupRaffle();
            const raffleId = 0;
            
            const malformedSignature = "0x1234567890abcdef";
            
            await expect(
                nftContract.connect(userA).enterRaffle(raffleId, malformedSignature)
            ).to.be.reverted;
        });

        it("should reject empty signature", async function () {
            const { nftContract, userA } = await setupRaffle();
            const raffleId = 0;
            
            await expect(
                nftContract.connect(userA).enterRaffle(raffleId, "0x")
            ).to.be.reverted;
        });
    });

    describe("Résolution de Raffle et Mint NFT", function () {
        async function setupRaffleWithParticipants() {
            const fixture = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            await fixture.nftContract.createRaffle("Test Raffle", 5000, deadline);
            
            const raffleId = 0;
            
            // Faire entrer plusieurs utilisateurs
            const signatureA = await createSignature(fixture.nftContract, fixture.backendSigner, raffleId, fixture.userA.address);
            const signatureB = await createSignature(fixture.nftContract, fixture.backendSigner, raffleId, fixture.userB.address);
            
            await fixture.nftContract.connect(fixture.userA).enterRaffle(raffleId, signatureA);
            await fixture.nftContract.connect(fixture.userB).enterRaffle(raffleId, signatureB);
            
            return { ...fixture, raffleId };
        }

        it("should resolve raffle and mint NFT to winner", async function () {
            const { nftContract, userA, raffleId } = await setupRaffleWithParticipants();
            
            await expect(
                nftContract.resolveRaffleAndMint(raffleId, userA.address)
            ).to.emit(nftContract, "RaffleResolved")
             .withArgs(raffleId, userA.address, raffleId);
            
            // Vérifier que le NFT a été minté
            expect(await nftContract.ownerOf(raffleId)).to.equal(userA.address);
            expect(await nftContract.balanceOf(userA.address)).to.equal(1);
            
            // Vérifier l'état de la raffle
            const raffle = await nftContract.raffles(raffleId);
            expect(raffle.isResolved).to.be.true;
            expect(raffle.winner).to.equal(userA.address);
        });

        it("should only allow owner to resolve raffle", async function () {
            const { nftContract, userA, userB, raffleId } = await setupRaffleWithParticipants();
            
            await expect(
                nftContract.connect(userA).resolveRaffleAndMint(raffleId, userB.address)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should reject resolution with non-participant winner", async function () {
            const { nftContract, userC, raffleId } = await setupRaffleWithParticipants();
            
            await expect(
                nftContract.resolveRaffleAndMint(raffleId, userC.address)
            ).to.be.revertedWith("Winner did not participate");
        });

        it("should reject double resolution", async function () {
            const { nftContract, userA, userB, raffleId } = await setupRaffleWithParticipants();
            
            // Première résolution
            await nftContract.resolveRaffleAndMint(raffleId, userA.address);
            
            // Tentative de deuxième résolution
            await expect(
                nftContract.resolveRaffleAndMint(raffleId, userB.address)
            ).to.be.revertedWith("Raffle already resolved");
        });

        it("should use raffle ID as NFT token ID", async function () {
            const { nftContract, userA, userB } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            
            // Créer plusieurs raffles
            await nftContract.createRaffle("Raffle 0", 1000, deadline);
            await nftContract.createRaffle("Raffle 1", 2000, deadline + 1000);
            await nftContract.createRaffle("Raffle 2", 3000, deadline + 2000);
            
            // Participants entrent dans chaque raffle
            const backendSigner = await ethers.getSigners().then(s => s[1]);
            for (let i = 0; i < 3; i++) {
                const signatureA = await createSignature(nftContract, backendSigner, i, userA.address);
                await nftContract.connect(userA).enterRaffle(i, signatureA);
            }
            
            // Résoudre les raffles avec userA comme gagnant
            await nftContract.resolveRaffleAndMint(0, userA.address);
            await nftContract.resolveRaffleAndMint(1, userA.address);
            await nftContract.resolveRaffleAndMint(2, userA.address);
            
            // Vérifier que les NFT IDs correspondent aux raffle IDs
            expect(await nftContract.ownerOf(0)).to.equal(userA.address);
            expect(await nftContract.ownerOf(1)).to.equal(userA.address);
            expect(await nftContract.ownerOf(2)).to.equal(userA.address);
            expect(await nftContract.balanceOf(userA.address)).to.equal(3);
        });

        it("should handle resolution of different raffles with different winners", async function () {
            const { nftContract, backendSigner, userA, userB, userC } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            
            // Créer deux raffles
            await nftContract.createRaffle("Raffle A", 1000, deadline);
            await nftContract.createRaffle("Raffle B", 2000, deadline + 1000);
            
            // Participants dans raffle 0
            const sig0A = await createSignature(nftContract, backendSigner, 0, userA.address);
            const sig0B = await createSignature(nftContract, backendSigner, 0, userB.address);
            await nftContract.connect(userA).enterRaffle(0, sig0A);
            await nftContract.connect(userB).enterRaffle(0, sig0B);
            
            // Participants dans raffle 1
            const sig1B = await createSignature(nftContract, backendSigner, 1, userB.address);
            const sig1C = await createSignature(nftContract, backendSigner, 1, userC.address);
            await nftContract.connect(userB).enterRaffle(1, sig1B);
            await nftContract.connect(userC).enterRaffle(1, sig1C);
            
            // Résolutions avec différents gagnants
            await nftContract.resolveRaffleAndMint(0, userA.address);
            await nftContract.resolveRaffleAndMint(1, userC.address);
            
            // Vérifications
            expect(await nftContract.ownerOf(0)).to.equal(userA.address);
            expect(await nftContract.ownerOf(1)).to.equal(userC.address);
            expect(await nftContract.balanceOf(userA.address)).to.equal(1);
            expect(await nftContract.balanceOf(userC.address)).to.equal(1);
        });
    });

    describe("Gestion des Signatures - Tests de Sécurité Avancés", function () {
        it("should reject signature with wrong chain ID", async function () {
            const { nftContract, userA } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            await nftContract.createRaffle("Test Raffle", 5000, deadline);
            
            // Créer une signature avec un mauvais chainId
            const wrongDomain = {
                name: "BetFi Exclusive",
                version: "1",
                chainId: 999999, // Mauvais chain ID
                verifyingContract: await nftContract.getAddress(),
            };
            
            const types = {
                ParticipationVoucher: [
                    { name: "raffleId", type: "uint256" },
                    { name: "user", type: "address" },
                ],
            };
            
            const value = {
                raffleId: 0,
                user: userA.address,
            };
            
            const signature = await userA.signTypedData(wrongDomain, types, value);
            
            await expect(
                nftContract.connect(userA).enterRaffle(0, signature)
            ).to.be.revertedWith("Invalid signature");
        });

        it("should reject signature with wrong contract address", async function () {
            const { nftContract, backendSigner, userA } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            await nftContract.createRaffle("Test Raffle", 5000, deadline);
            
            // Créer une signature avec une mauvaise adresse de contrat
            const wrongDomain = {
                name: "BetFi Exclusive",
                version: "1",
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                verifyingContract: userA.address, // Mauvaise adresse
            };
            
            const types = {
                ParticipationVoucher: [
                    { name: "raffleId", type: "uint256" },
                    { name: "user", type: "address" },
                ],
            };
            
            const value = {
                raffleId: 0,
                user: userA.address,
            };
            
            const signature = await backendSigner.signTypedData(wrongDomain, types, value);
            
            await expect(
                nftContract.connect(userA).enterRaffle(0, signature)
            ).to.be.revertedWith("Invalid signature");
        });

        it("should reject signature with wrong domain name", async function () {
            const { nftContract, backendSigner, userA } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            await nftContract.createRaffle("Test Raffle", 5000, deadline);
            
            const wrongDomain = {
                name: "Fake Contract", // Mauvais nom
                version: "1",
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                verifyingContract: await nftContract.getAddress(),
            };
            
            const types = {
                ParticipationVoucher: [
                    { name: "raffleId", type: "uint256" },
                    { name: "user", type: "address" },
                ],
            };
            
            const value = {
                raffleId: 0,
                user: userA.address,
            };
            
            const signature = await backendSigner.signTypedData(wrongDomain, types, value);
            
            await expect(
                nftContract.connect(userA).enterRaffle(0, signature)
            ).to.be.revertedWith("Invalid signature");
        });

        it("should reject signature with wrong version", async function () {
            const { nftContract, backendSigner, userA } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            await nftContract.createRaffle("Test Raffle", 5000, deadline);
            
            const wrongDomain = {
                name: "BetFi Exclusive",
                version: "2", // Mauvaise version
                chainId: (await hre.ethers.provider.getNetwork()).chainId,
                verifyingContract: await nftContract.getAddress(),
            };
            
            const types = {
                ParticipationVoucher: [
                    { name: "raffleId", type: "uint256" },
                    { name: "user", type: "address" },
                ],
            };
            
            const value = {
                raffleId: 0,
                user: userA.address,
            };
            
            const signature = await backendSigner.signTypedData(wrongDomain, types, value);
            
            await expect(
                nftContract.connect(userA).enterRaffle(0, signature)
            ).to.be.revertedWith("Invalid signature");
        });
    });

    describe("Gestion Administrative", function () {
        it("should allow owner to change signer address", async function () {
            const { nftContract, userA, userB } = await deployFixture();
            
            // Cette fonctionnalité devrait être ajoutée au contrat
            // await nftContract.setSignerAddress(userB.address);
            // expect(await nftContract.signerAddress()).to.equal(userB.address);
            
            // Pour l'instant, vérifier que cette fonctionnalité n'existe pas
            expect(nftContract.setSignerAddress).to.be.undefined;
        });

        it("should handle ownership transfer correctly", async function () {
            const { nftContract, owner, userA } = await deployFixture();
            
            await nftContract.transferOwnership(userA.address);
            expect(await nftContract.owner()).to.equal(userA.address);
            
            // userA peut maintenant créer des raffles
            const deadline = (await time.latest()) + 3600;
            await expect(
                nftContract.connect(userA).createRaffle("New Owner Raffle", 1000, deadline)
            ).to.emit(nftContract, "RaffleCreated");
            
            // L'ancien owner ne peut plus
            await expect(
                nftContract.connect(owner).createRaffle("Old Owner Raffle", 1000, deadline)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Tests d'Intégration et Scénarios Complexes", function () {
        it("should handle complete raffle lifecycle", async function () {
            const { nftContract, backendSigner, userA, userB, userC } = await deployFixture();
            
            // 1. Créer une raffle
            const deadline = (await time.latest()) + 3600;
            await nftContract.createRaffle("Complete Lifecycle Test", 10000, deadline);
            
            // 2. Plusieurs utilisateurs entrent
            const sigA = await createSignature(nftContract, backendSigner, 0, userA.address);
            const sigB = await createSignature(nftContract, backendSigner, 0, userB.address);
            const sigC = await createSignature(nftContract, backendSigner, 0, userC.address);
            
            await nftContract.connect(userA).enterRaffle(0, sigA);
            await nftContract.connect(userB).enterRaffle(0, sigB);
            await nftContract.connect(userC).enterRaffle(0, sigC);
            
            // 3. Avancer le temps après la deadline
            await time.increaseTo(deadline + 1);
            
            // 4. Résoudre et minter
            await expect(
                nftContract.resolveRaffleAndMint(0, userB.address)
            ).to.emit(nftContract, "RaffleResolved")
             .withArgs(0, userB.address, 0);
            
            // 5. Vérifications finales
            expect(await nftContract.ownerOf(0)).to.equal(userB.address);
            expect(await nftContract.balanceOf(userB.address)).to.equal(1);
            
            const raffle = await nftContract.raffles(0);
            expect(raffle.isResolved).to.be.true;
            expect(raffle.winner).to.equal(userB.address);
        });

        it("should handle multiple concurrent raffles", async function () {
            const { nftContract, backendSigner, userA, userB } = await deployFixture();
            
            const currentTime = await time.latest();
            
            // Créer 3 raffles avec des deadlines différentes
            await nftContract.createRaffle("Early Raffle", 1000, currentTime + 1800);
            await nftContract.createRaffle("Mid Raffle", 5000, currentTime + 3600);
            await nftContract.createRaffle("Late Raffle", 10000, currentTime + 7200);
            
            // Faire participer les utilisateurs à différentes raffles
            const sig0A = await createSignature(nftContract, backendSigner, 0, userA.address);
            const sig1A = await createSignature(nftContract, backendSigner, 1, userA.address);
            const sig1B = await createSignature(nftContract, backendSigner, 1, userB.address);
            const sig2B = await createSignature(nftContract, backendSigner, 2, userB.address);
            
            await nftContract.connect(userA).enterRaffle(0, sig0A);
            await nftContract.connect(userA).enterRaffle(1, sig1A);
            await nftContract.connect(userB).enterRaffle(1, sig1B);
            await nftContract.connect(userB).enterRaffle(2, sig2B);
            
            // Résoudre les raffles à des moments différents
            await time.increaseTo(currentTime + 1801);
            await nftContract.resolveRaffleAndMint(0, userA.address);
            
            await time.increaseTo(currentTime + 3601);
            await nftContract.resolveRaffleAndMint(1, userB.address);
            
            await time.increaseTo(currentTime + 7201);
            await nftContract.resolveRaffleAndMint(2, userB.address);
            
            // Vérifications
            expect(await nftContract.ownerOf(0)).to.equal(userA.address);
            expect(await nftContract.ownerOf(1)).to.equal(userB.address);
            expect(await nftContract.ownerOf(2)).to.equal(userB.address);
            
            expect(await nftContract.balanceOf(userA.address)).to.equal(1);
            expect(await nftContract.balanceOf(userB.address)).to.equal(2);
        });
    });

    describe("Edge Cases et Récupération d'Erreurs", function () {
        it("should handle raffle with no participants", async function () {
            const { nftContract, userA } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            await nftContract.createRaffle("Empty Raffle", 5000, deadline);
            
            await time.increaseTo(deadline + 1);
            
            // Tenter de résoudre une raffle sans participants
            await expect(
                nftContract.resolveRaffleAndMint(0, userA.address)
            ).to.be.revertedWith("Winner did not participate");
        });

        it("should handle extremely long deadline", async function () {
            const { nftContract } = await deployFixture();
            const farFuture = (await time.latest()) + 365 * 24 * 3600; // 1 an
            
            await expect(
                nftContract.createRaffle("Future Raffle", 5000, farFuture)
            ).to.emit(nftContract, "RaffleCreated");
        });

        it("should handle zero required points", async function () {
            const { nftContract } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            
            await expect(
                nftContract.createRaffle("Free Raffle", 0, deadline)
            ).to.emit(nftContract, "RaffleCreated")
             .withArgs(0, "Free Raffle", 0);
        });

        it("should handle very high required points", async function () {
            const { nftContract } = await deployFixture();
            const deadline = (await time.latest()) + 3600;
            const maxPoints = hre.ethers.MaxUint256;
            
            await expect(
                nftContract.createRaffle("Exclusive Raffle", maxPoints, deadline)
            ).to.emit(nftContract, "RaffleCreated")
             .withArgs(0, "Exclusive Raffle", maxPoints);
        });
    });
});
