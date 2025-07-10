// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BetFiArenaV2 is Ownable, ReentrancyGuard {
    
    IERC20 public bettingToken;
    IERC20 public fanTokenForBonus;
    
    uint256 public platformFeePercent = 4;
    uint256 public nextArenaId;

    struct ArenaData {
        string title;
        string[] outcomeNames;
        uint256 potTotal;
        uint256 deadline;
        bool isResolved;
        uint256 winningOutcomeId;
    }

    mapping(uint256 => ArenaData) public arenas;
    mapping(uint256 => mapping(uint256 => uint256)) public outcomePots;
    mapping(uint256 => mapping(uint256 => mapping(address => uint256))) public betsPerOutcome;

    event ArenaCreated(uint256 indexed arenaId, string title, string[] outcomeNames);
    event BetPlaced(uint256 indexed arenaId, address indexed user, uint256 outcomeId, uint256 amount);
    event ArenaResolved(uint256 indexed arenaId, uint256 winningOutcomeId);
    event GainsClaimed(uint256 indexed arenaId, address indexed user, uint256 amount);

constructor(address _bettingTokenAddress, address _fanTokenBonusAddress) Ownable() { // On retire (msg.sender)
    bettingToken = IERC20(_bettingTokenAddress);
    fanTokenForBonus = IERC20(_fanTokenBonusAddress);
}

    function createArena(string memory _title, string[] memory _outcomeNames, uint256 _deadline) external onlyOwner {
        require(_deadline > block.timestamp, "Deadline must be in the future");
        uint256 arenaId = nextArenaId;
        arenas[arenaId].title = _title;
        arenas[arenaId].outcomeNames = _outcomeNames;
        arenas[arenaId].deadline = _deadline;
        emit ArenaCreated(arenaId, _title, _outcomeNames);
        nextArenaId++;
    }

    function resolveArena(uint256 _arenaId, uint256 _winningOutcomeId) external onlyOwner {
        require(!arenas[_arenaId].isResolved, "Arena is already resolved");
        require(_winningOutcomeId < arenas[_arenaId].outcomeNames.length, "Invalid winning outcome");
        arenas[_arenaId].isResolved = true;
        arenas[_arenaId].winningOutcomeId = _winningOutcomeId;
        emit ArenaResolved(_arenaId, _winningOutcomeId);
    }

    function placeBet(uint256 _arenaId, uint256 _outcomeId, uint256 _amount) external nonReentrant {
        ArenaData storage arena = arenas[_arenaId];
        require(!arena.isResolved, "Arena is resolved");
        require(block.timestamp < arena.deadline, "Betting deadline has passed");
        require(_outcomeId < arena.outcomeNames.length, "Invalid outcome ID");
        require(_amount > 0, "Amount must be positive");
        
        require(bettingToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");

        arena.potTotal += _amount;
        outcomePots[_arenaId][_outcomeId] += _amount;
        betsPerOutcome[_arenaId][_outcomeId][msg.sender] += _amount;

        emit BetPlaced(_arenaId, msg.sender, _outcomeId, _amount);
    }

    function claimGains(uint256 _arenaId) external nonReentrant {
        ArenaData storage arena = arenas[_arenaId];
        require(arena.isResolved, "Arena is not resolved yet");

        uint256 winningId = arena.winningOutcomeId;
        uint256 betAmount = betsPerOutcome[_arenaId][winningId][msg.sender];
        require(betAmount > 0, "You have no winning bets or have already claimed");

        uint256 potWinner = outcomePots[_arenaId][winningId];
        require(potWinner > 0, "Winning pot cannot be zero");

        uint256 potNet = (arena.potTotal * (100 - platformFeePercent)) / 100;
        uint256 rBase = (betAmount * potNet) / potWinner;

        uint256 balanceFanToken = fanTokenForBonus.balanceOf(msg.sender);
        uint256 bonusPercent = (balanceFanToken * 10) / (1000 * 10);
        
        // Calculer le bonus mais limiter au pot disponible
        uint256 maxBonus = potNet - rBase;
        uint256 bonus = (rBase * bonusPercent) / 100;
        if (bonus > maxBonus) {
            bonus = maxBonus;
        }
        
        uint256 total = rBase + bonus;
        
        betsPerOutcome[_arenaId][winningId][msg.sender] = 0;

        require(bettingToken.transfer(msg.sender, total), "Payout failed");
        emit GainsClaimed(_arenaId, msg.sender, total);
    }
}
