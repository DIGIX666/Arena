// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract SimpleDuel is Ownable, ReentrancyGuard, Pausable {
    IERC20 public immutable bettingToken;
    IERC20 public immutable fanToken;
    uint8 public immutable fanTokenDecimals;
    uint8 public immutable bettingTokenDecimals;
    
    uint256 public platformFeePercent = 300;
    uint256 public constant MAX_FEE_PERCENT = 1000; // Maximum 10%
    uint256 public nextDuelId;
    uint256 public pointsPerBetUnit = 20;
    uint256 public fanTokenThreshold;
    uint256 public totalFeesAccumulated;
    
    // User creation features
    uint256 public duelCreationFee = 10 * 10**18; // 10 CHZ par défaut
    bool public userCreationEnabled = true;
    uint256 public constant MAX_USER_DEADLINE = 30 days; // Maximum 30 jours pour les utilisateurs
    
    // Gas relayer system
    mapping(address => uint256) public gasFeeDebt;
    address public gasRelayer;
    uint256 public gasAdvanceFee = 0.1 * 10**18; // ~0.1 USD equivalent in CHZ
    
    // Points system
    mapping(address => uint256) public userPoints;
    uint256 public constant POINTS_PER_DUEL = 50;
    uint256 public constant ARENA_ACTIVATION_POINTS = 100;
    
    // Arena eligibility management
    mapping(uint256 => bool) public duelArenaEligible;
    mapping(address => bool) public moderators;
    
    uint256 public constant RESOLUTION_TIMELOCK = 24 hours;
    mapping(bytes32 => uint256) public pendingResolutions;
    
    struct Duel {
        string title;
        string category;
        bool deprecated_arenaEligible; // Deprecated, use duelArenaEligible mapping instead
        string[3] outcomes;
        uint256 deadline;
        bool isResolved;
        bool isCanceled;
        uint256 winningOutcomeId;
        uint256 potTotal;
        uint256 feesCollected;
        uint256[3] outcomePots;
        address creator; // Créateur du duel
        mapping(address => uint256[3]) betsPerOutcome;
        mapping(address => bool) hasClaimedGains;
        mapping(address => bool) hasClaimedRefund;
    }

    mapping(uint256 => Duel) public duels;
    mapping(uint256 => mapping(address => uint256)) public fanTokenBalanceSnapshot;
    mapping(address => bool) public authorizedResolvers;
    
    event DuelCreated(uint256 indexed duelId, address indexed creator, string title, string category, string[3] outcomes, uint256 deadline);
    event DuelCreationFeeUpdated(uint256 newFee);
    event ArenaEligibilitySet(uint256 indexed duelId, bool eligible);
    event PointsAwarded(address indexed user, uint256 points, string reason);
    event PointsDeducted(address indexed user, uint256 points, string reason);
    event GasAdvanced(address indexed user, uint256 amount);
    event GasDebtRepaid(address indexed user, uint256 amount);
    event ModeratorSet(address indexed moderator, bool status);
    event BetPlaced(uint256 indexed duelId, address indexed user, uint256 outcomeId, uint256 amount, uint256 fanTokenBalance);
    event PointsEarned(address indexed user, uint256 duelId, uint256 points);
    event ArenaEligibleBet(address indexed user, uint256 duelId);
    event DuelResolved(uint256 indexed duelId, uint256 winningOutcomeId);
    event DuelCanceled(uint256 indexed duelId);
    event GainsClaimed(uint256 indexed duelId, address indexed user, uint256 amount, uint256 bonus);
    event RefundIssued(uint256 indexed duelId, address indexed user, uint256 amount);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event ResolverAuthorized(address indexed resolver, bool authorized);
    event ResolutionProposed(uint256 indexed duelId, uint256 winningOutcomeId, uint256 executeAt);

    modifier onlyAuthorizedResolver() {
        require(authorizedResolvers[msg.sender] || msg.sender == owner(), "Not authorized to resolve");
        _;
    }
    
    modifier onlyModerator() {
        require(moderators[msg.sender] || msg.sender == owner(), "Not authorized moderator");
        _;
    }

    constructor(
        address _bettingTokenAddress,
        address _fanTokenAddress,
        uint8 _fanTokenDecimals,
        uint8 _bettingTokenDecimals
    ) Ownable() {
        require(_bettingTokenAddress != address(0), "Invalid betting token");
        require(_fanTokenAddress != address(0), "Invalid fan token");
        
        bettingToken = IERC20(_bettingTokenAddress);
        fanToken = IERC20(_fanTokenAddress);
        fanTokenDecimals = _fanTokenDecimals;
        bettingTokenDecimals = _bettingTokenDecimals;
        fanTokenThreshold = 100 * 10**_fanTokenDecimals;
        
        authorizedResolvers[msg.sender] = true;
        moderators[msg.sender] = true;
        gasRelayer = msg.sender;
    }

    // READ Functions
    function getBettingToken() external view returns (address) {
        return address(bettingToken);
    }

    function getFanToken() external view returns (address) {
        return address(fanToken);
    }

    function getPlatformFeePercent() external view returns (uint256) {
        return platformFeePercent;
    }

    function getDuelInfo(uint256 _duelId) external view returns (
        string memory title,
        string memory category,
        bool arenaEligible,
        string[3] memory outcomes,
        uint256 potTotal,
        uint256 deadline,
        bool isResolved,
        bool isCanceled,
        uint256 winningOutcomeId,
        address creator
    ) {
        Duel storage duel = duels[_duelId];
        return (
            duel.title,
            duel.category,
            duelArenaEligible[_duelId],
            duel.outcomes,
            duel.potTotal,
            duel.deadline,
            duel.isResolved,
            duel.isCanceled,
            duel.winningOutcomeId,
            duel.creator
        );
    }

    function getOutcomePot(uint256 _duelId, uint256 _outcomeId) external view returns (uint256) {
        require(_outcomeId < 3, "Invalid outcome ID");
        return duels[_duelId].outcomePots[_outcomeId];
    }

    function getUserBets(uint256 _duelId, address _user) external view returns (uint256[3] memory) {
        return [
            duels[_duelId].betsPerOutcome[_user][0],
            duels[_duelId].betsPerOutcome[_user][1],
            duels[_duelId].betsPerOutcome[_user][2]
        ];
    }

    function calculatePotentialGains(uint256 _duelId, address _user) external view returns (uint256 baseGains, uint256 bonusGains) {
        Duel storage duel = duels[_duelId];
        if (!duel.isResolved || duel.isCanceled) return (0, 0);

        uint256 winningId = duel.winningOutcomeId;
        uint256 betAmount = duel.betsPerOutcome[_user][winningId];
        if (betAmount == 0) return (0, 0);

        uint256 potWinner = duel.outcomePots[winningId];
        uint256 potNet = duel.potTotal - duel.feesCollected;
        baseGains = (betAmount * potNet) / potWinner;

        if (baseGains < betAmount) {
            baseGains = betAmount;
        }

        // Vérifier le bonus avec le snapshot
        uint256 snapshotBalance = fanTokenBalanceSnapshot[_duelId][_user];
        if (snapshotBalance >= fanTokenThreshold) {
            bonusGains = (baseGains * 500) / 10000; // 5% bonus
        }
    }

    function isDuelBalanced(uint256 _duelId) public view returns (bool) {
        Duel storage duel = duels[_duelId];
        if (duel.potTotal == 0) return false;

        uint256 maxOutcomePot = 0;
        uint256 nonEmptyOutcomes = 0;

        for (uint256 i = 0; i < 3; i++) {
            if (duel.outcomePots[i] > 0) {
                nonEmptyOutcomes++;
                if (duel.outcomePots[i] > maxOutcomePot) {
                    maxOutcomePot = duel.outcomePots[i];
                }
            }
        }

        return nonEmptyOutcomes >= 2 && 
               maxOutcomePot < (duel.potTotal * 8000) / 10000; // Max 80%
    }

    // WRITE Functions
    function createDuel(
        string memory _title,
        string memory _category,
        string[3] memory _outcomes,
        uint256 _deadline
    ) external nonReentrant whenNotPaused {
        require(userCreationEnabled, "User creation is disabled");
        require(_deadline > block.timestamp + 1 hours, "Deadline too soon");
        require(_deadline < block.timestamp + MAX_USER_DEADLINE, "Deadline too far");
        require(bytes(_title).length > 0 && bytes(_title).length <= 100, "Invalid title");
        require(bytes(_category).length > 0 && bytes(_category).length <= 50, "Invalid category");
        
        for (uint256 i = 0; i < 3; i++) {
            require(bytes(_outcomes[i]).length > 0 && bytes(_outcomes[i]).length <= 50, "Invalid outcome");
        }

        uint256 finalCreationFee = duelCreationFee;
        
        // Exonération de frais pour détenteurs de 100+ fan tokens
        if (fanToken.balanceOf(msg.sender) >= fanTokenThreshold) {
            finalCreationFee = 0;
        }
        
        // Avancer les frais de gas via relayer
        if (msg.sender != gasRelayer) {
            gasFeeDebt[msg.sender] += gasAdvanceFee;
            emit GasAdvanced(msg.sender, gasAdvanceFee);
        }

        // Payer les frais de création si > 0
        if (finalCreationFee > 0) {
            require(bettingToken.balanceOf(msg.sender) >= finalCreationFee, "Insufficient balance for creation fee");
            require(bettingToken.transferFrom(msg.sender, address(this), finalCreationFee), "Creation fee payment failed");
            totalFeesAccumulated += finalCreationFee;
        }

        uint256 duelId = nextDuelId;
        Duel storage duel2 = duels[duelId];
        duel2.title = _title;
        duel2.category = _category;
        duel2.outcomes = _outcomes;
        duel2.deadline = _deadline;
        duel2.creator = msg.sender;
        
        // Attribuer 50 points pour la création du duel
        userPoints[msg.sender] += POINTS_PER_DUEL;
        emit PointsAwarded(msg.sender, POINTS_PER_DUEL, "Duel creation");

        emit DuelCreated(duelId, msg.sender, _title, _category, _outcomes, _deadline);
        nextDuelId++;
    }

    function adminCreateDuel(
        string memory _title,
        string memory _category,
        bool _arenaEligible,
        string[3] memory _outcomes,
        uint256 _deadline
    ) external onlyOwner whenNotPaused {
        require(_deadline > block.timestamp + 1 hours, "Deadline too soon");
        require(_deadline < block.timestamp + 365 days, "Deadline too far");
        require(bytes(_title).length > 0 && bytes(_title).length <= 100, "Invalid title");
        require(bytes(_category).length > 0 && bytes(_category).length <= 50, "Invalid category");
        
        for (uint256 i = 0; i < 3; i++) {
            require(bytes(_outcomes[i]).length > 0 && bytes(_outcomes[i]).length <= 50, "Invalid outcome");
        }

        uint256 duelId = nextDuelId;
        Duel storage duel2 = duels[duelId];
        duel2.title = _title;
        duel2.category = _category;
        duel2.outcomes = _outcomes;
        duel2.deadline = _deadline;
        duel2.creator = msg.sender;
        
        // Admin peut directement définir l'éligibilité arène
        if (_arenaEligible) {
            duelArenaEligible[duelId] = true;
        }

        emit DuelCreated(duelId, msg.sender, _title, _category, _outcomes, _deadline);
        if (_arenaEligible) {
            emit ArenaEligibilitySet(duelId, true);
        }
        nextDuelId++;
    }

    function placeBet(uint256 _duelId, uint256 _outcomeId, uint256 _amount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        Duel storage duel2 = duels[_duelId];
        require(_duelId < nextDuelId, "Duel does not exist");
        require(!duel2.isResolved && !duel2.isCanceled, "Duel is resolved or canceled");
        require(block.timestamp < duel2.deadline, "Betting deadline has passed");
        require(_outcomeId < 3, "Invalid outcome ID");
        require(_amount > 0, "Amount must be positive");
        
        // Vérifier les limites de pari
        uint256 minBet = 1 * 10**bettingTokenDecimals; // 1 token minimum
        uint256 maxBet = 10000 * 10**bettingTokenDecimals; 
        require(_amount >= minBet && _amount <= maxBet, "Amount out of bounds");

        require(bettingToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");

        // Snapshot du solde fan token lors du premier pari
        if (fanTokenBalanceSnapshot[_duelId][msg.sender] == 0) {
            fanTokenBalanceSnapshot[_duelId][msg.sender] = fanToken.balanceOf(msg.sender);
        }

        duel2.potTotal += _amount;
        duel2.outcomePots[_outcomeId] += _amount;
        duel2.betsPerOutcome[msg.sender][_outcomeId] += _amount;

        // Calculer les points en fonction des décimales du token
        uint256 points = (_amount * pointsPerBetUnit) / (10**bettingTokenDecimals);
        uint256 fanTokenBalance = fanToken.balanceOf(msg.sender);
        
        emit BetPlaced(_duelId, msg.sender, _outcomeId, _amount, fanTokenBalance);
        emit PointsEarned(msg.sender, _duelId, points);
        
        if (duelArenaEligible[_duelId]) {
            emit ArenaEligibleBet(msg.sender, _duelId);
        }
    }

    function proposeResolution(uint256 _duelId, uint256 _winningOutcomeId) 
        external 
        onlyAuthorizedResolver 
    {
        Duel storage duel2 = duels[_duelId];
        require(!duel2.isResolved && !duel2.isCanceled, "Duel is resolved or canceled");
        require(_winningOutcomeId < 3, "Invalid winning outcome");
        require(block.timestamp >= duel2.deadline, "Deadline not reached");
        require(duel2.outcomePots[_winningOutcomeId] > 0, "No bets on winning outcome");
        require(isDuelBalanced(_duelId), "Duel is not balanced");

        bytes32 proposalId = keccak256(abi.encode(_duelId, _winningOutcomeId));
        uint256 executeAt = block.timestamp + RESOLUTION_TIMELOCK;
        pendingResolutions[proposalId] = executeAt;

        emit ResolutionProposed(_duelId, _winningOutcomeId, executeAt);
    }

    function executeResolution(uint256 _duelId, uint256 _winningOutcomeId) 
        external 
        onlyAuthorizedResolver 
    {
        bytes32 proposalId = keccak256(abi.encode(_duelId, _winningOutcomeId));
        require(pendingResolutions[proposalId] != 0, "No pending resolution");
        require(block.timestamp >= pendingResolutions[proposalId], "Timelock not expired");

        Duel storage duel2 = duels[_duelId];
        require(!duel2.isResolved && !duel2.isCanceled, "Duel is resolved or canceled");

        // Calculer et stocker les fees
        uint256 fees = (duel2.potTotal * platformFeePercent) / 10000;
        duel2.feesCollected = fees;
        totalFeesAccumulated += fees;

        duel2.isResolved = true;
        duel2.winningOutcomeId = _winningOutcomeId;
        
        delete pendingResolutions[proposalId];
        
        emit DuelResolved(_duelId, _winningOutcomeId);
    }

    function validateAndCancelDuel(uint256 _duelId) external onlyOwner {
        Duel storage duel2 = duels[_duelId];
        require(!duel2.isResolved && !duel2.isCanceled, "Duel is resolved or already canceled");
        require(block.timestamp >= duel2.deadline, "Deadline not reached");
        require(!isDuelBalanced(_duelId), "Duel is balanced and cannot be canceled");

        duel2.isCanceled = true;
        emit DuelCanceled(_duelId);
    }

    function claimGains(uint256 _duelId) external nonReentrant {
        Duel storage duel2 = duels[_duelId];
        require(duel2.isResolved, "Duel is not resolved");
        require(!duel2.isCanceled, "Duel is canceled");
        require(!duel2.hasClaimedGains[msg.sender], "Already claimed");

        uint256 winningId = duel2.winningOutcomeId;
        uint256 betAmount = duel2.betsPerOutcome[msg.sender][winningId];
        require(betAmount > 0, "No winning bets");

        duel2.hasClaimedGains[msg.sender] = true;

        uint256 potWinner = duel2.outcomePots[winningId];
        uint256 potNet = duel2.potTotal - duel2.feesCollected;
        uint256 baseGain = (betAmount * potNet) / potWinner;

        if (baseGain < betAmount) {
            baseGain = betAmount;
        }

        uint256 bonus = 0;
        uint256 snapshotBalance = fanTokenBalanceSnapshot[_duelId][msg.sender];
        if (snapshotBalance >= fanTokenThreshold) {
            bonus = (baseGain * 500) / 10000; // 5% bonus
        }
        
        // Rembourser la dette de gas si applicable
        uint256 gasDebt = gasFeeDebt[msg.sender];
        uint256 gasRepayment = 0;
        if (gasDebt > 0) {
            gasRepayment = gasDebt > baseGain ? baseGain : gasDebt;
            gasFeeDebt[msg.sender] -= gasRepayment;
            baseGain -= gasRepayment;
            emit GasDebtRepaid(msg.sender, gasRepayment);
        }

        uint256 totalPayout = baseGain + bonus;
        require(bettingToken.balanceOf(address(this)) >= totalPayout, "Contract has insufficient balance");
        require(bettingToken.transfer(msg.sender, totalPayout), "Payout failed");

        emit GainsClaimed(_duelId, msg.sender, baseGain, bonus);
    }

    function claimRefund(uint256 _duelId) external nonReentrant {
        Duel storage duel2 = duels[_duelId];
        require(duel2.isCanceled, "Duel is not canceled");
        require(!duel2.hasClaimedRefund[msg.sender], "Already claimed refund");

        uint256 refundAmount = duel2.betsPerOutcome[msg.sender][0] + 
                              duel2.betsPerOutcome[msg.sender][1] + 
                              duel2.betsPerOutcome[msg.sender][2];
        require(refundAmount > 0, "No bets to refund");

        duel2.hasClaimedRefund[msg.sender] = true;
        require(bettingToken.balanceOf(address(this)) >= refundAmount, "Contract has insufficient balance");
        require(bettingToken.transfer(msg.sender, refundAmount), "Refund failed");

        emit RefundIssued(_duelId, msg.sender, refundAmount);
    }

    // Admin Functions
    function withdrawFees(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid address");
        require(_amount <= totalFeesAccumulated, "Amount exceeds accumulated fees");
        require(bettingToken.balanceOf(address(this)) >= _amount, "Contract has insufficient balance");
        
        totalFeesAccumulated -= _amount;
        require(bettingToken.transfer(_to, _amount), "Fee withdrawal failed");
        
        emit FeesWithdrawn(_to, _amount);
    }

    function setPlatformFeePercent(uint256 _newFee) external onlyOwner {
        require(_newFee <= MAX_FEE_PERCENT, "Fee too high");
        platformFeePercent = _newFee;
    }

    function setFanTokenThreshold(uint256 _newThreshold) external onlyOwner {
        fanTokenThreshold = _newThreshold;
    }

    function setPointsPerBetUnit(uint256 _newPoints) external onlyOwner {
        require(_newPoints > 0 && _newPoints <= 1000, "Invalid points value");
        pointsPerBetUnit = _newPoints;
    }

    function authorizeResolver(address _resolver, bool _authorized) external onlyOwner {
        require(_resolver != address(0), "Invalid resolver address");
        authorizedResolvers[_resolver] = _authorized;
        emit ResolverAuthorized(_resolver, _authorized);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function emergencyWithdraw(address _token, address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid address");
        IERC20(_token).transfer(_to, _amount);
    }

    function setDuelCreationFee(uint256 _newFee) external onlyOwner {
        duelCreationFee = _newFee;
        emit DuelCreationFeeUpdated(_newFee);
    }

    function toggleUserCreation(bool _enabled) external onlyOwner {
        userCreationEnabled = _enabled;
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        _transferOwnership(newOwner);
    }
    
    // New functions for simplified duel management
    function setArenaEligible(uint256 _duelId, bool _eligible) external onlyModerator {
        require(_duelId < nextDuelId, "Duel does not exist");
        duelArenaEligible[_duelId] = _eligible;
        emit ArenaEligibilitySet(_duelId, _eligible);
    }
    
    function setModerator(address _moderator, bool _status) external onlyOwner {
        require(_moderator != address(0), "Invalid moderator address");
        moderators[_moderator] = _status;
        emit ModeratorSet(_moderator, _status);
    }
    
    function setGasRelayer(address _relayer) external onlyOwner {
        require(_relayer != address(0), "Invalid relayer address");
        gasRelayer = _relayer;
    }
    
    function setGasAdvanceFee(uint256 _fee) external onlyOwner {
        gasAdvanceFee = _fee;
    }
    
    function canActivateArena(address _user) external view returns (bool) {
        return userPoints[_user] >= ARENA_ACTIVATION_POINTS;
    }
    
    function activateArenaWithPoints(uint256 _duelId) external {
        require(_duelId < nextDuelId, "Duel does not exist");
        require(duels[_duelId].creator == msg.sender, "Not duel creator");
        require(userPoints[msg.sender] >= ARENA_ACTIVATION_POINTS, "Insufficient points");
        require(!duelArenaEligible[_duelId], "Already arena eligible");
        
        userPoints[msg.sender] -= ARENA_ACTIVATION_POINTS;
        duelArenaEligible[_duelId] = true;
        
        emit ArenaEligibilitySet(_duelId, true);
        emit PointsDeducted(msg.sender, ARENA_ACTIVATION_POINTS, "Arena activation");
    }
    
    function getUserPoints(address _user) external view returns (uint256) {
        return userPoints[_user];
    }
    
    function getGasFeeDebt(address _user) external view returns (uint256) {
        return gasFeeDebt[_user];
    }
    
    function manualGasRepayment(address _user, uint256 _amount) external onlyOwner {
        require(gasFeeDebt[_user] >= _amount, "Amount exceeds debt");
        gasFeeDebt[_user] -= _amount;
        require(bettingToken.transferFrom(_user, address(this), _amount), "Repayment failed");
        emit GasDebtRepaid(_user, _amount);
    }
}
