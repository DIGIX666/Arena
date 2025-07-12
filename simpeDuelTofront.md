# SimpleDuel.sol

## READ functions

**getBettingToken()**  -> Returns betting token address
**getFanToken()** ->  fan token address
**getPlateformFeePercent()** ->  plateform fee
**getDuelInfo(uint256 _duelId)** ->  duel informations (title, category, eligibility arena, results, pot total, deadline, state)
**getOutcomePot(uint256 _duelID, uint256 _outcomeId)** ->  specific result duel pot
**getUsersBets(uint256 _duelId, address _user)** ->  user betting for one duel(per result)
**calculatePotentialGains(uint256 _duelId, address _user)** ->  calculate potential gains(base + bonus) for one user on resolved duel
**isDualBalanced(uint256 _duelId)** ->  verification if duel is balanced 

## WRITE functions
**createDuel(string _title, string _category, bool _arenaEligible, string[3] _outcomes, uint256 _deadline)**   
**placeBet(uint 256 _duelId, uint256 _outcomeId, uint256 _amount)** ->  Place bet
**proposeResolution(uint256 _duelId, uint256 _winningOutcomeId)** ->  propose resolved for duel (resolved autorized (AI, Admin))
**executeResolution(uint256 _duelId, uint256 _winningOutcomeId)** ->  execute resolution of one duel after deadline. (Duel terminated)
**validateAndCancelDuel(uint256 _duelID)** ->  Cancel duel if don't respect rules (equity, bet player < min...)
**claimGains(uint256 _duelId)** ->  User can reclaims gains after duel resolved
**claimRefund(uint256 _duelId)** ->  User can reclaims refund after duel canceled

### USER function
**placeBet()**
**claimGains()**
**claimRefund()**

### Owner function
#### Manage duels
**createDuel()**
**ValidateAndCancelDuel()**

#### Manage parameters
**setPlateformFeePercent()**
**setFanTokenThreshold()**
**setPointsPerBetUnit()**

#### Manage Resolve
**authorizeResolver()**

