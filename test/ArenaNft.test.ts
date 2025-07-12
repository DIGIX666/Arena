import { expect } from "chai";
import hre from "hardhat";

import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ArenaNFT", function () {
    async function deployFixture() {
            const {ethers} = hre;
        const [owner, backendSigner, userA, userB] = await ethers.getSigners();
        
        const ArenaNFT = await ethers.getContractFactory("ArenaNFT");
        const nftContract = await ArenaNFT.deploy("BetFi Exclusive", "BFE", backendSigner.address);

        return { nftContract, owner, backendSigner, userA, userB };
    }

    it("should allow a user with a valid signature to enter and win the NFT", async function () {
        const { nftContract, backendSigner, userA } = await deployFixture();
        const deadline = (await time.latest()) + 3600;

        // 1. Création de la raffle
        await nftContract.createRaffle("NFT Exclusif LDC", 5000, deadline);
        const raffleId = 0;

        // 2. Le backend génère une signature pour userA (qui est éligible)
        const domain = {
            name: "BetFi Exclusive",
            version: "1",
            chainId: (await ethers.provider.getNetwork()).chainId,
            verifyingContract: await nftContract.getAddress(),
        };

        const types = {
            ParticipationVoucher: [
                { name: "raffleId", type: "uint256" },
                { name: "user", type: "address" },
            ],
        };

        const value = {
            raffleId: raffleId,
            user: userA.address,
        };

        const signature = await backendSigner.signTypedData(domain, types, value);
        
        // 3. UserA entre dans la raffle avec sa signature
        await expect(nftContract.connect(userA).enterRaffle(raffleId, signature))
            .to.emit(nftContract, "UserEntered").withArgs(raffleId, userA.address);

        // 4. L'admin résout et minte le NFT au gagnant
        await time.increaseTo(deadline + 1);
        await nftContract.resolveRaffleAndMint(raffleId, userA.address);

        // 5. Vérification : userA est bien le propriétaire du NFT #0
        expect(await nftContract.ownerOf(raffleId)).to.equal(userA.address);
    });
});
