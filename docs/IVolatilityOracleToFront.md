# IVolatilityOracle.sol (Interface)

## READ functions

**getCurrentCHZPrice()** -> Returns current CHZ price in USD with 8 decimals
**getVolatilityPercent()** -> Returns 7-day volatility percentage with 2 decimals (e.g., 3000 = 30.00%)
**getVolatilityData()** -> Returns complete VolatilityData structure
**shouldTriggerProtection(uint256 _threshold)** -> Check if volatility protection should be triggered
**shouldTriggerEmergency(uint256 _crashThreshold)** -> Check if emergency conversion should be triggered

## WRITE functions

**updatePriceData()** -> Update price data (called by oracle keepers)
**setEmergencyMode(bool _emergencyMode)** -> Set emergency mode (admin only)

## Data Structure

**VolatilityData** struct contains:
- **currentPrice** (uint256): Current CHZ price in USD with 8 decimals
- **volatilityPercent** (uint256): 7-day volatility percentage with 2 decimals
- **lastUpdateTime** (uint256): Timestamp of last update
- **emergencyMode** (bool): Emergency mode flag

## Events

**PriceUpdated(uint256 indexed price, uint256 indexed volatility)** -> Price or volatility updated
**VolatilityThresholdReached(uint256 indexed volatility, uint256 indexed threshold)** -> Volatility threshold reached
**EmergencyModeTriggered(uint256 indexed crashPercent)** -> Emergency mode activated

## Function Specifications

### Price Functions
- **getCurrentCHZPrice()**: Returns price with 8 decimal precision (e.g., 12000000 = $0.12)
- **getVolatilityPercent()**: Returns volatility as basis points (e.g., 3000 = 30%)

### Protection Logic
- **shouldTriggerProtection()**: Returns true if current volatility >= threshold
- **shouldTriggerEmergency()**: Returns true if emergency mode AND volatility >= crash threshold

### Update Functions
- **updatePriceData()**: Updates timestamp and can trigger price events
- **setEmergencyMode()**: Enables/disables emergency protection mode

## Integration Points

### With SeasonalNFTArena
- **VOLATILITY_THRESHOLD** = 3000 (30%) for automatic protection
- **EMERGENCY_THRESHOLD** = 4000 (40%) for crash protection
- Used for CHZ to USDC conversion calculations
- Triggers automatic pot protection mechanisms

### With Other Contracts
- Can be used by any contract needing CHZ price data
- Provides standardized volatility monitoring
- Enables automated protection systems

## Implementation Requirements

### For Production Oracle
- Must integrate with external price feeds (Chainlink, etc.)
- Should implement keeper network for updates
- Must have proper access controls
- Should include data validation and circuit breakers

### For Testing (MockVolatilityOracle)
- Manual control over all parameters
- Ability to simulate various market conditions
- Event emission for integration testing

## Key Features
- **Standardized Interface**: Common interface for all volatility oracles
- **Flexible Thresholds**: Configurable protection and emergency levels
- **Event-Driven**: Proper events for monitoring and automation
- **Emergency Mode**: Separate emergency flag for extreme conditions
- **Time Tracking**: Last update timestamps for freshness validation

## Usage Patterns
1. Regular monitoring of volatility levels
2. Automatic protection trigger when thresholds exceeded
3. Emergency conversion during market crashes
4. Price data for conversion calculations
5. Integration with automated protection systems