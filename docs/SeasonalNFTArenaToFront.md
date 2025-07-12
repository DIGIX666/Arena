# SeasonalNFTArena.sol

## READ functions

**chzToken()** -> Returns CHZ token address
**usdcToken()** -> Returns USDC token address  
**fanToken()** -> Returns fan token address
**volatilityOracle()** -> Returns volatility oracle address
**nextArenaId()** -> Returns next arena ID counter
**seasonalArenas(uint256 _arenaId)** -> Returns arena structure (title, outcomes, type, timing, pots, settings)
**outcomeCHZPots(uint256 _arenaId, uint256 _outcomeId)** -> Returns CHZ pot for specific outcome
**outcomeUSDCPots(uint256 _arenaId, uint256 _outcomeId)** -> Returns USDC pot for specific outcome
**betPositions(uint256 _arenaId, uint256 _outcomeId, address _user)** -> Returns user bet position (CHZ/USDC amounts, insurance, timestamp)
**arenaAccumulation(uint256 _arenaId)** -> Returns accumulated reinvestment funds for arena
**getArenaDetails(uint256 _arenaId)** -> Returns arena overview (title, type, pots, deadline, status)
**getBetPosition(uint256 _arenaId, uint256 _outcomeId, address _user)** -> Returns user betting position details

## WRITE functions

**createSeasonalArena(string _title, string[] _outcomeNames, SeasonalType _seasonalType, uint256 _entryFeeCHZ, uint256 _duration)** -> Create new seasonal arena
**enterSeasonal(uint256 _arenaId, uint256 _outcomeId, bool _withInsurance)** -> Enter arena with bet and optional insurance
**triggerVolatilityProtection(uint256 _arenaId)** -> Trigger automatic volatility protection (converts 50% CHZ to USDC)
**emergencyConvert(uint256 _arenaId)** -> Emergency conversion for severe CHZ crash (converts 70% CHZ to USDC)
**accumulateIntoPot(uint256 _arenaId)** -> Add accumulated fees into arena pot
**resolveSeasonal(uint256 _arenaId, uint256 _winningOutcomeId)** -> Resolve seasonal arena with winning outcome
**claimSeasonalReward(uint256 _arenaId)** -> Claim rewards for winning position
**updateVolatilityOracle(address _newOracle)** -> Update volatility oracle address
**pause()** -> Emergency pause contract
**unpause()** -> Unpause contract
**emergencyWithdraw(address _token, uint256 _amount)** -> Emergency token withdrawal

## Constants

**MAX_DURATION** = 90 days (3 months maximum)
**VOLATILITY_THRESHOLD** = 3000 (30% volatility threshold)
**EMERGENCY_THRESHOLD** = 4000 (40% crash threshold)
**PLATFORM_FEE** = 2000 (20%)
**PARTNER_FEE** = 1000 (10%)
**IMMEDIATE_POT** = 4000 (40%)
**REINVESTMENT_FEE** = 3000 (30%)
**MIN_FAN_TOKENS** = 2000 CHZ (minimum fan tokens required)
**INSURANCE_FEE** = 20 CHZ (insurance cost)

## Seasonal Types (enum)

**ChampionsLeague** = 0 (3 months)
**TransferWindow** = 1 (3 months)
**BallonDor** = 2 (6 months max)
**WorldCupQualifiers** = 3 (3 months cycles)

### USER functions
**enterSeasonal()** -> Place bet with optional insurance
**claimSeasonalReward()** -> Claim winnings
**triggerVolatilityProtection()** -> Anyone can trigger protection

### OWNER functions
#### Manage Arenas
**createSeasonalArena()** -> Create new seasonal prediction arena
**resolveSeasonal()** -> Resolve arena with winning outcome
**accumulateIntoPot()** -> Add accumulated fees to pot

#### Manage Protection
**emergencyConvert()** -> Emergency CHZ conversion during crash
**updateVolatilityOracle()** -> Update price/volatility oracle

#### Manage System
**pause()/unpause()** -> Emergency controls
**emergencyWithdraw()** -> Emergency fund recovery

## Fee Distribution
Entry fee breakdown:
- 40% -> Immediate pot (60% CHZ, 40% converted to USDC)
- 30% -> Reinvestment accumulation
- 20% -> Platform fee
- 10% -> Partner fee

## Key Features
- **Dual-asset pots**: CHZ and USDC for stability
- **Volatility protection**: Automatic conversion during high volatility
- **Insurance system**: Optional protection for users
- **Long-term predictions**: Up to 3-6 months duration
- **Mega-prize distribution**: 80% to winners, 20% platform retention
- **Fan token requirement**: 2000 minimum fan tokens to participate