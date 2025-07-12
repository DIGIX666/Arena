# ERC20Mock.sol

## READ functions

**name()** -> Returns token name
**symbol()** -> Returns token symbol
**decimals()** -> Returns token decimals (customizable)
**totalSupply()** -> Returns total token supply
**balanceOf(address _account)** -> Returns token balance of account
**allowance(address _owner, address _spender)** -> Returns approved allowance

## WRITE functions

**mint(address _to, uint256 _amount)** -> Mint tokens to specified address
**burn(address _from, uint256 _amount)** -> Burn tokens from specified address
**setDecimals(uint8 _newDecimals)** -> Change decimal places for testing
**mintAndApprove(address _to, uint256 _amount, address _spender)** -> Mint and approve in one transaction
**setTransferShouldFail(bool _shouldFail)** -> Enable transfer failure simulation for testing
**resetBalance(address _account)** -> Reset account balance to zero
**setBalance(address _account, uint256 _amount)** -> Set specific balance for account
**transfer(address _to, uint256 _amount)** -> Transfer tokens (with failure simulation)
**transferFrom(address _from, address _to, uint256 _amount)** -> Transfer from approved account (with failure simulation)
**approve(address _spender, uint256 _amount)** -> Approve spending allowance
**increaseAllowance(address _spender, uint256 _addedValue)** -> Increase allowance
**decreaseAllowance(address _spender, uint256 _subtractedValue)** -> Decrease allowance

## Events

**Transfer(address indexed from, address indexed to, uint256 value)** -> Token transferred
**Approval(address indexed owner, address indexed spender, uint256 value)** -> Allowance approved

## Testing Features

**_transferShouldFail** -> Internal flag to simulate transfer failures
**Transfer Failure Simulation** -> Transfers can be made to fail once for testing error handling
**Balance Manipulation** -> Direct balance setting for test scenarios
**Decimal Customization** -> Adjustable decimal places for different token types

### PUBLIC functions (No restrictions)
**mint()** -> Anyone can mint tokens for testing
**burn()** -> Anyone can burn tokens for testing
**setDecimals()** -> Anyone can change decimals for testing
**mintAndApprove()** -> Utility function for quick setup
**setTransferShouldFail()** -> Enable/disable transfer failures
**resetBalance()** -> Reset any account balance
**setBalance()** -> Set any account balance
**transfer()** -> Standard ERC20 transfer
**transferFrom()** -> Standard ERC20 transferFrom
**approve()** -> Standard ERC20 approve

### Standard ERC20 functions
**increaseAllowance()** -> Increase spending allowance
**decreaseAllowance()** -> Decrease spending allowance

## Key Features
- **Unrestricted Minting**: Anyone can mint tokens for testing purposes
- **Failure Simulation**: Can simulate transfer failures for error testing
- **Balance Manipulation**: Direct balance setting for test scenarios
- **Customizable Decimals**: Adjustable decimal places
- **Utility Functions**: Combined operations like mintAndApprove
- **Standard Compliance**: Full ERC20 compatibility

## Testing Use Cases
- **Token Supply Testing**: Mint unlimited tokens for testing
- **Error Handling**: Simulate transfer failures
- **Balance Scenarios**: Set specific balances for different test cases
- **Approval Testing**: Test allowance mechanisms
- **Decimal Precision**: Test with different decimal configurations

## Note
This is a MOCK contract for testing only. It has no access controls and allows unrestricted token manipulation. DO NOT use in production.
