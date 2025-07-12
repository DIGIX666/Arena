// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IVolatilityOracle.sol";

/**
 * @title SeasonalNFTArena
 * @dev Long-term prediction arena with CHZ/USDC dual-asset pot and volatility protection
 */
contract SeasonalNFTArena is Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;

    // Constants
    uint256 public constant MAX_DURATION = 90 days; // 3 months maximum
    uint256 public constant VOLATILITY_THRESHOLD = 3000; // 30% volatility threshold
    uint256 public constant EMERGENCY_THRESHOLD = 4000; // 40% crash threshold
    uint256 public constant PLATFORM_FEE = 2000; // 20%
    uint256 public constant PARTNER_FEE = 1000; // 10%
    uint256 public constant IMMEDIATE_POT = 4000; // 40%
    uint256 public constant REINVESTMENT_FEE = 3000; // 30%
    uint256 public constant MIN_FAN_TOKENS = 2000 * 10**18; // 2000 fan tokens minimum
    uint256 public constant INSURANCE_FEE = 20 * 10**18; // 20 CHZ insurance

    // Tokens
    IERC20 public immutable chzToken;
    IERC20 public immutable usdcToken;
    IERC20 public immutable fanToken;
    IVolatilityOracle public volatilityOracle;

    // Arena counter
    uint256 public nextArenaId = 1;

    // Seasonal Types
    enum SeasonalType {
        ChampionsLeague,    // 3 months
        TransferWindow,     // 3 months
        BallonDor,         // 6 months max
        WorldCupQualifiers // 3 months cycles
    }

    // Arena structure
    struct SeasonalArena {
        string title;
        string[] outcomeNames;
        SeasonalType seasonalType;
        uint256 startTime;
        uint256 endTime;
        uint256 deadline;
        bool isResolved;
        uint256 winningOutcomeId;
        
        // Pot management
        uint256 chzPot;
        uint256 usdcPot;
        uint256 totalAccumulated;
        
        // Entry requirements
        uint256 entryFeeCHZ;
        bool isActive;
        
        // Protection
        bool protectionTriggered;
        uint256 lastVolatilityCheck;
    }

    // Betting structure
    struct BetPosition {
        uint256 chzAmount;
        uint256 usdcAmount;
        bool hasInsurance;
        uint256 timestamp;
    }

    // Storage
    mapping(uint256 => SeasonalArena) public seasonalArenas;
    mapping(uint256 => mapping(uint256 => uint256)) public outcomeCHZPots;
    mapping(uint256 => mapping(uint256 => uint256)) public outcomeUSDCPots;
    mapping(uint256 => mapping(uint256 => mapping(address => BetPosition))) public betPositions;
    mapping(uint256 => uint256) public arenaAccumulation; // Reinvestment tracking

    // Events
    event SeasonalArenaCreated(
        uint256 indexed arenaId,
        string title,
        SeasonalType seasonalType,
        uint256 entryFee,
        uint256 deadline
    );
    
    event SeasonalBetPlaced(
        uint256 indexed arenaId,
        address indexed user,
        uint256 outcomeId,
        uint256 chzAmount,
        bool hasInsurance
    );
    
    event VolatilityProtectionTriggered(
        uint256 indexed arenaId,
        uint256 chzConverted,
        uint256 usdcReceived,
        uint256 volatilityPercent
    );
    
    event EmergencyConversionTriggered(
        uint256 indexed arenaId,
        uint256 chzConverted,
        uint256 usdcReceived
    );
    
    event PotAccumulated(
        uint256 indexed arenaId,
        uint256 chzAmount,
        uint256 newPotTotal
    );
    
    event SeasonalResolved(
        uint256 indexed arenaId,
        uint256 winningOutcomeId,
        uint256 totalPotCHZ,
        uint256 totalPotUSDC
    );
    
    event MegaPrizeWon(
        uint256 indexed arenaId,
        address indexed winner,
        uint256 chzAmount,
        uint256 usdcAmount
    );

    constructor(
        address _chzToken,
        address _usdcToken,
        address _fanToken,
        address _volatilityOracle
    ) Ownable() {
        chzToken = IERC20(_chzToken);
        usdcToken = IERC20(_usdcToken);
        fanToken = IERC20(_fanToken);
        volatilityOracle = IVolatilityOracle(_volatilityOracle);
    }

    /**
     * @dev Create a new seasonal arena
     */
    function createSeasonalArena(
        string memory _title,
        string[] memory _outcomeNames,
        SeasonalType _seasonalType,
        uint256 _entryFeeCHZ,
        uint256 _duration
    ) external onlyOwner {
        require(_duration <= MAX_DURATION, "Duration exceeds maximum");
        require(_entryFeeCHZ >= 150 * 10**18 && _entryFeeCHZ <= 500 * 10**18, "Invalid entry fee range");
        require(_outcomeNames.length >= 2, "Need at least 2 outcomes");

        uint256 arenaId = nextArenaId++;
        uint256 deadline = block.timestamp + _duration;

        seasonalArenas[arenaId] = SeasonalArena({
            title: _title,
            outcomeNames: _outcomeNames,
            seasonalType: _seasonalType,
            startTime: block.timestamp,
            endTime: deadline,
            deadline: deadline,
            isResolved: false,
            winningOutcomeId: 0,
            chzPot: 0,
            usdcPot: 0,
            totalAccumulated: 0,
            entryFeeCHZ: _entryFeeCHZ,
            isActive: true,
            protectionTriggered: false,
            lastVolatilityCheck: block.timestamp
        });

        emit SeasonalArenaCreated(arenaId, _title, _seasonalType, _entryFeeCHZ, deadline);
    }

    /**
     * @dev Enter a seasonal arena with optional insurance
     */
    function enterSeasonal(
        uint256 _arenaId,
        uint256 _outcomeId,
        bool _withInsurance
    ) external nonReentrant whenNotPaused {
        SeasonalArena storage arena = seasonalArenas[_arenaId];
        require(arena.isActive, "Arena not active");
        require(!arena.isResolved, "Arena already resolved");
        require(block.timestamp < arena.deadline, "Betting deadline passed");
        require(_outcomeId < arena.outcomeNames.length, "Invalid outcome");
        require(fanToken.balanceOf(msg.sender) >= MIN_FAN_TOKENS, "Insufficient fan tokens");

        uint256 totalFee = _withInsurance ? arena.entryFeeCHZ.add(INSURANCE_FEE) : arena.entryFeeCHZ;
        require(chzToken.transferFrom(msg.sender, address(this), totalFee), "CHZ transfer failed");

        _processBetEntry(_arenaId, _outcomeId, _withInsurance, arena.entryFeeCHZ);
    }

    /**
     * @dev Internal function to process bet entry and fee distribution
     */
    function _processBetEntry(
        uint256 _arenaId,
        uint256 _outcomeId,
        bool _withInsurance,
        uint256 _entryFee
    ) internal {
        // Calculate fee distributions
        uint256 immediatePot = _entryFee.mul(IMMEDIATE_POT).div(10000);
        uint256 reinvestment = _entryFee.mul(REINVESTMENT_FEE).div(10000);
        
        // Split immediate pot: 60% CHZ, 40% USDC
        uint256 chzForPot = immediatePot.mul(6000).div(10000);
        uint256 chzForUSDC = immediatePot.sub(chzForPot);

        SeasonalArena storage arena = seasonalArenas[_arenaId];
        arena.chzPot = arena.chzPot.add(chzForPot);
        outcomeCHZPots[_arenaId][_outcomeId] = outcomeCHZPots[_arenaId][_outcomeId].add(chzForPot);

        uint256 usdcAmount = 0;
        if (chzForUSDC > 0) {
            usdcAmount = _convertCHZToUSDC(chzForUSDC);
            arena.usdcPot = arena.usdcPot.add(usdcAmount);
            outcomeUSDCPots[_arenaId][_outcomeId] = outcomeUSDCPots[_arenaId][_outcomeId].add(usdcAmount);
        }

        // Store bet position
        betPositions[_arenaId][_outcomeId][msg.sender] = BetPosition({
            chzAmount: chzForPot,
            usdcAmount: usdcAmount,
            hasInsurance: _withInsurance,
            timestamp: block.timestamp
        });

        arenaAccumulation[_arenaId] = arenaAccumulation[_arenaId].add(reinvestment);
        emit SeasonalBetPlaced(_arenaId, msg.sender, _outcomeId, _entryFee, _withInsurance);
    }

    /**
     * @dev Trigger volatility protection automatically
     */
    function triggerVolatilityProtection(uint256 _arenaId) external {
        SeasonalArena storage arena = seasonalArenas[_arenaId];
        require(arena.isActive && !arena.isResolved, "Arena not active");
        require(!arena.protectionTriggered, "Protection already triggered");
        require(
            block.timestamp >= arena.lastVolatilityCheck + 1 hours,
            "Too soon to check volatility"
        );

        require(
            volatilityOracle.shouldTriggerProtection(VOLATILITY_THRESHOLD),
            "Volatility threshold not reached"
        );

        arena.lastVolatilityCheck = block.timestamp;
        arena.protectionTriggered = true;

        // Convert 50% of CHZ pot to USDC
        uint256 chzToConvert = arena.chzPot.mul(5000).div(10000);
        uint256 usdcReceived = _convertCHZToUSDC(chzToConvert);

        arena.chzPot = arena.chzPot.sub(chzToConvert);
        arena.usdcPot = arena.usdcPot.add(usdcReceived);

        emit VolatilityProtectionTriggered(
            _arenaId,
            chzToConvert,
            usdcReceived,
            volatilityOracle.getVolatilityPercent()
        );
    }

    /**
     * @dev Emergency conversion for severe CHZ crash
     */
    function emergencyConvert(uint256 _arenaId) external onlyOwner {
        SeasonalArena storage arena = seasonalArenas[_arenaId];
        require(arena.isActive && !arena.isResolved, "Arena not active");
        require(
            volatilityOracle.shouldTriggerEmergency(EMERGENCY_THRESHOLD),
            "Emergency threshold not reached"
        );

        // Convert 70% of CHZ pot to USDC
        uint256 chzToConvert = arena.chzPot.mul(7000).div(10000);
        uint256 usdcReceived = _convertCHZToUSDC(chzToConvert);

        arena.chzPot = arena.chzPot.sub(chzToConvert);
        arena.usdcPot = arena.usdcPot.add(usdcReceived);

        emit EmergencyConversionTriggered(_arenaId, chzToConvert, usdcReceived);
    }

    /**
     * @dev Accumulate platform fees into arena pot
     */
    function accumulateIntoPot(uint256 _arenaId) external onlyOwner {
        SeasonalArena storage arena = seasonalArenas[_arenaId];
        require(arena.isActive, "Arena not active");

        uint256 accumulatedAmount = arenaAccumulation[_arenaId];
        require(accumulatedAmount > 0, "No accumulated funds");

        // Split accumulation: 60% CHZ, 40% converted to USDC
        uint256 chzForPot = accumulatedAmount.mul(6000).div(10000);
        uint256 chzForUSDC = accumulatedAmount.sub(chzForPot);

        arena.chzPot = arena.chzPot.add(chzForPot);
        arena.totalAccumulated = arena.totalAccumulated.add(accumulatedAmount);

        if (chzForUSDC > 0) {
            uint256 usdcAmount = _convertCHZToUSDC(chzForUSDC);
            arena.usdcPot = arena.usdcPot.add(usdcAmount);
        }

        arenaAccumulation[_arenaId] = 0;

        emit PotAccumulated(_arenaId, accumulatedAmount, arena.chzPot + arena.usdcPot);
    }

    /**
     * @dev Resolve seasonal arena
     */
    function resolveSeasonal(uint256 _arenaId, uint256 _winningOutcomeId) external onlyOwner {
        SeasonalArena storage arena = seasonalArenas[_arenaId];
        require(arena.isActive, "Arena not active");
        require(!arena.isResolved, "Already resolved");
        require(_winningOutcomeId < arena.outcomeNames.length, "Invalid outcome");

        arena.isResolved = true;
        arena.winningOutcomeId = _winningOutcomeId;
        arena.isActive = false;

        emit SeasonalResolved(_arenaId, _winningOutcomeId, arena.chzPot, arena.usdcPot);
    }

    /**
     * @dev Claim seasonal rewards with mega-prize distribution
     */
    function claimSeasonalReward(uint256 _arenaId) external nonReentrant {
        SeasonalArena storage arena = seasonalArenas[_arenaId];
        require(arena.isResolved, "Arena not resolved");

        uint256 winningOutcome = arena.winningOutcomeId;
        BetPosition storage position = betPositions[_arenaId][winningOutcome][msg.sender];
        require(position.chzAmount > 0 || position.usdcAmount > 0, "No winning position");

        (uint256 chzReward, uint256 usdcReward) = _calculateRewards(_arenaId, winningOutcome, position);
        
        // Clear position
        delete betPositions[_arenaId][winningOutcome][msg.sender];

        // Transfer rewards
        _transferRewards(chzReward, usdcReward);

        emit MegaPrizeWon(_arenaId, msg.sender, chzReward, usdcReward);
    }

    /**
     * @dev Internal function to calculate rewards
     */
    function _calculateRewards(
        uint256 _arenaId,
        uint256 _winningOutcome,
        BetPosition storage _position
    ) internal view returns (uint256 chzReward, uint256 usdcReward) {
        SeasonalArena storage arena = seasonalArenas[_arenaId];
        uint256 totalWinningCHZ = outcomeCHZPots[_arenaId][_winningOutcome];
        uint256 totalWinningUSDC = outcomeUSDCPots[_arenaId][_winningOutcome];

        require(totalWinningCHZ > 0 || totalWinningUSDC > 0, "No winning pot");

        // CHZ rewards (80% of pot)
        if (totalWinningCHZ > 0 && _position.chzAmount > 0) {
            chzReward = arena.chzPot.mul(8000).div(10000).mul(_position.chzAmount).div(totalWinningCHZ);
        }

        // USDC rewards (80% of pot)
        if (totalWinningUSDC > 0 && _position.usdcAmount > 0) {
            usdcReward = arena.usdcPot.mul(8000).div(10000).mul(_position.usdcAmount).div(totalWinningUSDC);
        }

        // Insurance bonus
        if (_position.hasInsurance && arena.protectionTriggered) {
            chzReward = chzReward.add(INSURANCE_FEE.mul(2));
        }
    }

    /**
     * @dev Internal function to transfer rewards
     */
    function _transferRewards(uint256 _chzReward, uint256 _usdcReward) internal {
        if (_chzReward > 0) {
            require(chzToken.transfer(msg.sender, _chzReward), "CHZ transfer failed");
        }
        if (_usdcReward > 0) {
            require(usdcToken.transfer(msg.sender, _usdcReward), "USDC transfer failed");
        }
    }

    /**
     * @dev Internal function to simulate CHZ to USDC conversion
     * In production, this would integrate with a DEX like Uniswap
     */
    function _convertCHZToUSDC(uint256 _chzAmount) internal view returns (uint256) {
        uint256 chzPriceInUSD = volatilityOracle.getCurrentCHZPrice();
        // Assuming USDC has 6 decimals and CHZ has 18 decimals
        // Price is in 8 decimals from oracle
        return _chzAmount.mul(chzPriceInUSD).div(10**20); // 18 + 8 - 6 = 20
    }

    /**
     * @dev Update volatility oracle
     */
    function updateVolatilityOracle(address _newOracle) external onlyOwner {
        volatilityOracle = IVolatilityOracle(_newOracle);
    }

    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get arena details
     */
    function getArenaDetails(uint256 _arenaId) external view returns (
        string memory title,
        SeasonalType seasonalType,
        uint256 chzPot,
        uint256 usdcPot,
        uint256 deadline,
        bool isResolved,
        bool isActive
    ) {
        SeasonalArena storage arena = seasonalArenas[_arenaId];
        return (
            arena.title,
            arena.seasonalType,
            arena.chzPot,
            arena.usdcPot,
            arena.deadline,
            arena.isResolved,
            arena.isActive
        );
    }

    /**
     * @dev Get user bet position
     */
    function getBetPosition(uint256 _arenaId, uint256 _outcomeId, address _user) external view returns (
        uint256 chzAmount,
        uint256 usdcAmount,
        bool hasInsurance,
        uint256 timestamp
    ) {
        BetPosition storage position = betPositions[_arenaId][_outcomeId][_user];
        return (position.chzAmount, position.usdcAmount, position.hasInsurance, position.timestamp);
    }

    /**
     * @dev Emergency withdrawal (owner only)
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
}