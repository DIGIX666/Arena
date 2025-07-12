# MockVolatilityOracle.sol

## READ functions

**owner()** -> Returns contract owner address
**getCurrentCHZPrice()** -> Returns current CHZ price with 8 decimals (e.g., 12000000 = $0.12)
**getVolatilityPercent()** -> Returns current volatility percentage (e.g., 2000 = 20%)
**getVolatilityData()** -> Returns complete volatility data structure
**shouldTriggerProtection(uint256 _threshold)** -> Returns if volatility exceeds protection threshold
**shouldTriggerEmergency(uint256 _crashThreshold)** -> Returns if emergency mode and volatility exceeds crash threshold

## WRITE functions

**updatePriceData()** -> Update last update timestamp and emit price event
**setEmergencyMode(bool _emergencyMode)** -> Set emergency mode on/off (owner only)
**setPrice(uint256 _price)** -> Set CHZ price manually for testing (owner only)
**setVolatilityPercent(uint256 _volatilityPercent)** -> Set volatility percentage for testing (owner only)
**setVolatilityData(uint256 _price, uint256 _volatilityPercent, bool _emergencyMode)** -> Set all volatility data at once (owner only)

## Events

**PriceUpdated(uint256 price, uint256 volatilityPercent)** -> Price or volatility data updated
**VolatilityThresholdReached(uint256 volatilityPercent, uint256 threshold)** -> Volatility threshold reached
**EmergencyModeTriggered(uint256 volatilityPercent)** -> Emergency mode activated

## Data Structure

**VolatilityData** struct contains:
- **currentPrice** (uint256): CHZ price with 8 decimals
- **volatilityPercent** (uint256): Volatility percentage (basis points, e.g., 2000 = 20%)
- **lastUpdateTime** (uint256): Last update timestamp
- **emergencyMode** (bool): Emergency mode status

## Default Values
- **Initial Price**: 12000000 (equivalent to $0.12)
- **Initial Volatility**: 2000 (20%)
- **Emergency Mode**: false
- **Update Time**: Contract deployment timestamp

### PUBLIC functions
**updatePriceData()** -> Anyone can trigger price update (updates timestamp only)

### OWNER functions
#### Data Management
**setEmergencyMode()** -> Enable/disable emergency mode
**setPrice()** -> Manually set CHZ price for testing
**setVolatilityPercent()** -> Manually set volatility percentage
**setVolatilityData()** -> Set all parameters at once

## Key Features
- **Interface Implementation**: Full IVolatilityOracle interface compliance
- **Manual Control**: Owner can set any price/volatility values for testing
- **Threshold Checking**: Built-in logic for protection and emergency thresholds
- **Event Emission**: Proper events for price updates and emergency triggers
- **Emergency Mode**: Separate flag for emergency conditions

## Testing Use Cases
- **Volatility Protection**: Set volatility above threshold to test protection triggers
- **Emergency Scenarios**: Enable emergency mode to test crash protection
- **Price Manipulation**: Set various prices to test conversion calculations
- **Threshold Testing**: Test different threshold values for protection systems

## Integration with SeasonalNFTArena
- Used for volatility protection triggers at 30% threshold
- Used for emergency conversion at 40% crash threshold
- Provides CHZ price for USDC conversion calculations
- Enables automatic protection mechanisms

## Note
This is a MOCK contract for testing only. Real production would integrate with external price feeds like Chainlink oracles.