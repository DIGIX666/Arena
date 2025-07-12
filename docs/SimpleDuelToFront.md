# SimpleDuel.sol

## READ functions

**getBettingToken()** -> Returns betting token address
**getFanToken()** -> Returns fan token address
**getPlatformFeePercent()** -> Returns platform fee percentage
**nextDuelId()** -> Returns next duel ID counter
**pointsPerBetUnit()** -> Returns points earned per bet unit
**fanTokenThreshold()** -> Returns minimum fan tokens for bonus
**totalFeesAccumulated()** -> Returns total accumulated platform fees
**duelCreationFee()** -> Returns fee to create a duel
**userCreationEnabled()** -> Returns if users can create duels
**gasAdvanceFee()** -> Returns gas advance fee amount
**userPoints(address _user)** -> Returns user's accumulated points
**gasFeeDebt(address _user)** -> Returns user's gas debt
**gasRelayer()** -> Returns gas relayer address
**duelArenaEligible(uint256 _duelId)** -> Returns if duel is arena eligible
**moderators(address _moderator)** -> Returns if address is moderator
**authorizedResolvers(address _resolver)** -> Returns if address can resolve duels
**fanTokenBalanceSnapshot(uint256 _duelId, address _user)** -> Returns fan token snapshot for bonus calculation
**getDuelInfo(uint256 _duelId)** -> Returns complete duel information (title, category, eligibility, outcomes, pot, deadline, status, creator)
**getOutcomePot(uint256 _duelId, uint256 _outcomeId)** -> Returns specific outcome pot amount
**getUserBets(uint256 _duelId, address _user)** -> Returns user's bets per outcome
**calculatePotentialGains(uint256 _duelId, address _user)** -> Returns potential gains (base + bonus) for resolved duel
**isDuelBalanced(uint256 _duelId)** -> Returns if duel has balanced betting across outcomes

## WRITE functions

**createDuel(string _title, string _category, bool _arenaEligible, string[3] _outcomes, uint256 _deadline)** -> Create new duel
**placeBet(uint256 _duelId, uint256 _outcomeId, uint256 _amount)** -> Place bet on outcome
**proposeResolution(uint256 _duelId, uint256 _winningOutcomeId)** -> Propose resolution with timelock
**executeResolution(uint256 _duelId, uint256 _winningOutcomeId)** -> Execute resolution after timelock
**validateAndCancelDuel(uint256 _duelId)** -> Cancel duel if rules not met
**claimGains(uint256 _duelId)** -> Claim winnings from resolved duel
**claimRefund(uint256 _duelId)** -> Claim refund from canceled duel
**advanceGasForUser(address _user, uint256 _amount)** -> Advance gas fees for user
**repayGasDebt(uint256 _amount)** -> Repay gas debt
**setDuelCreationFee(uint256 _newFee)** -> Set creation fee for user-created duels
**setUserCreationEnabled(bool _enabled)** -> Enable/disable user duel creation
**setGasAdvanceFee(uint256 _newFee)** -> Set gas advance fee amount
**setGasRelayer(address _newRelayer)** -> Set gas relayer address
**setArenaEligibility(uint256 _duelId, bool _eligible)** -> Set arena eligibility for duel
**setModerator(address _moderator, bool _status)** -> Add/remove moderator
**setPlatformFeePercent(uint256 _feePercent)** -> Set platform fee percentage
**setFanTokenThreshold(uint256 _threshold)** -> Set minimum fan tokens for bonus
**setPointsPerBetUnit(uint256 _points)** -> Set points earned per bet unit
**authorizeResolver(address _resolver, bool _authorized)** -> Authorize/deauthorize resolver
**withdrawFees(address _to)** -> Withdraw accumulated platform fees
**pause()** -> Pause contract
**unpause()** -> Unpause contract

## Events

