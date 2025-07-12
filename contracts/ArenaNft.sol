// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract ArenaNFT is ERC721, Ownable, EIP712 {
    
    struct RaffleData {
        string description;
        uint256 requiredPoints;
        uint256 deadline;
        bool isResolved;
        address winner;
        mapping(address => bool) hasEntered;
    }

    mapping(uint256 => RaffleData) public raffles;
    uint256 public nextRaffleId;
    address public signerAddress; // L'adresse du backend autorisé à créer des signatures

    event RaffleCreated(uint256 indexed raffleId, string description, uint256 requiredPoints);
    event UserEntered(uint256 indexed raffleId, address indexed user);
    event RaffleResolved(uint256 indexed raffleId, address indexed winner, uint256 nftId);

    bytes32 private constant PARTICIPATION_VOUCHER_TYPEHASH = keccak256(
        "ParticipationVoucher(uint256 raffleId,address user)"
    );

constructor(string memory _name, string memory _symbol, address _initialSigner)
    ERC721(_name, _symbol)
    Ownable() // On retire (msg.sender)
    EIP712(_name, "1")
{
    signerAddress = _initialSigner;
}

    function createRaffle(string memory _description, uint256 _requiredPoints, uint256 _deadline) external onlyOwner {
        uint256 raffleId = nextRaffleId;
        raffles[raffleId].description = _description;
        raffles[raffleId].requiredPoints = _requiredPoints;
        raffles[raffleId].deadline = _deadline;
        emit RaffleCreated(raffleId, _description, _requiredPoints);
        nextRaffleId++;
    }

    function enterRaffle(uint256 _raffleId, bytes memory _signature) external {
        RaffleData storage raffle = raffles[_raffleId];
        require(!raffle.isResolved && block.timestamp < raffle.deadline, "Raffle is closed");
        require(!raffle.hasEntered[msg.sender], "Already entered");

        address recoveredSigner = _verifySignature(_raffleId, msg.sender, _signature);
        require(recoveredSigner == signerAddress, "Invalid signature");

        raffle.hasEntered[msg.sender] = true;
        emit UserEntered(_raffleId, msg.sender);
    }

    function resolveRaffleAndMint(uint256 _raffleId, address _winner) external onlyOwner {
        require(!raffles[_raffleId].isResolved, "Raffle already resolved");
        require(raffles[_raffleId].hasEntered[_winner], "Winner did not participate");

        raffles[_raffleId].isResolved = true;
        raffles[_raffleId].winner = _winner;

        uint256 nftId = _raffleId; // On utilise l'ID de la raffle comme ID du NFT pour unicité
        _safeMint(_winner, nftId);

        emit RaffleResolved(_raffleId, _winner, nftId);
    }
    
    function _verifySignature(uint256 _raffleId, address _user, bytes memory _signature) internal view returns (address) {
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(
            PARTICIPATION_VOUCHER_TYPEHASH,
            _raffleId,
            _user
        )));
        return ECDSA.recover(digest, _signature);
    }
}