**DuelCreated(uint256 indexed duelId, address indexed creator, string title, string category, string[3] outcomes, uint256 deadline)** -> New duel created
**BetPlaced(uint256 indexed duelId, address indexed user, uint256 outcomeId, uint256 amount, uint256 fanTokenBalance)** -> Bet placed
**PointsEarned(address indexed user, uint256 duelId, uint256 points)** -> Points earned from betting
**ArenaEligibleBet(address indexed user, uint256 duelId)** -> User bet on arena-eligible duel
**DuelResolved(uint256 indexed duelId, uint256 winningOutcomeId)** -> Duel resolved
**DuelCanceled(uint256 indexed duelId)** -> Duel canceled
**GainsClaimed(uint256 indexed duelId, address indexed user, uint256 amount, uint256 bonus)** -> Gains claimed
**RefundIssued(uint256 indexed duelId, address indexed user, uint256 amount)** -> Refund issued
**ArenaEligibilitySet(uint256 indexed duelId, bool eligible)** -> Arena eligibility changed
**PointsAwarded(address indexed user, uint256 points, string reason)** -> Points manually awarded
**GasAdvanced(address indexed user, uint256 amount)** -> Gas advanced to user
**GasDebtRepaid(address indexed user, uint256 amount)** -> Gas debt repaid

## Constants

**MAX_FEE_PERCENT** = 1000 (Maximum 10% platform fee)
**MAX_USER_DEADLINE** = 30 days (Maximum deadline for user-created duels)
**POINTS_PER_DUEL** = 50 (Points for creating arena-eligible duel)
**ARENA_ACTIVATION_POINTS** = 100 (Points needed to activate arena features)
**RESOLUTION_TIMELOCK** = 24 hours (Delay before resolution execution)

## Default Values
- **Platform Fee**: 300 (3%)
- **Points Per Bet Unit**: 20
- **Fan Token Threshold**: 100 fan tokens
- **Duel Creation Fee**: 10 CHZ
- **Gas Advance Fee**: 0.1 CHZ equivalent

### USER functions
**placeBet()** -> Place bets on outcomes
**claimGains()** -> Claim winnings
**claimRefund()** -> Claim refunds
**createDuel()** -> Create duels (if enabled and fee paid)
**repayGasDebt()** -> Repay gas advances

### MODERATOR functions
**setArenaEligibility()** -> Manage arena eligibility
**validateAndCancelDuel()** -> Cancel invalid duels

### RESOLVER functions
**proposeResolution()** -> Propose duel resolutions
**executeResolution()** -> Execute approved resolutions

### OWNER functions
#### Manage Duels
**createDuel()** -> Create duels without restrictions
**validateAndCancelDuel()** -> Cancel duels

#### Manage Parameters
**setPlatformFeePercent()** -> Set fee percentage
**setFanTokenThreshold()** -> Set bonus threshold
**setPointsPerBetUnit()** -> Set point rewards
**setDuelCreationFee()** -> Set creation fee
**setUserCreationEnabled()** -> Enable/disable user creation

#### Manage Roles
**authorizeResolver()** -> Manage resolvers
**setModerator()** -> Manage moderators
**setGasRelayer()** -> Set gas relayer

#### System Management
**withdrawFees()** -> Withdraw platform fees
**pause()/unpause()** -> Emergency controls

## Key Features
- **User Duel Creation**: Users can create duels with fee payment
- **Points System**: Earn points for betting and creating duels
- **Fan Token Bonuses**: 5% bonus for users with sufficient fan tokens
- **Gas Relay System**: Advanced gas fees for users
- **Arena Integration**: Duels can be marked as arena-eligible
- **Timelock Resolution**: 24-hour delay for resolution security
- **Balanced Duel Detection**: Automatic detection of fair betting distribution
- **Moderation System**: Multiple roles for governance and management

## Betting Flow
1. User creates duel (with fee) or owner creates duel
2. Users place bets with fan token balance snapshot
3. Points awarded based on bet amount and arena eligibility
4. Resolver proposes resolution (24h timelock)
5. Resolution executed, gains/refunds available for claim
6. Users claim gains with potential fan token bonus